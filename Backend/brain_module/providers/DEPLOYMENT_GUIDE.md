"""
PROVIDER MANAGEMENT SYSTEM - DEPLOYMENT GUIDE
==============================================

A completely redesigned provider management system with intelligent routing,
comprehensive monitoring, and robust fallback capabilities.

OVERVIEW
--------
This system provides:

1. **Automatic Fallback**: Seamless fallback between OpenRouter, Grok, and Gemini APIs
2. **1000 Call Limit Enforcement**: Strict limit of 1000 API calls per provider
3. **Multi-Key Support**: Multiple API keys per provider with secure rotation
4. **Comprehensive Monitoring**: Detailed metrics, health checks, and alerting
5. **Circuit Breaker Pattern**: Prevents cascading failures
6. **Retry Logic**: Exponential backoff for temporary failures
7. **Production Ready**: Complete logging, monitoring, and maintenance capabilities

ARCHITECTURE
------------

```
┌─────────────────────────────────────────────────────────────┐
│                    Provider Manager                         │
│                  (Intelligent Routing)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ OpenRouter  │  │    Grok     │  │   Gemini    │         │
│  │ Provider    │  │  Provider   │  │  Provider   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │API Key Mgr  │  │ Circuit Brk │  │Metrics Trk  │         │
│  │& Rotation   │  │    Pattern  │  │   System    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

KEY FEATURES
-----------

### 1. Intelligent Provider Routing
- **Priority-based fallback**: OpenRouter → Grok → Gemini
- **Health-aware routing**: Automatically avoids unhealthy providers
- **Load balancing**: Distributes requests across healthy keys
- **Response time optimization**: Prefers faster providers

### 2. API Key Management
- **Multiple keys per provider**: Primary, secondary, and backup keys
- **Automatic rotation**: Switches to backup keys when primary fails
- **1000 call limit enforcement**: Strict daily limits per provider
- **Secure storage**: Keys stored in environment variables
- **Health monitoring**: Tracks success/failure rates per key

### 3. Circuit Breaker Pattern
- **Failure threshold**: 5 consecutive failures opens circuit
- **Recovery timeout**: 60 seconds before half-open testing
- **Success threshold**: 3 successes needed to close from half-open
- **State management**: CLOSED → OPEN → HALF_OPEN → CLOSED

### 4. Retry Logic with Exponential Backoff
- **Smart retries**: Only retries on temporary failures
- **Exponential backoff**: 1s → 2s → 4s delays
- **Configurable attempts**: Default 3 retry attempts
- **Error categorization**: Different handling for different error types

### 5. Comprehensive Metrics Tracking
- **Per-key metrics**: Calls, success rate, response time, token usage
- **Per-provider metrics**: Aggregate statistics across all keys
- **Performance tracking**: Response times, throughput, availability
- **Error patterns**: Detailed error categorization and trends
- **Export capabilities**: JSON export for analysis

### 6. Production Logging
- **Structured logging**: JSON format for easy parsing
- **Multi-level logging**: DEBUG, INFO, WARNING, ERROR levels
- **File rotation**: Automatic log file management
- **Performance logging**: Response time and success rate tracking

SETUP REQUIREMENTS
-----------------

### Dependencies
```bash
pip install openai requests google-generativeai pyyaml
```

### Environment Variables
Create a `.env` file with the following variables:

```bash
# OpenRouter API Keys (Primary provider)
OPENROUTER_API_KEY=your_primary_openrouter_key
OPENROUTER_KEY_2=your_secondary_openrouter_key
OPENROUTER_KEY_3=your_backup_openrouter_key

# Groq API Keys (Secondary provider)  
GROQ_API_KEY=your_primary_groq_key
GROQ_API_KEY_2=your_secondary_groq_key

# Google Gemini API Keys (Tertiary provider)
GEMINI_API_KEY=your_primary_gemini_key
GEMINI_API_KEY_2=your_secondary_gemini_key

# Optional: OpenRouter site identification
SITE_URL=https://your-domain.com
SITE_NAME=Your Application Name
```

INSTALLATION
-----------

### 1. Install Dependencies
```bash
pip install openai requests google-generativeai pyyaml
```

### 2. Set Environment Variables
Create `.env` file with your API keys as shown above.

### 3. Configure Providers
```python
from providers import ProviderManager, setup_providers_from_config
from providers.config_manager import ProviderConfigManager

# Initialize provider manager
manager = ProviderManager(
    metrics_file="logs/metrics.json",
    log_level="INFO",
    enable_monitoring=True,
    monitoring_interval=60
)

# Setup from configuration
config_manager = ProviderConfigManager()
setup_providers_from_config(manager, config_manager)
```

### 4. Test Configuration
```bash
python brain_module/providers/quick_test.py
```

USAGE EXAMPLES
--------------

### Basic Usage
```python
from providers import ProviderManager

# Initialize manager
manager = ProviderManager()

# Add API keys
manager.add_provider_api_key(
    provider="openrouter",
    key_env="OPENROUTER_API_KEY",
    key_name="primary",
    priority=1,
    daily_limit=1000
)

# Configure models
manager.configure_provider_model(
    provider="openrouter",
    model_name="z-ai/grok-4.1-fast:free",
    max_tokens=4000,
    temperature=0.7
)

# Generate completion with automatic fallback
messages = [{"role": "user", "content": "Hello, how are you?"}]
result = manager.generate_completion(
    messages=messages,
    model="z-ai/grok-4.1-fast:free"
)

if result['success']:
    print(f"Response: {result['content']}")
    print(f"Provider: {result['provider']}")
    print(f"Tokens: {result['tokens_used']}")
else:
    print(f"Error: {result['error']}")
```

### Advanced Configuration
```python
# Custom provider preference
result = manager.generate_completion(
    messages=messages,
    provider_preference=["gemini", "openrouter", "grok"]  # Gemini first
)

# With additional parameters
result = manager.generate_completion(
    messages=messages,
    max_tokens=2000,
    temperature=0.8,
    site_url="https://myapp.com",
    site_name="My Application"
)
```

### Health Monitoring
```python
# Get provider status
status = manager.get_provider_status("openrouter")
print(f"OpenRouter status: {status['health']['status']}")
print(f"Remaining calls: {status['health']['remaining_calls']}")

# Get comprehensive metrics
metrics = manager.get_all_metrics()
print(f"Total calls today: {metrics['provider_metrics']['openrouter']['total_calls']}")

# Validate all providers
validation = manager.validate_all_providers()
print(f"OpenRouter keys valid: {validation['openrouter']}")
```

### Key Management
```python
# Reactivate a failed key
manager.providers["openrouter"].key_manager.reactivate_key("primary")

# Reset provider usage
manager.reset_provider_metrics("openrouter")

# Get key health
key_health = manager.providers["openrouter"].key_manager.get_key_health("primary")
print(f"Key calls today: {key_health['calls_today']}")
print(f"Success rate: {key_health['success_rate']}%")
```

MONITORING AND MAINTENANCE
-------------------------

### 1. Metrics Dashboard
The system provides real-time metrics:
- Provider health status
- API call counts and limits
- Success/failure rates
- Response time statistics
- Token usage tracking

### 2. Health Checks
- **Automatic health monitoring**: Background thread updates provider health
- **Circuit breaker status**: Real-time failure protection state
- **Key rotation**: Automatic switching to healthy keys
- **Call limit enforcement**: Prevents exceeding daily limits

### 3. Alerting
The system generates alerts for:
- Provider exhaustion (1000 call limit reached)
- High failure rates (>50% failure rate)
- Circuit breaker activation
- Key health degradation

### 4. Log Analysis
Logs are structured for easy analysis:
```bash
# View recent errors
grep "ERROR" logs/provider_manager.log

# Analyze provider performance
grep "Completion successful" logs/provider_manager.log | tail -10

# Monitor circuit breaker states
grep "Circuit breaker" logs/provider_manager.log
```

TROUBLESHOOTING
---------------

### Common Issues

1. **"No available API keys"**
   - Check environment variables are set correctly
   - Verify API keys are valid
   - Ensure keys are not exhausted

2. **"Provider call limit reached"**
   - Wait for daily reset (UTC midnight)
   - Use backup keys if configured
   - Monitor usage with `get_provider_status()`

3. **High failure rates**
   - Check API key validity
   - Verify network connectivity
   - Review circuit breaker status

4. **Circuit breaker open**
   - Provider experiencing high failure rate
   - System will automatically attempt recovery
   - Monitor with health checks

### Debug Mode
```python
# Enable debug logging
manager = ProviderManager(log_level="DEBUG")

# Check detailed metrics
metrics = manager.get_all_metrics()
print(json.dumps(metrics, indent=2))
```

PRODUCTION DEPLOYMENT
--------------------

### 1. Environment Setup
- Use production API keys
- Set appropriate log levels (INFO for production)
- Configure monitoring and alerting
- Set up log rotation and retention

### 2. Scaling
- Multiple provider instances for high availability
- Load balancing across provider managers
- Horizontal scaling of the system
- Database integration for metrics persistence

### 3. Monitoring
- Health check endpoints
- Metrics export for monitoring tools
- Alert integration with notification systems
- Performance dashboards

### 4. Security
- Secure API key storage (environment variables)
- Access logging and audit trails
- Rate limiting and abuse prevention
- Network security and encryption

MIGRATION GUIDE
--------------

### From Legacy System
1. **Backup existing configuration**
2. **Export current metrics and usage data**
3. **Update API key references to environment variables**
4. **Migrate configuration to new YAML format**
5. **Test with new system before full deployment**
6. **Gradual rollout with monitoring**

### Backward Compatibility
The new system is designed to be a drop-in replacement with enhanced features.

SUPPORT
-------

### Documentation
- API reference in code docstrings
- Configuration examples in config files
- Test suite for validation

### Testing
```bash
# Run comprehensive tests
python brain_module/providers/test_suite.py

# Quick model test
python brain_module/providers/quick_test.py

# Configuration validation
python -c "from providers.config_manager import ProviderConfigManager; c=ProviderConfigManager(); print(c.get_config_summary())"
```

### Logs
- Provider manager logs: `logs/provider_manager.log`
- Metrics data: `logs/metrics.json`
- Test results: `PR/quick_test_*.txt`

CONCLUSION
----------

This redesigned provider management system provides enterprise-grade reliability, monitoring, and maintainability while keeping the simple API interface. The system is production-ready with comprehensive fault tolerance, monitoring, and management capabilities.

Key Benefits:
✅ **High Availability**: Automatic fallback ensures service continuity
✅ **Cost Control**: Strict call limits prevent unexpected usage
✅ **Performance Monitoring**: Detailed metrics for optimization
✅ **Fault Tolerance**: Circuit breaker and retry patterns
✅ **Easy Management**: Simple configuration and monitoring
✅ **Production Ready**: Comprehensive logging and alerting

The system scales from development to production environments while maintaining the same simple interface.