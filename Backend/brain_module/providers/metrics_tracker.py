"""
Comprehensive Metrics Tracker

Tracks detailed metrics for each API key including:
- Total number of calls made
- Token consumption tracking  
- Success/failure rates
- Response times
- Error patterns
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path


@dataclass
class APIMetrics:
    """Individual API key metrics"""
    provider: str
    key_name: str
    api_key_env: str
    total_calls: int = 0
    successful_calls: int = 0
    failed_calls: int = 0
    total_tokens_used: int = 0
    avg_response_time: float = 0.0
    min_response_time: float = float('inf')
    max_response_time: float = 0.0
    last_used: Optional[datetime] = None
    last_success: Optional[datetime] = None
    last_failure: Optional[datetime] = None
    error_count: int = 0
    success_rate: float = 100.0
    
    # Error pattern tracking
    error_types: Dict[str, int] = None
    consecutive_failures: int = 0
    consecutive_successes: int = 0
    
    def __post_init__(self):
        if self.error_types is None:
            self.error_types = {}
    
    def add_call(self, success: bool, response_time: float, tokens_used: int = 0, error_type: str = None):
        """Add a call record to metrics"""
        self.total_calls += 1
        self.last_used = datetime.utcnow()
        
        # Update response time metrics
        self.avg_response_time = ((self.avg_response_time * (self.total_calls - 1)) + response_time) / self.total_calls
        self.min_response_time = min(self.min_response_time, response_time)
        self.max_response_time = max(self.max_response_time, response_time)
        
        # Update token usage
        self.total_tokens_used += tokens_used
        
        if success:
            self.successful_calls += 1
            self.last_success = datetime.utcnow()
            self.consecutive_failures = 0
            self.consecutive_successes += 1
        else:
            self.failed_calls += 1
            self.last_failure = datetime.utcnow()
            self.consecutive_failures += 1
            self.consecutive_successes = 0
            self.error_count += 1
            
            if error_type:
                self.error_types[error_type] = self.error_types.get(error_type, 0) + 1
        
        # Calculate success rate
        if self.total_calls > 0:
            self.success_rate = (self.successful_calls / self.total_calls) * 100


class MetricsTracker:
    """Comprehensive metrics tracking system"""
    
    def __init__(self, metrics_file: str = "logs/metrics.json"):
        self.logger = logging.getLogger(__name__)
        self.metrics_file = Path(metrics_file)
        self.metrics_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Store metrics for all API keys
        self.api_metrics: Dict[str, APIMetrics] = {}
        
        # Load existing metrics
        self._load_metrics()
        
        # Aggregate provider metrics
        self.provider_stats: Dict[str, Dict] = {}
        self._update_provider_stats()
    
    def _load_metrics(self):
        """Load metrics from file"""
        if self.metrics_file.exists():
            try:
                with open(self.metrics_file, 'r') as f:
                    data = json.load(f)
                    for key_id, metrics_data in data.items():
                        # Convert datetime strings back to datetime objects
                        if metrics_data.get('last_used'):
                            metrics_data['last_used'] = datetime.fromisoformat(metrics_data['last_used'])
                        if metrics_data.get('last_success'):
                            metrics_data['last_success'] = datetime.fromisoformat(metrics_data['last_success'])
                        if metrics_data.get('last_failure'):
                            metrics_data['last_failure'] = datetime.fromisoformat(metrics_data['last_failure'])
                        
                        self.api_metrics[key_id] = APIMetrics(**metrics_data)
                        
                self.logger.info(f"Loaded metrics for {len(self.api_metrics)} API keys")
                
            except Exception as e:
                self.logger.error(f"Failed to load metrics: {e}")
    
    def _save_metrics(self):
        """Save metrics to file"""
        try:
            # Convert datetime objects to ISO strings for JSON serialization
            metrics_data = {}
            for key_id, metrics in self.api_metrics.items():
                metrics_dict = asdict(metrics)
                for field in ['last_used', 'last_success', 'last_failure']:
                    if metrics_dict[field]:
                        metrics_dict[field] = metrics_dict[field].isoformat()
                metrics_data[key_id] = metrics_dict
            
            with open(self.metrics_file, 'w') as f:
                json.dump(metrics_data, f, indent=2)
                
        except Exception as e:
            self.logger.error(f"Failed to save metrics: {e}")
    
    def _update_provider_stats(self):
        """Update aggregate provider statistics"""
        self.provider_stats = {}
        
        for key_id, metrics in self.api_metrics.items():
            provider = metrics.provider
            
            if provider not in self.provider_stats:
                self.provider_stats[provider] = {
                    'total_calls': 0,
                    'successful_calls': 0,
                    'failed_calls': 0,
                    'total_tokens_used': 0,
                    'avg_response_time': 0.0,
                    'active_keys': 0,
                    'total_keys': 0,
                    'success_rate': 100.0,
                    'last_updated': datetime.utcnow().isoformat()
                }
            
            stats = self.provider_stats[provider]
            stats['total_calls'] += metrics.total_calls
            stats['successful_calls'] += metrics.successful_calls
            stats['failed_calls'] += metrics.failed_calls
            stats['total_tokens_used'] += metrics.total_tokens_used
            stats['total_keys'] += 1
            
            # Calculate average response time across all keys
            if stats['total_calls'] > 0:
                total_response_time = 0
                total_call_count = 0
                for other_key_id, other_metrics in self.api_metrics.items():
                    if other_metrics.provider == provider:
                        total_response_time += other_metrics.avg_response_time * other_metrics.total_calls
                        total_call_count += other_metrics.total_calls
                
                if total_call_count > 0:
                    stats['avg_response_time'] = total_response_time / total_call_count
            
            # Calculate overall success rate
            if stats['total_calls'] > 0:
                stats['success_rate'] = (stats['successful_calls'] / stats['total_calls']) * 100
            
            stats['last_updated'] = datetime.utcnow().isoformat()
        
        # Count active keys (keys used in last 24 hours)
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        for provider in self.provider_stats:
            active_keys = 0
            for key_id, metrics in self.api_metrics.items():
                if metrics.provider == provider and metrics.last_used and metrics.last_used > cutoff_time:
                    active_keys += 1
            self.provider_stats[provider]['active_keys'] = active_keys
    
    def record_api_call(self, provider: str, key_name: str, api_key_env: str, 
                       success: bool, response_time: float, tokens_used: int = 0, 
                       error_type: str = None):
        """Record an API call with detailed metrics"""
        key_id = f"{provider}_{key_name}_{api_key_env}"
        
        if key_id not in self.api_metrics:
            self.api_metrics[key_id] = APIMetrics(
                provider=provider,
                key_name=key_name,
                api_key_env=api_key_env
            )
        
        self.api_metrics[key_id].add_call(success, response_time, tokens_used, error_type)
        
        # Update provider stats
        self._update_provider_stats()
        
        # Save periodically (every 10 calls)
        if self.api_metrics[key_id].total_calls % 10 == 0:
            self._save_metrics()
    
    def get_key_metrics(self, provider: str, key_name: str, api_key_env: str) -> Optional[APIMetrics]:
        """Get metrics for a specific API key"""
        key_id = f"{provider}_{key_name}_{api_key_env}"
        return self.api_metrics.get(key_id)
    
    def get_provider_metrics(self, provider: str) -> Optional[Dict]:
        """Get aggregate metrics for a provider"""
        return self.provider_stats.get(provider)
    
    def get_all_provider_metrics(self) -> Dict[str, Dict]:
        """Get metrics for all providers"""
        return self.provider_stats.copy()
    
    def get_unhealthy_keys(self, failure_rate_threshold: float = 50.0) -> List[str]:
        """Get list of API keys that are unhealthy (high failure rate)"""
        unhealthy_keys = []
        
        for key_id, metrics in self.api_metrics.items():
            if metrics.total_calls > 10 and metrics.success_rate < failure_rate_threshold:
                unhealthy_keys.append(key_id)
        
        return unhealthy_keys
    
    def get_exhausted_keys(self, call_limit: int = 1000) -> List[str]:
        """Get list of API keys that have reached their call limit"""
        exhausted_keys = []
        
        for key_id, metrics in self.api_metrics.items():
            if metrics.total_calls >= call_limit:
                exhausted_keys.append(key_id)
        
        return exhausted_keys
    
    def get_best_key(self, provider: str) -> Optional[str]:
        """Get the best performing key for a provider"""
        provider_keys = [(key_id, metrics) for key_id, metrics in self.api_metrics.items() 
                        if metrics.provider == provider]
        
        if not provider_keys:
            return None
        
        # Sort by success rate, then by total calls (prefer proven keys)
        provider_keys.sort(key=lambda x: (x[1].success_rate, x[1].total_calls), reverse=True)
        
        return provider_keys[0][0]
    
    def reset_metrics(self, provider: str = None, key_id: str = None):
        """Reset metrics for a provider or specific key"""
        if key_id:
            # Reset specific key
            if key_id in self.api_metrics:
                metrics = self.api_metrics[key_id]
                metrics.total_calls = 0
                metrics.successful_calls = 0
                metrics.failed_calls = 0
                metrics.total_tokens_used = 0
                metrics.error_types = {}
                metrics.consecutive_failures = 0
                metrics.consecutive_successes = 0
        elif provider:
            # Reset all keys for a provider
            keys_to_reset = [key_id for key_id, metrics in self.api_metrics.items() 
                           if metrics.provider == provider]
            for key_id in keys_to_reset:
                self.reset_metrics(key_id=key_id)
        else:
            # Reset all metrics
            self.api_metrics.clear()
        
        self._update_provider_stats()
        self._save_metrics()
    
    def export_metrics(self, filename: str = None) -> str:
        """Export metrics to a file"""
        if not filename:
            filename = f"metrics_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        
        export_data = {
            'export_timestamp': datetime.utcnow().isoformat(),
            'api_metrics': {},
            'provider_stats': self.provider_stats
        }
        
        # Convert API metrics
        for key_id, metrics in self.api_metrics.items():
            metrics_dict = asdict(metrics)
            for field in ['last_used', 'last_success', 'last_failure']:
                if metrics_dict[field]:
                    metrics_dict[field] = metrics_dict[field].isoformat()
            export_data['api_metrics'][key_id] = metrics_dict
        
        with open(filename, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        return filename