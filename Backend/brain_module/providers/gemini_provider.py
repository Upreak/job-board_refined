"""
Gemini Provider Implementation

Implements Google Gemini API integration with comprehensive error handling,
metrics tracking, and fallback support.
"""

import time
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime

from .api_key_manager import APIKeyManager, APIKeyConfig
from .circuit_breaker_manager import CircuitBreaker, CircuitBreakerConfig, CircuitBreakerOpenError
from .metrics_tracker import MetricsTracker


class GeminiProvider:
    """Gemini provider implementation"""
    
    # Available Gemini models
    SUPPORTED_MODELS = [
        "gemini-2.0-flash-exp:free",     # Experimental Flash model
        "gemini-2.0-flash-lite-001",     # Lite Flash model
        "gemini-2.0-flash-exp",          # Experimental model
        "gemini-1.5-flash",              # Flash model
        "gemini-1.5-pro",                # Pro model
        "gemini-1.0-pro"                 # Original Pro model
    ]
    
    def __init__(self, metrics_tracker: MetricsTracker, logger: logging.Logger = None):
        self.metrics_tracker = metrics_tracker
        self.logger = logger or logging.getLogger(__name__)
        
        # Initialize components
        self.key_manager = APIKeyManager("gemini")
        
        # Circuit breaker for Gemini API
        circuit_config = CircuitBreakerConfig(
            failure_threshold=5,
            recovery_timeout=60,
            success_threshold=3,
            timeout=30,
            name="gemini"
        )
        self.circuit_breaker = CircuitBreaker(circuit_config)
        
        # Model configuration
        self.model_configs = {}
        self.default_model = "gemini-2.0-flash-exp:free"
        
        self.logger.info("Gemini provider initialized")
    
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
            self.logger.info(f"Added Gemini API key: {name} ({key_env})")
        return success
    
    def configure_model(self, model_name: str, max_tokens: int = 8192, 
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
        max_tokens = max_tokens or model_config.get('max_tokens', 8192)
        temperature = temperature or model_config.get('temperature', 0.7)
        
        if not key_name:
            key_name = self.key_manager.get_best_key()
            if not key_name:
                raise ValueError("No available API keys for Gemini")
        
        # Convert messages format for Gemini API
        contents = []
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            
            if role == 'user':
                contents.append({
                    "role": "user",
                    "parts": [{"text": content}]
                })
            elif role == 'assistant':
                contents.append({
                    "role": "model", 
                    "parts": [{"text": content}]
                })
        
        headers = self._get_headers_for_key(key_name)
        url = "https://generativelanguage.googleapis.com/v1beta/models"
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "topP": 0.8,
                "topK": 10,
                "maxOutputTokens": max_tokens,
            }
        }
        
        last_error = None
        
        for attempt in range(retries + 1):
            try:
                start_time = time.time()
                
                # Make the actual API call through circuit breaker
                def _api_call():
                    import requests
                    response = requests.post(
                        f"{url}/{model}:generateContent",
                        headers=headers,
                        json=payload,
                        timeout=30
                    )
                    
                    if response.status_code != 200:
                        raise Exception(f"HTTP {response.status_code}: {response.text}")
                    
                    return response.json()
                
                response_data = self.circuit_breaker.call(_api_call)
                response_time = time.time() - start_time
                
                # Extract response data
                if 'candidates' not in response_data or not response_data['candidates']:
                    raise Exception("No response candidates returned")
                
                candidate = response_data['candidates'][0]
                content_parts = candidate.get('content', {}).get('parts', [])
                content = content_parts[0].get('text', '') if content_parts else ''
                
                # Extract usage information
                usage = response_data.get('usageMetadata', {})
                tokens_used = usage.get('totalTokenCount', 0)
                
                result = {
                    'success': True,
                    'content': content,
                    'model': model,
                    'tokens_used': tokens_used,
                    'response_time': response_time,
                    'finish_reason': candidate.get('finishReason', 'unknown'),
                    'usage': {
                        'prompt_tokens': usage.get('promptTokenCount', 0),
                        'completion_tokens': usage.get('candidatesTokenCount', 0),
                        'total_tokens': tokens_used
                    }
                }
                
                self.logger.debug(
                    f"Gemini API call successful: model={model}, "
                    f"tokens={tokens_used}, time={response_time:.2f}s"
                )
                
                return result
                
            except CircuitBreakerOpenError as e:
                # Circuit breaker is open, don't retry
                self.logger.error(f"Circuit breaker open for Gemini: {e}")
                raise e
                
            except Exception as e:
                last_error = e
                error_type = type(e).__name__
                
                self.logger.warning(
                    f"Gemini API call attempt {attempt + 1} failed: {error_type} - {str(e)}"
                )
            
            # Don't retry on the last attempt
            if attempt < retries:
                # Exponential backoff
                delay = base_delay * (2 ** attempt)
                self.logger.debug(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                self.logger.error(f"All retry attempts failed for Gemini: {last_error}")
        
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
        
        self.logger.info(f"Generating completion with Gemini using model: {model}")
        
        # Try each available API key
        max_attempts = 3  # Try up to 3 different keys
        
        for attempt in range(max_attempts):
            # Get best available key
            key_name = self.key_manager.get_best_key()
            if not key_name:
                return {
                    'success': False,
                    'error': 'No available API keys for Gemini',
                    'provider': 'gemini'
                }
            
            # Check if provider is exhausted
            if self.key_manager.check_provider_exhausted():
                return {
                    'success': False,
                    'error': 'Gemini provider call limit reached (1000 calls)',
                    'provider': 'gemini'
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
                        provider="gemini",
                        key_name=key_name,
                        api_key_env=self.key_manager.key_configs[key_name].key_env,
                        success=True,
                        response_time=result['response_time'],
                        tokens_used=result['tokens_used']
                    )
                    
                    # Add provider info to result
                    result['provider'] = 'gemini'
                    result['key_used'] = key_name
                    
                    self.logger.info(f"Gemini completion successful with key: {key_name}")
                    return result
                else:
                    # Record failure
                    self.key_manager.record_key_usage(key_name, False)
                    self.metrics_tracker.record_api_call(
                        provider="gemini",
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
                    provider="gemini",
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
            'error': 'All Gemini API keys failed',
            'provider': 'gemini'
        }
    
    def validate_api_keys(self) -> Dict[str, bool]:
        """Validate all configured API keys"""
        validation_results = {}
        
        for key_name in self.key_manager.key_configs:
            try:
                test_messages = [{"role": "user", "content": "Hello"}]
                result = self.generate_completion(test_messages, model="gemini-2.0-flash-exp:free")
                validation_results[key_name] = result['success']
                
                if result['success']:
                    self.logger.info(f"Gemini key '{key_name}' validation: PASSED")
                else:
                    self.logger.warning(f"Gemini key '{key_name}' validation: FAILED - {result.get('error', 'Unknown error')}")
                    
            except Exception as e:
                validation_results[key_name] = False
                self.logger.error(f"Gemini key '{key_name}' validation: ERROR - {e}")
        
        return validation_results
    
    def get_status(self) -> Dict[str, Any]:
        """Get provider status and health information"""
        provider_stats = self.key_manager.get_statistics()
        circuit_stats = self.circuit_breaker.get_stats()
        key_health = self.key_manager.get_all_keys_health()
        
        # Check if any models are configured
        configured_models = list(self.model_configs.keys())
        
        return {
            'provider': 'gemini',
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
        self.logger.info("Gemini provider metrics reset")