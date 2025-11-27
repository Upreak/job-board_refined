"""
API Key Manager

Handles secure storage and management of API keys with automatic rotation,
validation, and fallback support.

Features:
- Secure key retrieval from environment variables
- Multiple keys per provider with priority-based rotation
- Automatic key validation and health checking
- Call limit tracking and enforcement (1000 calls per provider)
- Backup key activation when primary keys fail
"""

import os
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import time


@dataclass
class APIKeyConfig:
    """Configuration for an API key"""
    key_env: str           # Environment variable name
    name: str             # Key identifier
    priority: int         # Priority order (1 = highest)
    daily_limit: int      # Daily call limit
    usage_reset_hour: int # Hour (UTC) when usage resets
    enabled: bool         # Whether key is enabled
    max_failures: int = 3  # Max consecutive failures before deactivation
    last_reset: datetime = None  # Last usage reset time


@dataclass
class APIKeyStatus:
    """Current status of an API key"""
    key_config: APIKeyConfig
    calls_today: int = 0
    failures_today: int = 0
    last_used: Optional[datetime] = None
    last_success: Optional[datetime] = None
    last_failure: Optional[datetime] = None
    consecutive_failures: int = 0
    is_active: bool = True
    last_health_check: Optional[datetime] = None
    health_status: str = "unknown"  # "healthy", "degraded", "failed", "unknown"
    
    @property
    def calls_remaining(self) -> int:
        """Get remaining calls for today"""
        return max(0, self.key_config.daily_limit - self.calls_today)
    
    @property
    def is_exhausted(self) -> bool:
        """Check if key has reached its daily limit"""
        return self.calls_today >= self.key_config.daily_limit
    
    @property
    def needs_reset(self) -> bool:
        """Check if usage should be reset based on reset hour"""
        if not self.key_config.last_reset:
            return True
        
        now = datetime.utcnow()
        reset_time = self.key_config.last_reset.replace(
            hour=self.key_config.usage_reset_hour,
            minute=0,
            second=0,
            microsecond=0
        )
        
        # If we're past the reset time and haven't reset today
        return now >= reset_time and self.key_config.last_reset.date() != now.date()


class APIKeyManager:
    """Manages API keys with automatic rotation and fallback"""
    
    def __init__(self, provider_name: str):
        self.provider_name = provider_name
        self.logger = logging.getLogger(f"{__name__}.{provider_name}")
        
        # Key configurations and status tracking
        self.key_configs: Dict[str, APIKeyConfig] = {}
        self.key_status: Dict[str, APIKeyStatus] = {}
        
        # Call limit enforcement (1000 calls per provider)
        self.provider_call_limit = 1000
        self.provider_calls_today = 0
        self.provider_last_reset = None
        
        self.logger.info(f"API Key Manager initialized for provider '{provider_name}'")
    
    def add_key(self, config: APIKeyConfig) -> bool:
        """Add a new API key configuration"""
        try:
            # Validate environment variable exists
            if not os.getenv(config.key_env):
                self.logger.error(f"Environment variable {config.key_env} not found for key {config.name}")
                return False
            
            # Add configuration
            self.key_configs[config.name] = config
            self.key_status[config.name] = APIKeyStatus(key_config=config)
            
            # Reset usage if needed
            self._check_and_reset_usage(config.name)
            
            self.logger.info(
                f"Added API key '{config.name}' with priority {config.priority} "
                f"(daily limit: {config.daily_limit})"
            )
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to add API key '{config.name}': {e}")
            return False
    
    def get_best_key(self) -> Optional[str]:
        """Get the best available API key based on priority and health"""
        self._cleanup_and_check_health()
        
        # Get available keys sorted by priority
        available_keys = []
        for key_name, status in self.key_status.items():
            config = status.key_config
            
            # Skip disabled keys
            if not config.enabled or not status.is_active:
                continue
            
            # Skip exhausted keys
            if status.is_exhausted:
                continue
            
            # Skip unhealthy keys (too many consecutive failures)
            if status.consecutive_failures >= config.max_failures:
                continue
            
            available_keys.append((key_name, config.priority, status.calls_remaining))
        
        if not available_keys:
            return None
        
        # Sort by priority (lower number = higher priority), then by remaining calls
        available_keys.sort(key=lambda x: (x[1], -x[2]))
        
        best_key = available_keys[0][0]
        self.logger.debug(f"Selected best key: '{best_key}'")
        return best_key
    
    def get_key_value(self, key_name: str) -> Optional[str]:
        """Get the actual API key value from environment variable"""
        if key_name not in self.key_configs:
            return None
        
        config = self.key_configs[key_name]
        return os.getenv(config.key_env)
    
    def record_key_usage(self, key_name: str, success: bool, tokens_used: int = 0) -> bool:
        """Record usage of an API key"""
        if key_name not in self.key_status:
            self.logger.warning(f"Unknown key '{key_name}' usage recorded")
            return False
        
        status = self.key_status[key_name]
        now = datetime.utcnow()
        
        # Reset usage if needed
        self._check_and_reset_usage(key_name)
        
        # Update provider usage
        self.provider_calls_today += 1
        
        # Update key status
        status.calls_today += 1
        status.last_used = now
        
        if success:
            status.consecutive_failures = 0
            status.last_success = now
            status.health_status = "healthy"
        else:
            status.consecutive_failures += 1
            status.last_failure = now
            
            if status.consecutive_failures >= status.key_config.max_failures:
                status.is_active = False
                status.health_status = "failed"
                self.logger.warning(f"Key '{key_name}' deactivated due to failures")
        
        # Log usage
        remaining = status.calls_remaining
        self.logger.debug(
            f"Key '{key_name}' usage recorded: success={success}, "
            f"calls_today={status.calls_today}/{status.key_config.daily_limit}, "
            f"remaining={remaining}"
        )
        
        return True
    
    def check_provider_exhausted(self) -> bool:
        """Check if provider has reached its overall call limit"""
        self._check_provider_reset()
        return self.provider_calls_today >= self.provider_call_limit
    
    def get_provider_remaining_calls(self) -> int:
        """Get remaining calls for the provider"""
        self._check_provider_reset()
        return max(0, self.provider_call_limit - self.provider_calls_today)
    
    def get_key_health(self, key_name: str) -> Optional[Dict[str, Any]]:
        """Get health information for a specific key"""
        if key_name not in self.key_status:
            return None
        
        status = self.key_status[key_name]
        config = status.key_config
        
        return {
            'name': key_name,
            'priority': config.priority,
            'calls_today': status.calls_today,
            'calls_limit': config.daily_limit,
            'calls_remaining': status.calls_remaining,
            'consecutive_failures': status.consecutive_failures,
            'max_failures': config.max_failures,
            'is_active': status.is_active,
            'is_exhausted': status.is_exhausted,
            'health_status': status.health_status,
            'last_used': status.last_used.isoformat() if status.last_used else None,
            'last_success': status.last_success.isoformat() if status.last_success else None,
            'last_failure': status.last_failure.isoformat() if status.last_failure else None,
            'needs_reset': status.needs_reset,
            'enabled': config.enabled
        }
    
    def get_all_keys_health(self) -> Dict[str, Dict[str, Any]]:
        """Get health information for all keys"""
        health_info = {}
        for key_name in self.key_status:
            health_info[key_name] = self.get_key_health(key_name)
        return health_info
    
    def reactivate_key(self, key_name: str) -> bool:
        """Reactivate a previously deactivated key"""
        if key_name not in self.key_status:
            return False
        
        status = self.key_status[key_name]
        if not status.key_config.enabled:
            return False
        
        status.consecutive_failures = 0
        status.is_active = True
        status.health_status = "healthy"
        
        self.logger.info(f"Reactivated key '{key_name}'")
        return True
    
    def deactivate_key(self, key_name: str) -> bool:
        """Manually deactivate a key"""
        if key_name not in self.key_status:
            return False
        
        status = self.key_status[key_name]
        status.is_active = False
        status.health_status = "failed"
        
        self.logger.info(f"Deactivated key '{key_name}'")
        return True
    
    def reset_key_usage(self, key_name: str) -> bool:
        """Reset usage counters for a specific key"""
        if key_name not in self.key_status:
            return False
        
        status = self.key_status[key_name]
        status.calls_today = 0
        status.failures_today = 0
        status.key_config.last_reset = datetime.utcnow()
        
        self.logger.info(f"Reset usage for key '{key_name}'")
        return True
    
    def reset_provider_usage(self):
        """Reset the entire provider's usage counter"""
        self.provider_calls_today = 0
        self.provider_last_reset = datetime.utcnow()
        
        # Reset all key usage counters
        for status in self.key_status.values():
            status.calls_today = 0
            status.failures_today = 0
            status.key_config.last_reset = datetime.utcnow()
        
        self.logger.info(f"Reset usage for provider '{self.provider_name}'")
    
    def _check_and_reset_usage(self, key_name: str):
        """Check if key usage should be reset and reset if needed"""
        if key_name not in self.key_status:
            return
        
        status = self.key_status[key_name]
        if status.needs_reset:
            status.calls_today = 0
            status.failures_today = 0
            status.key_config.last_reset = datetime.utcnow()
            
            self.logger.debug(f"Reset usage for key '{key_name}' (daily reset)")
    
    def _check_provider_reset(self):
        """Check if provider usage should be reset"""
        if not self.provider_last_reset:
            self.provider_last_reset = datetime.utcnow()
            return
        
        now = datetime.utcnow()
        last_reset = self.provider_last_reset
        
        # Reset if we're on a different day
        if now.date() > last_reset.date():
            self.reset_provider_usage()
    
    def _cleanup_and_check_health(self):
        """Periodic cleanup and health checking"""
        now = datetime.utcnow()
        
        for key_name, status in self.key_status.items():
            # Check if key needs daily reset
            self._check_and_reset_usage(key_name)
            
            # Check if unhealthy key should be reactivated (after 1 hour of good behavior)
            if (not status.is_active and 
                status.consecutive_failures > 0 and 
                status.last_success and
                now - status.last_success > timedelta(hours=1)):
                
                # Reactivation strategy: reset failure count but keep key inactive
                # This requires manual reactivation or successful usage
                pass
            
            # Update health status based on recent performance
            if status.last_success and status.last_failure:
                if status.last_success > status.last_failure:
                    status.health_status = "healthy"
                elif status.consecutive_failures > 0:
                    status.health_status = "degraded"
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get usage statistics for the provider"""
        self._check_provider_reset()
        
        total_keys = len(self.key_configs)
        active_keys = sum(1 for status in self.key_status.values() if status.is_active)
        exhausted_keys = sum(1 for status in self.key_status.values() if status.is_exhausted)
        healthy_keys = sum(1 for status in self.key_status.values() if status.health_status == "healthy")
        
        return {
            'provider': self.provider_name,
            'provider_calls_today': self.provider_calls_today,
            'provider_call_limit': self.provider_call_limit,
            'provider_remaining': self.get_provider_remaining_calls(),
            'total_keys': total_keys,
            'active_keys': active_keys,
            'exhausted_keys': exhausted_keys,
            'healthy_keys': healthy_keys,
            'disabled_keys': total_keys - active_keys,
            'last_provider_reset': self.provider_last_reset.isoformat() if self.provider_last_reset else None
        }