"""
Circuit Breaker Pattern Implementation

Prevents cascading failures by stopping requests to failing services
and allowing them time to recover.
"""

import logging
import time
from enum import Enum
from typing import Callable, Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime, timedelta


class CircuitState(Enum):
    """Circuit breaker states"""
    CLOSED = "closed"     # Normal operation
    OPEN = "open"         # Blocking requests
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """Configuration for circuit breaker"""
    failure_threshold: int = 5          # Number of failures to open circuit
    recovery_timeout: int = 60          # Seconds before trying half-open
    success_threshold: int = 3          # Successes needed to close from half-open
    timeout: int = 30                   # Request timeout in seconds
    name: str = "default"               # Circuit breaker name


class CircuitBreaker:
    """Circuit breaker implementation with state management"""
    
    def __init__(self, config: CircuitBreakerConfig):
        self.config = config
        self.logger = logging.getLogger(f"{__name__}.{config.name}")
        
        # State tracking
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: Optional[datetime] = None
        self.next_attempt_time: Optional[datetime] = None
        
        # Statistics
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.state_changes = 0
        
        self.logger.info(f"Circuit breaker '{config.name}' initialized in CLOSED state")
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """
        Execute function through circuit breaker
        
        Args:
            func: Function to execute
            *args: Function arguments
            **kwargs: Function keyword arguments
            
        Returns:
            Function result
            
        Raises:
            Exception: When circuit is open or function fails
        """
        self.total_requests += 1
        
        # Check if we can attempt the request
        if not self._can_execute():
            self.failed_requests += 1
            raise CircuitBreakerOpenError(
                f"Circuit breaker '{self.config.name}' is OPEN. "
                f"Next attempt at {self.next_attempt_time}"
            )
        
        try:
            # Execute the function
            start_time = time.time()
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            # Record success
            self._record_success(execution_time)
            self.successful_requests += 1
            
            return result
            
        except Exception as e:
            # Record failure
            self._record_failure(str(e))
            self.failed_requests += 1
            raise
    
    def _can_execute(self) -> bool:
        """Check if we can execute a request based on current state"""
        current_time = datetime.utcnow()
        
        if self.state == CircuitState.CLOSED:
            return True
            
        elif self.state == CircuitState.OPEN:
            # Check if enough time has passed to try half-open
            if self.next_attempt_time and current_time >= self.next_attempt_time:
                self._transition_to_half_open()
                return True
            return False
            
        elif self.state == CircuitState.HALF_OPEN:
            return True
            
        return False
    
    def _record_success(self, execution_time: float):
        """Record a successful request"""
        self.failure_count = 0  # Reset failure count on success
        
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            
            if self.success_count >= self.config.success_threshold:
                self._transition_to_closed()
        else:
            self.success_count = 1
    
    def _record_failure(self, error_message: str):
        """Record a failed request"""
        self.failure_count += 1
        self.success_count = 0
        self.last_failure_time = datetime.utcnow()
        
        self.logger.warning(
            f"Circuit breaker '{self.config.name}' recorded failure #{self.failure_count}: {error_message}"
        )
        
        if self.state == CircuitState.HALF_OPEN:
            # Any failure in half-open state opens the circuit again
            self._transition_to_open()
            
        elif self.state == CircuitState.CLOSED:
            if self.failure_count >= self.config.failure_threshold:
                self._transition_to_open()
    
    def _transition_to_open(self):
        """Transition to OPEN state"""
        self.state = CircuitState.OPEN
        self.next_attempt_time = datetime.utcnow() + timedelta(seconds=self.config.recovery_timeout)
        self.state_changes += 1
        
        self.logger.error(
            f"Circuit breaker '{self.config.name}' transitioned to OPEN state. "
            f"Will attempt recovery at {self.next_attempt_time}"
        )
    
    def _transition_to_half_open(self):
        """Transition to HALF_OPEN state"""
        self.state = CircuitState.HALF_OPEN
        self.success_count = 0
        self.state_changes += 1
        
        self.logger.info(
            f"Circuit breaker '{self.config.name}' transitioned to HALF_OPEN state"
        )
    
    def _transition_to_closed(self):
        """Transition to CLOSED state"""
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.next_attempt_time = None
        self.state_changes += 1
        
        self.logger.info(
            f"Circuit breaker '{self.config.name}' transitioned to CLOSED state"
        )
    
    def get_stats(self) -> Dict[str, Any]:
        """Get circuit breaker statistics"""
        return {
            'name': self.config.name,
            'state': self.state.value,
            'failure_count': self.failure_count,
            'success_count': self.success_count,
            'total_requests': self.total_requests,
            'successful_requests': self.successful_requests,
            'failed_requests': self.failed_requests,
            'state_changes': self.state_changes,
            'last_failure_time': self.last_failure_time.isoformat() if self.last_failure_time else None,
            'next_attempt_time': self.next_attempt_time.isoformat() if self.next_attempt_time else None,
            'success_rate': (self.successful_requests / self.total_requests * 100) if self.total_requests > 0 else 0
        }
    
    def reset(self):
        """Manually reset the circuit breaker to CLOSED state"""
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
        self.next_attempt_time = None
        self.state_changes += 1
        
        self.logger.info(f"Circuit breaker '{self.config.name}' manually reset to CLOSED state")
    
    def force_open(self):
        """Force the circuit breaker to OPEN state"""
        self._transition_to_open()
    
    def force_closed(self):
        """Force the circuit breaker to CLOSED state"""
        self._transition_to_closed()


class CircuitBreakerOpenError(Exception):
    """Exception raised when circuit breaker is open"""
    pass


class CircuitBreakerManager:
    """Manager for multiple circuit breakers"""
    
    def __init__(self):
        self.breakers: Dict[str, CircuitBreaker] = {}
        self.logger = logging.getLogger(__name__)
    
    def get_breaker(self, name: str, config: CircuitBreakerConfig = None) -> CircuitBreaker:
        """Get or create a circuit breaker"""
        if name not in self.breakers:
            if config is None:
                config = CircuitBreakerConfig(name=name)
            self.breakers[name] = CircuitBreaker(config)
        
        return self.breakers[name]
    
    def get_all_stats(self) -> Dict[str, Dict[str, Any]]:
        """Get statistics for all circuit breakers"""
        return {name: breaker.get_stats() for name, breaker in self.breakers.items()}
    
    def reset_all(self):
        """Reset all circuit breakers"""
        for breaker in self.breakers.values():
            breaker.reset()
    
    def get_unhealthy_breakers(self, failure_rate_threshold: float = 50.0) -> list:
        """Get list of unhealthy circuit breakers"""
        unhealthy = []
        for name, breaker in self.breakers.items():
            stats = breaker.get_stats()
            if stats['total_requests'] > 5 and stats['success_rate'] < failure_rate_threshold:
                unhealthy.append(name)
        return unhealthy