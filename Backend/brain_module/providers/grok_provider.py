"""
Grok Provider Implementation

Implements Grok API integration with comprehensive error handling,
metrics tracking, and fallback support.
"""

import time
import logging
from typing import Dict, List, Optional, Any, Tuple
import requests
from datetime import datetime

from .api_key_manager import APIKeyManager, APIKeyConfig
from .circuit_breaker_manager import CircuitBreaker, CircuitBreakerConfig, CircuitBreakerOpenError
from .metrics_tracker import MetricsTracker


class GrokProvider:
    """Grok provider implementation"""
    
    # Available Grok models
    SUPPORTED_MODELS = [
        "grok-beta",           # Default Grok beta model
        "grok-vision-beta",    # Grok with vision capabilities
        "llama-3.1-70b-versatile",  # Meta Llama through Groq
        "llama-3.1-8b-instant",     # Fast Llama model
        "mixtral-8x7b-32768"        # Mistral mixture of experts
    ]
    
    def __init__(self, metrics_tracker: MetricsTracker, logger: logging.Logger = None):
        self.metrics_tracker = metrics_tracker
        self.logger = logger or logging.getLogger(__name__)
        
        # Initialize components
        self.key_manager = APIKeyManager("grok")
        
        # Circuit breaker for Grok API
        circuit_config = CircuitBreakerConfig(
            failure_threshold=5,
            recovery_timeout=60,
            success_threshold=3,
            timeout=30,
            name="grok"
        )
        self.circuit_breaker = CircuitBreaker(circuit_config)
        
        # Model configuration
        self.model_configs = {}
        self.default_model = "grok-beta"
        
        self.logger.info("Grok provider initialized")
    
    def add_api_key(self, key_env: str, name: str = "primary", priority: int = 1, 
                   daily_limit: int = 1000, enabled: bool = True) -> bool:
        """Add an API key to the manager"""
        config = APIKeyConfig(
            key_env=key_env,
            name=name,
            priority=priority,
            daily_limit=daily_limit,
            usage_reset_hour=0,  # UTC midnight
            enabled=enabled
        )
        
        success = self.key_manager.add_key(config)
        if success:
            self.logger.info(f"Added Grok API key: {name} ({key_env})")
        return success
    
    def configure_model(self, model_name: str, max_tokens: int = 4000, 
                       temperature: float = 0.7, enabled: bool = True):
        """Configure a model for use"""
        if model_name not in self.SUPPORTED_MODELS:
            self.logger.warning(f"Model {model_name} not in supported list, adding anyway")
        
        self.model_configs[model_name] = {
            'max_tokens': max_tokens,
            'temperature': temperature,
            'enabled': enabled,
            'configured_at': datetime.utcnow().isoformat()
        }
        
        self.logger.info(f"Configured model: {model_name}")
    
    def _get_headers_for_key(self, key_name: str) -> Dict[str, str]:
        """Get headers for a specific API key"""
        api_key = self.key_manager.get_key_value(key_name)
        if not api_key:
            raise ValueError(f"No API key found for {key_name}")
        
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def _make_request_with_retry(self, model: str, messages: List[Dict], 
                                max_tokens: int = None, temperature: float = None, 
                                retries: int = 3, base_delay: float = 1.0, 
                                key_name: str = None) -> Dict:
        """Make request with exponential backoff retry logic"""
        model_config = self.model_configs.get(model, {})
        max_tokens = max_tokens or model_config.get('max_tokens', 4000)
        temperature = temperature or model_config.get('temperature', 0.7)
        
        if not key_name:
            key_name = self.key_manager.get_best_key()
            if not key_name:
                raise ValueError("No available API keys for Grok")
        
        headers = self._get_headers_for_key(key_name)
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        last_error = None
        
        for attempt in range(retries + 1):
            try:
                start_time = time.time()
                
                # Make the actual API call through circuit breaker
                def _api_call():
                    response = requests.post(url, headers=headers, json=payload, timeout=30)
                    
                    if response.status_code != 200:
                        raise Exception(f"HTTP {response.status_code}: {response.text}")
                    
                    return response.json()
                
                response_data = self.circuit_breaker.call(_api_call)
                response_time = time.time() - start_time
                
                # Extract response data
                if 'choices' not in response_data or not response_data['choices']:
                    raise Exception("Invalid response format from Grok API")
                
                choice = response_data['choices'][0]
                content = choice.get('message', {}).get('content', '')
                
                # Extract usage information
                usage = response_data.get('usage', {})
                tokens_used = usage.get('total_tokens', 0)
                
                result = {
                    'success': True,
                    'content': content,
                    'model': model,
                    'tokens_used': tokens_used,
                    'response_time': response_time,
                    'finish_reason': choice.get('finish_reason', 'unknown'),
                    'usage': {
                        'prompt_tokens': usage.get('prompt_tokens', 0),
                        'completion_tokens': usage.get('completion_tokens', 0),
                        'total_tokens': tokens_used
                    }
                }
                
                self.logger.debug(
                    f"Grok API call successful: model={model}, "
                    f"tokens={tokens_used}, time={response_time:.2f}s"
                )
                
                return result
                
            except CircuitBreakerOpenError as e:
                # Circuit breaker is open, don't retry
                self.logger.error(f"Circuit breaker open for Grok: {e}")
                raise e
                
            except requests.exceptions.RequestException as e:
                last_error = e
                error_type = "RequestError"
                
                self.logger.warning(
                    f"Grok API call attempt {attempt + 1} failed: {error_type} - {str(e)}"
                )
                
            except Exception as e:
                last_error = e
                error_type = type(e).__name__
                
                self.logger.warning(
                    f"Grok API call attempt {attempt + 1} failed: {error_type} - {str(e)}"
                )
            
            # Don't retry on the last attempt
            if attempt < retries:
                # Exponential backoff
                delay = base_delay * (2 ** attempt)
                self.logger.debug(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                self.logger.error(f"All retry attempts failed for Grok: {last_error}")
        
        # If we get here, all retries failed
        return {
            'success': False,
            'error': str(last_error),
            'error_type': type(last_error).__name__,
            'attempts': retries + 1,
            'model': model
        }
    
    def generate_completion(self, messages: List[Dict], model: str = None, 
                           max_tokens: int = None, temperature: float = None) -> Dict:
        """Generate a completion with automatic fallback and key rotation"""
        
        # Use default model if none specified
        if not model:
            model = self.default_model
        elif model not in self.SUPPORTED_MODELS:
            self.logger.warning(f"Using unsupported model: {model}")
        
        self.logger.info(f"Generating completion with Grok using model: {model}")
        
        # Try each available API key
        max_attempts = 3  # Try up to 3 different keys
        
        for attempt in range(max_attempts):
            # Get best available key
            key_name = self.key_manager.get_best_key()
            if not key_name:
                return {
                    'success': False,
                    'error': 'No available API keys for Grok',
                    'provider': 'grok'
                }
            
            # Check if provider is exhausted
            if self.key_manager.check_provider_exhausted():
                return {
                    'success': False,
                    'error': 'Grok provider call limit reached (1000 calls)',
                    'provider': 'grok'
                }
            
            try:
                # Make the API call with retry logic
                result = self._make_request_with_retry(
                    model, messages, max_tokens, temperature, key_name=key_name
                )
                
                # Record metrics
                if result['success']:
                    self.key_manager.record_key_usage(key_name, True, result['tokens_used'])
                    self.metrics_tracker.record_api_call(
                        provider="grok",
                        key_name=key_name,
                        api_key_env=self.key_manager.key_configs[key_name].key_env,
                        success=True,
                        response_time=result['response_time'],
                        tokens_used=result['tokens_used']
                    )
                    
                    # Add provider info to result
                    result['provider'] = 'grok'
                    result['key_used'] = key_name
                    
                    self.logger.info(f"Grok completion successful with key: {key_name}")
                    return result
                else:
                    # Record failure
                    self.key_manager.record_key_usage(key_name, False)
                    self.metrics_tracker.record_api_call(
                        provider="grok",
                        key_name=key_name,
                        api_key_env=self.key_manager.key_configs[key_name].key_env,
                        success=False,
                        response_time=0,
                        error_type=result.get('error_type', 'UnknownError')
                    )
                    
                    # Try next key if this one failed
                    self.logger.warning(f"Key {key_name} failed, trying next key...")
                    continue
                    
            except Exception as e:
                # Record the failure
                error_type = type(e).__name__
                self.key_manager.record_key_usage(key_name, False)
                self.metrics_tracker.record_api_call(
                    provider="grok",
                    key_name=key_name,
                    api_key_env=self.key_manager.key_configs[key_name].key_env,
                    success=False,
                    response_time=0,
                    error_type=error_type
                )
                
                self.logger.error(f"Error with key {key_name}: {e}")
                continue
        
        # If we get here, all keys failed
        return {
            'success': False,
            'error': 'All Grok API keys failed',
            'provider': 'grok'
        }
    
    def validate_api_keys(self) -> Dict[str, bool]:
        """Validate all configured API keys"""
        validation_results = {}
        
        for key_name in self.key_manager.key_configs:
            try:
                test_messages = [{"role": "user", "content": "Hello"}]
                result = self.generate_completion(test_messages, model="grok-beta")
                validation_results[key_name] = result['success']
                
                if result['success']:
                    self.logger.info(f"Grok key '{key_name}' validation: PASSED")
                else:
                    self.logger.warning(f"Grok key '{key_name}' validation: FAILED - {result.get('error', 'Unknown error')}")
                    
            except Exception as e:
                validation_results[key_name] = False
                self.logger.error(f"Grok key '{key_name}' validation: ERROR - {e}")
        
        return validation_results
    
    def get_status(self) -> Dict[str, Any]:
        """Get provider status and health information"""
        provider_stats = self.key_manager.get_statistics()
        circuit_stats = self.circuit_breaker.get_stats()
        key_health = self.key_manager.get_all_keys_health()
        
        # Check if any models are configured
        configured_models = list(self.model_configs.keys())
        
        return {
            'provider': 'grok',
            'status': 'healthy' if provider_stats['active_keys'] > 0 else 'unhealthy',
            'provider_stats': provider_stats,
            'circuit_breaker': circuit_stats,
            'key_health': key_health,
            'configured_models': configured_models,
            'supported_models': self.SUPPORTED_MODELS,
            'default_model': self.default_model
        }
    
    def get_available_models(self) -> List[str]:
        """Get list of available models"""
        return [model for model, config in self.model_configs.items() if config.get('enabled', True)]
    
    def reset_metrics(self):
        """Reset all metrics for this provider"""
        self.key_manager.reset_provider_usage()
        self.circuit_breaker.reset()
        self.logger.info("Grok provider metrics reset")