"""
Provider Manager - Core orchestration system

Intelligent provider management with automatic fallback, key rotation,
comprehensive monitoring, and 1000 call limit enforcement per provider.
"""

import logging
import time
import threading
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

from .metrics_tracker import MetricsTracker
from .circuit_breaker_manager import CircuitBreakerManager
from .openrouter_provider import OpenRouterProvider
from .grok_provider import GrokProvider
from .gemini_provider import GeminiProvider


class ProviderStatus(Enum):
    """Provider status enum"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    EXHAUSTED = "exhausted"
    OFFLINE = "offline"


@dataclass
class ProviderHealth:
    """Provider health information"""
    provider: str
    status: ProviderStatus
    call_count_today: int
    remaining_calls: int
    active_keys: int
    total_keys: int
    success_rate: float
    avg_response_time: float
    last_error: Optional[str] = None
    last_success: Optional[datetime] = None


class ProviderManager:
    """
    Core provider management system with intelligent routing and fallback
    
    Key Features:
    - Automatic fallback between OpenRouter, Grok, and Gemini
    - 1000 API calls per provider limit enforcement
    - Intelligent key rotation and health monitoring
    - Comprehensive metrics tracking and logging
    - Circuit breaker pattern implementation
    - Production-ready with alerting and monitoring
    """
    
    def __init__(self, 
                 metrics_file: str = "logs/metrics.json",
                 log_level: str = "INFO",
                 enable_monitoring: bool = True,
                 monitoring_interval: int = 60):
        
        # Setup logging
        self._setup_logging(log_level)
        self.logger = logging.getLogger(__name__)
        
        # Configuration (define first)
        self.enable_monitoring = enable_monitoring
        self.monitoring_interval = monitoring_interval
        self.call_limit_per_provider = 1000  # Strict 1000 call limit
        
        # Provider priority order for fallback
        self.provider_priority = ["openrouter", "grok", "gemini"]
        
        # Initialize core components
        self.metrics_tracker = MetricsTracker(metrics_file)
        self.circuit_breaker_manager = CircuitBreakerManager()
        
        # Provider instances
        self.providers = {}
        self._initialize_providers()
        
        # Provider health tracking
        self.provider_health: Dict[str, ProviderHealth] = {}
        self._initialize_health_tracking()
        
        # Threading for background monitoring
        self.monitoring_thread = None
        self.shutdown_event = threading.Event()
        
        # Start background monitoring if enabled
        if self.enable_monitoring:
            self._start_monitoring()
        
        self.logger.info("ProviderManager initialized with intelligent fallback system")
        self.logger.info(f"Provider priority order: {self.provider_priority}")
    
    def _setup_logging(self, log_level: str):
        """Setup comprehensive logging system"""
        # Create logs directory
        import os
        os.makedirs("logs", exist_ok=True)
        
        # Configure root logger
        logging.basicConfig(
            level=getattr(logging, log_level.upper()),
            format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
            handlers=[
                logging.FileHandler('logs/provider_manager.log'),
                logging.StreamHandler()
            ]
        )
        
        # Set specific logger levels
        logging.getLogger('openai').setLevel(logging.WARNING)
        logging.getLogger('requests').setLevel(logging.WARNING)
        logging.getLogger('google.generativeai').setLevel(logging.WARNING)
    
    def _initialize_providers(self):
        """Initialize all provider instances"""
        try:
            # OpenRouter Provider
            self.providers["openrouter"] = OpenRouterProvider(
                metrics_tracker=self.metrics_tracker,
                logger=logging.getLogger("providers.openrouter")
            )
            
            # Grok Provider
            self.providers["grok"] = GrokProvider(
                metrics_tracker=self.metrics_tracker,
                logger=logging.getLogger("providers.grok")
            )
            
            # Gemini Provider
            self.providers["gemini"] = GeminiProvider(
                metrics_tracker=self.metrics_tracker,
                logger=logging.getLogger("providers.gemini")
            )
            
            self.logger.info("All providers initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize providers: {e}")
            raise
    
    def _initialize_health_tracking(self):
        """Initialize provider health tracking"""
        for provider_name in self.provider_priority:
            self.provider_health[provider_name] = ProviderHealth(
                provider=provider_name,
                status=ProviderStatus.UNHEALTHY,
                call_count_today=0,
                remaining_calls=self.call_limit_per_provider,
                active_keys=0,
                total_keys=0,
                success_rate=0.0,
                avg_response_time=0.0
            )
    
    def add_provider_api_key(self, provider: str, key_env: str, key_name: str = "primary",
                           priority: int = 1, daily_limit: int = 1000, enabled: bool = True) -> bool:
        """Add an API key to a specific provider"""
        if provider not in self.providers:
            self.logger.error(f"Unknown provider: {provider}")
            return False
        
        success = self.providers[provider].add_api_key(
            key_env=key_env,
            name=key_name,
            priority=priority,
            daily_limit=daily_limit,
            enabled=enabled
        )
        
        if success:
            self.logger.info(f"Added {provider} API key: {key_name} ({key_env})")
            # Sync health tracking immediately after adding key
            self._sync_provider_health(provider)
        else:
            self.logger.error(f"Failed to add {provider} API key: {key_name} ({key_env})")
        
        return success
    
    def _sync_provider_health(self, provider: str):
        """Synchronize health tracking with provider's actual state"""
        if provider not in self.providers or provider not in self.provider_health:
            return
        
        try:
            provider_instance = self.providers[provider]
            stats = provider_instance.key_manager.get_statistics()
            
            health = self.provider_health[provider]
            health.active_keys = stats['active_keys']
            health.total_keys = stats['total_keys']
            health.call_count_today = stats['provider_calls_today']
            health.remaining_calls = stats['provider_remaining']
            
            # Update status based on current state
            if health.active_keys > 0 and health.remaining_calls > 0:
                health.status = ProviderStatus.HEALTHY
            elif health.active_keys > 0:
                health.status = ProviderStatus.DEGRADED
            elif health.remaining_calls <= 0:
                health.status = ProviderStatus.EXHAUSTED
            else:
                health.status = ProviderStatus.UNHEALTHY
                
            self.logger.debug(f"Synced health for {provider}: {health.active_keys} active keys, {health.remaining_calls} remaining calls")
            
        except Exception as e:
            self.logger.error(f"Failed to sync health for {provider}: {e}")
    
    def configure_provider_model(self, provider: str, model_name: str,
                               max_tokens: int = 4000, temperature: float = 0.7, 
                               enabled: bool = True):
        """Configure a model for a specific provider"""
        if provider not in self.providers:
            raise ValueError(f"Unknown provider: {provider}")
        
        self.providers[provider].configure_model(model_name, max_tokens, temperature, enabled)
        self.logger.info(f"Configured {provider} model: {model_name}")
    
    def generate_completion(self, messages: List[Dict], model: str = None, 
                           provider_preference: List[str] = None, 
                           max_tokens: int = None, temperature: float = None,
                           site_url: str = None, site_name: str = None) -> Dict:
        """
        Generate completion with intelligent provider fallback
        
        Args:
            messages: List of message dictionaries with role and content
            model: Model name to use (will use provider's default if None)
            provider_preference: Preferred provider order (overrides default)
            max_tokens: Maximum tokens to generate
            temperature: Temperature for generation
            site_url: Site URL for OpenRouter rankings
            site_name: Site name for OpenRouter rankings
            
        Returns:
            Dict with completion result or error information
        """
        
        # Use default provider preference if none specified
        if provider_preference is None:
            provider_preference = self.provider_priority.copy()
        
        self.logger.info(
            f"Generating completion with model={model}, "
            f"provider_preference={provider_preference}"
        )
        
        # Try each provider in priority order
        for provider_name in provider_preference:
            if provider_name not in self.providers:
                self.logger.warning(f"Unknown provider in preference: {provider_name}")
                continue
            
            # Check provider health and limits
            if not self._is_provider_available(provider_name):
                self.logger.debug(f"Provider {provider_name} not available")
                continue
            
            try:
                # Get provider instance
                provider = self.providers[provider_name]
                
                # Generate completion with provider
                if provider_name == "openrouter":
                    result = provider.generate_completion(
                        messages=messages,
                        model=model,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        site_url=site_url,
                        site_name=site_name
                    )
                else:
                    result = provider.generate_completion(
                        messages=messages,
                        model=model,
                        max_tokens=max_tokens,
                        temperature=temperature
                    )
                
                # If successful, update health and return result
                if result['success']:
                    self._update_provider_success(provider_name, result)
                    self.logger.info(
                        f"Completion successful with {provider_name} "
                        f"(model: {result.get('model', 'unknown')}, "
                        f"tokens: {result.get('tokens_used', 0)})"
                    )
                    return result
                else:
                    # Record provider failure
                    self._update_provider_failure(provider_name, result.get('error', 'Unknown error'))
                    self.logger.warning(
                        f"Provider {provider_name} failed: {result.get('error', 'Unknown error')}"
                    )
                    continue
                    
            except Exception as e:
                self.logger.error(f"Error with provider {provider_name}: {e}")
                self._update_provider_failure(provider_name, str(e))
                continue
        
        # If we get here, all providers failed
        error_msg = f"All providers failed. Tried: {', '.join(provider_preference)}"
        self.logger.error(error_msg)
        
        return {
            'success': False,
            'error': error_msg,
            'providers_tried': provider_preference,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _is_provider_available(self, provider_name: str) -> bool:
        """Check if a provider is available for requests"""
        health = self.provider_health.get(provider_name)
        if not health:
            return False
        
        # Check if provider has remaining calls
        if health.remaining_calls <= 0:
            return False
        
        # Check if provider has active keys
        if health.active_keys <= 0:
            return False
        
        # Check if provider is not in unhealthy states
        if health.status in [ProviderStatus.UNHEALTHY, ProviderStatus.OFFLINE]:
            return False
        
        # Check circuit breaker status
        circuit_breaker = self.circuit_breaker_manager.get_breaker(provider_name)
        stats = circuit_breaker.get_stats()
        if stats['state'] == 'open':
            return False
        
        return True
    
    def _update_provider_success(self, provider_name: str, result: Dict):
        """Update provider health after successful request"""
        health = self.provider_health[provider_name]
        health.call_count_today += 1
        health.remaining_calls = max(0, self.call_limit_per_provider - health.call_count_today)
        health.last_success = datetime.utcnow()
        
        # Update performance metrics
        response_time = result.get('response_time', 0)
        if health.avg_response_time == 0:
            health.avg_response_time = response_time
        else:
            health.avg_response_time = (health.avg_response_time + response_time) / 2
        
        # Update status based on health
        if health.remaining_calls > 0 and health.active_keys > 0:
            health.status = ProviderStatus.HEALTHY
        elif health.remaining_calls > 0:
            health.status = ProviderStatus.DEGRADED
        else:
            health.status = ProviderStatus.EXHAUSTED
    
    def _update_provider_failure(self, provider_name: str, error: str):
        """Update provider health after failed request"""
        health = self.provider_health[provider_name]
        health.last_error = error
        
        # Update status to unhealthy if we have errors
        if health.status == ProviderStatus.HEALTHY:
            health.status = ProviderStatus.DEGRADED
        elif health.status == ProviderStatus.DEGRADED:
            health.status = ProviderStatus.UNHEALTHY
    
    def get_provider_status(self, provider: str = None) -> Dict[str, Any]:
        """Get status of specific provider(s)"""
        if provider:
            if provider not in self.provider_health:
                return {'error': f'Unknown provider: {provider}'}
            
            health = self.provider_health[provider]
            provider_details = self.providers[provider].get_status()
            
            return {
                'health': {
                    'provider': health.provider,
                    'status': health.status.value,
                    'call_count_today': health.call_count_today,
                    'remaining_calls': health.remaining_calls,
                    'limit_per_day': self.call_limit_per_provider,
                    'active_keys': health.active_keys,
                    'total_keys': health.total_keys,
                    'success_rate': health.success_rate,
                    'avg_response_time': health.avg_response_time,
                    'last_error': health.last_error,
                    'last_success': health.last_success.isoformat() if health.last_success else None
                },
                'details': provider_details
            }
        else:
            # Return status for all providers
            return {
                provider: self.get_provider_status(provider) 
                for provider in self.provider_priority
            }
    
    def get_all_metrics(self) -> Dict[str, Any]:
        """Get comprehensive metrics for all providers"""
        # Get provider metrics from metrics tracker
        provider_metrics = self.metrics_tracker.get_all_provider_metrics()
        
        # Get circuit breaker stats
        circuit_stats = self.circuit_breaker_manager.get_all_stats()
        
        # Get detailed provider information
        provider_details = {}
        for provider_name in self.provider_priority:
            if provider_name in self.providers:
                provider_details[provider_name] = self.providers[provider_name].get_status()
        
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'provider_metrics': provider_metrics,
            'circuit_breaker_stats': circuit_stats,
            'provider_details': provider_details,
            'health_summary': {
                provider_name: health.status.value 
                for provider_name, health in self.provider_health.items()
            },
            'configuration': {
                'call_limit_per_provider': self.call_limit_per_provider,
                'provider_priority': self.provider_priority,
                'monitoring_enabled': self.enable_monitoring
            }
        }
    
    def validate_all_providers(self) -> Dict[str, Dict[str, bool]]:
        """Validate all configured API keys across all providers"""
        validation_results = {}
        
        for provider_name, provider in self.providers.items():
            self.logger.info(f"Validating {provider_name} API keys...")
            try:
                results = provider.validate_api_keys()
                validation_results[provider_name] = results
                
                # Log validation summary
                passed = sum(1 for success in results.values() if success)
                total = len(results)
                self.logger.info(f"{provider_name} validation: {passed}/{total} keys passed")
                
            except Exception as e:
                self.logger.error(f"Failed to validate {provider_name}: {e}")
                validation_results[provider_name] = {'error': str(e)}
        
        return validation_results
    
    def reset_provider_metrics(self, provider: str = None):
        """Reset metrics for specific provider or all providers"""
        if provider:
            if provider in self.providers:
                self.providers[provider].reset_metrics()
                # Reset health tracking
                if provider in self.provider_health:
                    health = self.provider_health[provider]
                    health.call_count_today = 0
                    health.remaining_calls = self.call_limit_per_provider
                    health.status = ProviderStatus.HEALTHY
                    health.last_error = None
                self.logger.info(f"Reset metrics for provider: {provider}")
            else:
                self.logger.error(f"Unknown provider: {provider}")
        else:
            # Reset all providers
            for provider_name in self.providers:
                self.reset_provider_metrics(provider_name)
            self.logger.info("Reset metrics for all providers")
    
    def _start_monitoring(self):
        """Start background monitoring thread"""
        def monitor_loop():
            self.logger.info("Started provider monitoring thread")
            
            while not self.shutdown_event.is_set():
                try:
                    self._update_provider_health()
                    time.sleep(self.monitoring_interval)
                except Exception as e:
                    self.logger.error(f"Error in monitoring loop: {e}")
                    time.sleep(10)  # Wait before retrying
            
            self.logger.info("Provider monitoring thread stopped")
        
        self.monitoring_thread = threading.Thread(target=monitor_loop, daemon=True)
        self.monitoring_thread.start()
    
    def _update_provider_health(self):
        """Update health status for all providers"""
        for provider_name in self.provider_priority:
            if provider_name not in self.providers:
                continue
            
            try:
                provider = self.providers[provider_name]
                stats = provider.key_manager.get_statistics()
                
                health = self.provider_health[provider_name]
                health.active_keys = stats['active_keys']
                health.total_keys = stats['total_keys']
                health.call_count_today = stats['provider_calls_today']
                health.remaining_calls = stats['provider_remaining']
                
                # Update status based on current state
                if health.remaining_calls <= 0:
                    health.status = ProviderStatus.EXHAUSTED
                elif health.active_keys <= 0:
                    health.status = ProviderStatus.UNHEALTHY
                elif health.call_count_today > 0:
                    # Get success rate from metrics
                    provider_metrics = self.metrics_tracker.get_provider_metrics(provider_name)
                    if provider_metrics:
                        health.success_rate = provider_metrics.get('success_rate', 0.0)
                        if health.success_rate < 50:
                            health.status = ProviderStatus.DEGRADED
                        else:
                            health.status = ProviderStatus.HEALTHY
                
                # Update circuit breaker status
                circuit_breaker = self.circuit_breaker_manager.get_breaker(provider_name)
                circuit_stats = circuit_breaker.get_stats()
                if circuit_stats['state'] == 'open':
                    health.status = ProviderStatus.UNHEALTHY
                    
            except Exception as e:
                self.logger.error(f"Error updating health for {provider_name}: {e}")
                health = self.provider_health[provider_name]
                health.status = ProviderStatus.UNHEALTHY
    
    def shutdown(self):
        """Shutdown the provider manager and cleanup resources"""
        self.logger.info("Shutting down ProviderManager...")
        
        # Stop monitoring thread
        self.shutdown_event.set()
        if self.monitoring_thread and self.monitoring_thread.is_alive():
            self.monitoring_thread.join(timeout=5)
        
        # Save final metrics
        try:
            self.metrics_tracker._save_metrics()
            self.logger.info("Final metrics saved")
        except Exception as e:
            self.logger.error(f"Error saving final metrics: {e}")
        
        self.logger.info("ProviderManager shutdown complete")
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.shutdown()
