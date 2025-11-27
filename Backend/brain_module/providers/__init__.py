"""
New Robust Provider Management System

A comprehensive provider management system with intelligent routing,
comprehensive monitoring, and robust fallback capabilities.

Key Features:
- Automatic fallback between OpenRouter, Grok, and Gemini APIs
- Strict 1000 API calls limit per provider before switching
- Multiple API keys per provider with secure management
- Detailed metrics tracking and comprehensive logging
- Circuit breaker pattern and retry logic
- Production-ready with monitoring and alerting
"""

from .provider_manager import ProviderManager
from .openrouter_provider import OpenRouterProvider
from .grok_provider import GrokProvider
from .gemini_provider import GeminiProvider
from .metrics_tracker import MetricsTracker
from .circuit_breaker_manager import CircuitBreaker, CircuitBreakerOpenError
from .api_key_manager import APIKeyManager

__all__ = [
    'ProviderManager',
    'OpenRouterProvider',
    'GrokProvider',
    'GeminiProvider',
    'MetricsTracker',
    'CircuitBreaker',
    'CircuitBreakerOpenError',
    'APIKeyManager'
]

__version__ = '2.0.0'