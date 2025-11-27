# Enhanced Key Manager + Model Fallback System

This document describes the enhanced features of the Brain Module, including the new Key Manager + Model Fallback System that provides improved reliability, performance, and scalability.

## Overview

The enhanced system introduces several advanced features:

1. **Multi-API Key Support** - Automatic rotation and management of multiple API keys per provider
2. **Model Fallback Logic** - Intelligent model selection and fallback based on usage and priority
3. **Comprehensive Error Handling** - Advanced error classification and recovery mechanisms
4. **Performance Monitoring** - Real-time metrics and statistics tracking
5. **Enhanced Configuration** - Flexible configuration system with global and provider-specific settings

## Key Features

### 1. Multi-API Key Support

The system now supports multiple API keys per provider with automatic rotation:

```yaml
providers:
  openrouter:
    api_keys:
      - key_env: "OPENROUTER_API_KEY_1"
        name: "primary_key"
        priority: 1
        daily_limit: 1000
        enabled: true
      - key_env: "OPENROUTER_API_KEY_2"
        name: "secondary_key"
        priority: 2
        daily_limit: 500
        enabled: true
```

**Benefits:**
- Automatic key rotation to distribute load
- Failover support when primary keys are exhausted
- Usage tracking per key
- Priority-based key selection

### 2. Model Fallback Logic

Intelligent model selection with fallback capabilities:

```yaml
providers:
  openrouter:
    models:
      - name: "x-ai/grok-4.1-fast:free"
        priority: 1
        max_tokens: 4000
        enabled: true
      - name: "anthropic/claude-3.5-sonnet"
        priority: 2
        max_tokens: 4000
        enabled: true
```

**Features:**
- Priority-based model selection
- Daily usage limits per model
- Automatic fallback to secondary models
- Usage tracking and monitoring

### 3. Comprehensive Error Handling

Advanced error classification and recovery:

```python
# Error classification
error_types = {
    "rate_limit": "Rate limit exceeded",
    "authentication": "Authentication failed",
    "timeout": "Request timeout",
    "unknown": "Unknown error"
}
```

**Recovery Strategies:**
- Automatic retry with exponential backoff
- Provider fallback on persistent failures
- Graceful degradation when all providers fail
- Detailed error logging and reporting

### 4. Performance Monitoring

Real-time metrics and statistics tracking:

```python
# Available metrics
metrics = {
    "total_requests": 150,
    "successful_requests": 142,
    "failed_requests": 8,
    "success_rate": 94.7,
    "avg_response_time": 1.8,
    "provider_usage": {
        "openrouter": 89,
        "gemini": 7,
        "groq": 4
    }
}
```

**Monitoring Features:**
- Request success/failure tracking
- Response time monitoring
- Provider usage statistics
- Error rate analysis
- Performance alerts

### 5. Enhanced Configuration

Flexible configuration system with multiple levels:

```yaml
# Global settings
global:
  logging:
    level: INFO
    format: "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
  performance:
    timeout: 30
    retry_attempts: 3
    max_concurrent_requests: 5

# Task-specific settings
tasks:
  chat:
    default_provider: "openrouter"
    default_model: "x-ai/grok-4.1-fast:free"
    fallback_providers: ["gemini", "groq"]
    max_tokens: 4000
    temperature: 0.7
```

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Brain Core Engine                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ Config Manager  │  │ Key Manager     │  │ Model Mgr   │  │
│  │                 │  │                 │  │             │  │
│  │ - Load Config   │  │ - Key Rotation  │  │ - Model Sel │  │
│  │ - Validation    │  │ - Usage Track   │  │ - Fallback  │  │
│  │ - Updates       │  │ - Priority      │  │ - Limits    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ Provider Mgr    │  │ Fallback Handler│  │ Text Extr   │  │
│  │                 │  │                 │  │             │  │
│  │ - Provider Sel  │  │ - Error Class   │  │ - Unstruct  │  │
│  │ - Load Balancing│  │ - Retry Logic   │  │ - Layout    │  │
│  │ - Health Check  │  │ - Fallback Chain│  │ - OCR       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Input Processing** - Brain Core receives input (text or file)
2. **Configuration Loading** - Config Manager loads and validates settings
3. **Key Selection** - Key Manager selects appropriate API key
4. **Model Selection** - Model Manager selects optimal model
5. **Provider Request** - Provider Manager sends request to selected provider
6. **Error Handling** - Fallback Handler manages errors and retries
7. **Response Processing** - Response is processed and saved
8. **Statistics Update** - Performance metrics are updated

## Usage Examples

### Basic Usage

```python
from brain_core import BrainCore

# Initialize enhanced brain core
brain = BrainCore("config/enhanced_providers.yaml")

# Process text input
result = brain.process_input("Hello, how are you?", task_type="chat")
print(f"Response: {result.response}")
print(f"Provider: {result.provider}")
print(f"Model: {result.model}")

# Process file input
result = brain.process_input("path/to/document.pdf", task_type="resume_parsing")
print(f"Extracted info: {result.response}")
```

### Advanced Usage

```python
# Get system status
status = brain.get_brain_status()
print(f"Total requests: {status['brain_stats']['total_requests']}")
print(f"Success rate: {status['brain_stats']['success_rate']:.1f}%")

# Export statistics
brain.export_brain_stats("logs/brain_stats.json")

# Reload configuration
brain.reload_configuration()

# Validate configuration
validation = brain.validate_configuration()
if not validation['valid']:
    print("Configuration issues:", validation['issues'])
```

### Configuration Management

```python
from config_manager import ConfigManager

# Load enhanced configuration
config = ConfigManager("config/enhanced_providers.yaml")

# Get provider configuration
provider_config = config.get_provider_config("openrouter")
print(f"Provider name: {provider_config['name']}")
print(f"API keys: {len(provider_config['api_keys'])}")

# Get task configuration
task_config = config.get_task_config("resume_parsing")
print(f"Default provider: {task_config['default_provider']}")
print(f"Max tokens: {task_config['max_tokens']}")
```

### Key Management

```python
from key_manager import KeyManager

# Initialize key manager
key_manager = KeyManager(config_manager)

# Get API key (with rotation)
api_key = key_manager.get_api_key("openrouter")
print(f"Selected key: {api_key}")

# Record usage
key_manager.record_usage("openrouter", api_key, 100)

# Check usage
usage = key_manager.get_key_usage("openrouter", api_key)
print(f"Current usage: {usage}")
```

### Model Management

```python
from model_manager import ModelManager

# Initialize model manager
model_manager = ModelManager(config_manager)

# Get provider models
provider_config = config_manager.get_provider_config("openrouter")
models = provider_config["models"]

# Select model (with fallback)
selected_model = model_manager.select_model("openrouter", models)
print(f"Selected model: {selected_model['name']}")

# Record model usage
model_manager.record_model_usage("openrouter", selected_model["name"], 50)
```

## Performance Optimization

### 1. Key Rotation Strategy

The system implements intelligent key rotation:

- **Priority-based selection** - Higher priority keys are used first
- **Usage-based rotation** - Keys are rotated based on usage patterns
- **Load distribution** - Multiple keys share the load to prevent rate limiting
- **Automatic failover** - Secondary keys are used when primary keys fail

### 2. Model Selection Optimization

Model selection is optimized for performance:

- **Priority-based selection** - Highest priority models are selected first
- **Usage tracking** - Models with remaining capacity are preferred
- **Fallback chains** - Secondary models are used when primary models are exhausted
- **Dynamic adjustment** - Model selection adapts to usage patterns

### 3. Error Recovery Optimization

Error recovery is optimized for reliability:

- **Exponential backoff** - Retry delays increase with each attempt
- **Smart classification** - Errors are classified for appropriate handling
- **Provider fallback** - Different providers are tried on persistent failures
- **Graceful degradation** - System continues to function even with partial failures

## Monitoring and Analytics

### Available Metrics

The system provides comprehensive metrics:

- **Request Statistics**
  - Total requests
  - Successful requests
  - Failed requests
  - Success rate
  - Failure rate

- **Performance Metrics**
  - Average response time
  - Response time distribution
  - Request throughput
  - Error rates

- **Provider Metrics**
  - Provider usage statistics
  - Provider response times
  - Provider error rates
  - Provider availability

- **Key and Model Metrics**
  - API key usage
  - Model usage
  - Daily limit tracking
  - Priority-based selection statistics

### Monitoring Configuration

```yaml
monitoring:
  enable_metrics: true
  metrics_interval: 60  # seconds
  export_metrics: true
  metrics_file: "logs/metrics.json"
  
  # Alert thresholds
  alerts:
    failure_rate_threshold: 0.1  # 10%
    response_time_threshold: 30  # seconds
    error_rate_threshold: 0.05  # 5%
```

## Best Practices

### 1. Configuration Management

- Use environment variables for sensitive data
- Implement proper validation for configuration files
- Regularly review and update configuration settings
- Test configuration changes in development first

### 2. API Key Management

- Use multiple API keys per provider
- Monitor key usage regularly
- Set appropriate daily limits
- Implement proper key rotation

### 3. Model Selection

- Configure appropriate models for each task type
- Set realistic daily limits
- Monitor model performance
- Update model configurations regularly

### 4. Error Handling

- Monitor error rates and patterns
- Implement appropriate retry strategies
- Use fallback providers effectively
- Log errors for analysis

### 5. Performance Optimization

- Monitor response times
- Optimize prompt construction
- Use appropriate model parameters
- Implement caching where beneficial

## Troubleshooting

### Common Issues

1. **Configuration Validation Errors**
   - Check YAML syntax
   - Verify required fields are present
   - Ensure environment variables are set

2. **API Key Issues**
   - Verify API keys are valid
   - Check daily limits
   - Ensure proper environment variable names

3. **Model Selection Issues**
   - Verify model availability
   - Check daily limits
   - Ensure model configurations are correct

4. **Performance Issues**
   - Monitor response times
   - Check provider health
   - Review configuration settings

### Debug Mode

Enable debug logging for troubleshooting:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Or in configuration
global:
  logging:
    level: DEBUG
```

## Future Enhancements

The enhanced system is designed to be extensible. Future enhancements may include:

1. **Machine Learning Optimization**
   - Predictive model selection
   - Usage pattern analysis
   - Performance optimization

2. **Advanced Monitoring**
   - Real-time dashboards
   - Alerting systems
   - Performance analytics

3. **Enhanced Security**
   - API key encryption
   - Access control
   - Audit logging

4. **Scalability Improvements**
   - Distributed processing
   - Load balancing
   - Horizontal scaling

## Conclusion

The enhanced Key Manager + Model Fallback System provides significant improvements in reliability, performance, and scalability. The system is designed to be robust, flexible, and easy to maintain while providing comprehensive monitoring and analytics capabilities.

By implementing these enhancements, the Brain Module is now capable of handling production workloads with improved uptime, better performance, and more efficient resource utilization.