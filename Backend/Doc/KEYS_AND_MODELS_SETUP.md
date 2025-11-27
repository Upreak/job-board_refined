# How to Add Keys and Models to the Enhanced Brain Module

This guide provides step-by-step instructions for adding API keys and models to the enhanced Brain Module system.

## Overview

The enhanced system supports:
- **Multiple API keys per provider** with automatic rotation
- **Multiple models per provider** with priority-based selection
- **Environment variable-based configuration** for security
- **Dynamic configuration updates** without system restart

## Step 1: Get API Keys from Providers

### OpenRouter
1. Go to [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to API Keys section
4. Create multiple API keys (recommended)
5. Copy the keys

### Gemini (Google)
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key

### Groq
1. Go to [Groq Console](https://console.groq.com)
2. Sign up for an account
3. Navigate to API Keys section
4. Create multiple API keys (recommended)
5. Copy the keys

## Step 2: Set Up Environment Variables

### Method 1: Using .env File (Recommended)

Create a `.env` file in the `brain_module` directory:

```bash
# OpenRouter API Keys
OPENROUTER_API_KEY_1="sk-or-xxxxx-xxxxx-xxxxx-xxxxx"
OPENROUTER_API_KEY_2="sk-or-yyyyy-yyyyy-yyyyy-yyyyy"
OPENROUTER_API_KEY_3="sk-or-zzzzz-zzzzz-zzzzz-zzzzz"

# Gemini API Keys
GEMINI_API_KEY_1="AIzaSy..."
GEMINI_API_KEY_2="AIzaSy..."

# Groq API Keys
GROQ_API_KEY_1="gsk_xxxxx..."
GROQ_API_KEY_2="gsk_yyyyy..."
```

### Method 2: Using System Environment Variables

**Windows:**
```cmd
set OPENROUTER_API_KEY_1="sk-or-xxxxx-xxxxx-xxxxx-xxxxx"
set OPENROUTER_API_KEY_2="sk-or-yyyyy-yyyyy-yyyyy-yyyyy"
set GEMINI_API_KEY_1="AIzaSy..."
set GROQ_API_KEY_1="gsk_xxxxx..."
```

**Linux/Mac:**
```bash
export OPENROUTER_API_KEY_1="sk-or-xxxxx-xxxxx-xxxxx-xxxxx"
export OPENROUTER_API_KEY_2="sk-or-yyyyy-yyyyy-yyyyy-yyyyy"
export GEMINI_API_KEY_1="AIzaSy..."
export GROQ_API_KEY_1="gsk_xxxxx..."
```

## Step 3: Configure Providers in YAML

### Basic Configuration

Edit `config/providers.yaml`:

```yaml
providers:
  - name: openrouter_primary
    adapter: providers.openrouter_provider.OpenRouterProvider
    api_key: "YOUR_OPENROUTER_KEY"  # Single key for basic setup
    api_url: "https://openrouter.ai/api/v1"
    model: "x-ai/grok-4.1-fast:free"
    daily_limit: 500

  - name: gemini_backup
    adapter: providers.gemini_provider.GeminiProvider
    api_key: "YOUR_GEMINI_KEY"
    model: "gemini-1.5-flash"
    daily_limit: 200

  - name: groq_backup
    adapter: providers.groq_provider.GroqProvider
    api_key: "YOUR_GROQ_KEY"
    model: "llama-3.1-70b-versatile"
    daily_limit: 300
```

### Enhanced Configuration (Recommended)

Edit `config/enhanced_providers.yaml`:

```yaml
providers:
  openrouter:
    name: "OpenRouter"
    base_url: "https://openrouter.ai/api/v1"
    
    # Multiple API Keys
    api_keys:
      - key_env: "OPENROUTER_API_KEY_1"
        name: "primary_key"
        priority: 1
        daily_limit: 1000
        usage_reset_hour: 0  # UTC
        enabled: true
      - key_env: "OPENROUTER_API_KEY_2"
        name: "secondary_key"
        priority: 2
        daily_limit: 500
        usage_reset_hour: 0
        enabled: true
      - key_env: "OPENROUTER_API_KEY_3"
        name: "backup_key"
        priority: 3
        daily_limit: 200
        usage_reset_hour: 0
        enabled: false
    
    # Multiple Models with Fallback
    models:
      - name: "x-ai/grok-4.1-fast:free"
        priority: 1
        max_tokens: 4000
        temperature: 0.7
        enabled: true
        daily_limit: 500
      - name: "anthropic/claude-3.5-sonnet"
        priority: 2
        max_tokens: 4000
        temperature: 0.7
        enabled: true
        daily_limit: 300
      - name: "openai/gpt-4-turbo"
        priority: 3
        max_tokens: 4000
        temperature: 0.7
        enabled: true
        daily_limit: 200

  gemini:
    name: "Google Gemini"
    base_url: "https://generativelanguage.googleapis.com/v1beta"
    
    api_keys:
      - key_env: "GEMINI_API_KEY_1"
        name: "primary_key"
        priority: 1
        daily_limit: 1500
        usage_reset_hour: 0
        enabled: true
      - key_env: "GEMINI_API_KEY_2"
        name: "secondary_key"
        priority: 2
        daily_limit: 750
        usage_reset_hour: 0
        enabled: true
    
    models:
      - name: "gemini-1.5-flash"
        priority: 1
        max_tokens: 8192
        temperature: 0.7
        enabled: true
        daily_limit: 200
      - name: "gemini-1.5-pro"
        priority: 2
        max_tokens: 8192
        temperature: 0.7
        enabled: true
        daily_limit: 100
      - name: "gemini-1.0-pro"
        priority: 3
        max_tokens: 30720
        temperature: 0.7
        enabled: true
        daily_limit: 50

  groq:
    name: "Groq"
    base_url: "https://api.groq.com/openai/v1"
    
    api_keys:
      - key_env: "GROQ_API_KEY_1"
        name: "primary_key"
        priority: 1
        daily_limit: 2000
        usage_reset_hour: 0
        enabled: true
      - key_env: "GROQ_API_KEY_2"
        name: "secondary_key"
        priority: 2
        daily_limit: 1000
        usage_reset_hour: 0
        enabled: true
    
    models:
      - name: "llama-3.1-70b-versatile"
        priority: 1
        max_tokens: 8192
        temperature: 0.7
        enabled: true
        daily_limit: 300
      - name: "llama-3.1-8b-instant"
        priority: 2
        max_tokens: 8192
        temperature: 0.7
        enabled: true
        daily_limit: 500
      - name: "mixtral-8x7b-32768"
        priority: 3
        max_tokens: 32768
        temperature: 0.7
        enabled: true
        daily_limit: 200
```

## Step 4: Add New Providers

### Adding a New Provider (Example: OpenAI)

1. **Create the provider implementation**:

```python
# providers/openai_provider.py
from providers.provider_base import ProviderBase
from typing import Dict, Any, Optional
import httpx

class OpenAIProvider(ProviderBase):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get("api_key")
        self.base_url = config.get("base_url", "https://api.openai.com/v1")
        self.model = config.get("model", "gpt-4")
    
    async def get_response(self, prompt: str, **kwargs) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": kwargs.get("max_tokens", 1000),
            "temperature": kwargs.get("temperature", 0.7)
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            return {
                "success": True,
                "provider": "openai",
                "model": self.model,
                "text": result["choices"][0]["message"]["content"],
                "usage": result.get("usage", {}),
                "response_time": kwargs.get("start_time", 0)
            }
```

2. **Add to providers/__init__.py**:

```python
# providers/__init__.py
from .provider_base import ProviderBase
from .openrouter_provider import OpenRouterProvider
from .gemini_provider import GeminiProvider
from .groq_provider import GroqProvider
from .openai_provider import OpenAIProvider  # Add this

__all__ = [
    "ProviderBase",
    "OpenRouterProvider", 
    "GeminiProvider",
    "GroqProvider",
    "OpenAIProvider"  # Add this
]
```

3. **Update configuration**:

```yaml
providers:
  openai:
    name: "OpenAI"
    base_url: "https://api.openai.com/v1"
    api_keys:
      - key_env: "OPENAI_API_KEY_1"
        name: "primary_key"
        priority: 1
        daily_limit: 1000
        enabled: true
    models:
      - name: "gpt-4-turbo"
        priority: 1
        max_tokens: 4000
        temperature: 0.7
        enabled: true
        daily_limit: 200
      - name: "gpt-3.5-turbo"
        priority: 2
        max_tokens: 4000
        temperature: 0.7
        enabled: true
        daily_limit: 500
```

## Step 5: Add New Models

### Adding Models to Existing Providers

Simply add new model entries to the provider's configuration:

```yaml
providers:
  openrouter:
    models:
      # Existing models...
      - name: "meta-llama/llama-3.1-8b-instruct"
        priority: 4
        max_tokens: 8192
        temperature: 0.7
        enabled: true
        daily_limit: 100
      - name: "deepseek/deepseek-chat"
        priority: 5
        max_tokens: 8192
        temperature: 0.7
        enabled: true
        daily_limit: 150
```

### Model Configuration Options

| Parameter | Description | Example |
|-----------|-------------|---------|
| `name` | Model identifier | `"x-ai/grok-4.1-fast:free"` |
| `priority` | Selection priority (1=highest) | `1` |
| `max_tokens` | Maximum tokens for response | `4000` |
| `temperature` | Response randomness | `0.7` |
| `enabled` | Whether model is available | `true` |
| `daily_limit` | Daily usage limit | `500` |

## Step 6: Test Your Configuration

### Test Individual Providers

```python
from brain_core import BrainCore

# Initialize brain core
brain = BrainCore("config/enhanced_providers.yaml")

# Test OpenRouter
try:
    result = brain.process_input("Hello, test message", task_type="chat")
    print(f"OpenRouter test: {result.success}")
    print(f"Provider: {result.provider}")
    print(f"Model: {result.model}")
except Exception as e:
    print(f"OpenRouter test failed: {e}")

# Test Gemini
try:
    result = brain.process_input("Hello, test message", task_type="chat")
    print(f"Gemini test: {result.success}")
    print(f"Provider: {result.provider}")
    print(f"Model: {result.model}")
except Exception as e:
    print(f"Gemini test failed: {e}")

# Test Groq
try:
    result = brain.process_input("Hello, test message", task_type="chat")
    print(f"Groq test: {result.success}")
    print(f"Provider: {result.provider}")
    print(f"Model: {result.model}")
except Exception as e:
    print(f"Groq test failed: {e}")
```

### Test Key Rotation

```python
from key_manager import KeyManager
from config_manager import ConfigManager

config_manager = ConfigManager("config/enhanced_providers.yaml")
key_manager = KeyManager(config_manager)

# Test key rotation
for i in range(5):
    key = key_manager.get_api_key("openrouter")
    print(f"Request {i+1}: Key {key}")
    key_manager.record_usage("openrouter", key, 10)
```

### Test Model Selection

```python
from model_manager import ModelManager
from config_manager import ConfigManager

config_manager = ConfigManager("config/enhanced_providers.yaml")
model_manager = ModelManager(config_manager)

# Test model selection
provider_config = config_manager.get_provider_config("openrouter")
models = provider_config["models"]

for i in range(5):
    selected_model = model_manager.select_model("openrouter", models)
    if selected_model:
        print(f"Request {i+1}: Model {selected_model['name']} (Priority: {selected_model['priority']})")
        model_manager.record_model_usage("openrouter", selected_model["name"], 10)
    else:
        print(f"Request {i+1}: No available models")
```

## Step 7: Monitor Usage and Performance

### Check Usage Statistics

```python
from brain_core import BrainCore

brain = BrainCore("config/enhanced_providers.yaml")

# Get brain statistics
stats = brain.get_brain_stats()
print(f"Total requests: {stats['total_requests']}")
print(f"Successful requests: {stats['successful_requests']}")
print(f"Success rate: {stats['success_rate']:.1f}%")

# Get provider statistics
provider_stats = brain.get_provider_stats()
for provider, stats in provider_stats.items():
    print(f"{provider}: {stats['usage_count']} requests, {stats['success_rate']:.1f}% success")

# Get key usage
key_stats = brain.get_key_stats()
for provider, keys in key_stats.items():
    print(f"{provider}:")
    for key_name, usage in keys.items():
        print(f"  {key_name}: {usage['usage']} tokens used")
```

### Export Statistics

```python
# Export statistics to file
brain.export_brain_stats("logs/usage_stats.json")
brain.export_provider_stats("logs/provider_stats.json")
brain.export_key_stats("logs/key_stats.json")
```

## Step 8: Update Configuration Dynamically

### Reload Configuration

```python
from brain_core import BrainCore

brain = BrainCore("config/enhanced_providers.yaml")

# Make changes to config file
# Then reload:
brain.reload_configuration()

# Validate new configuration
validation = brain.validate_configuration()
if validation['valid']:
    print("Configuration reloaded successfully")
else:
    print("Configuration issues:", validation['issues'])
```

## Step 9: Set Up Monitoring and Alerts

### Configure Monitoring

```yaml
# In enhanced_providers.yaml
monitoring:
  enable_metrics: true
  metrics_interval: 60  # seconds
  export_metrics: true
  metrics_file: "logs/metrics.json"
  
  alerts:
    failure_rate_threshold: 0.1  # 10%
    response_time_threshold: 30  # seconds
    error_rate_threshold: 0.05  # 5%
```

### Monitor System Health

```python
from brain_core import BrainCore

brain = BrainCore("config/enhanced_providers.yaml")

# Get system status
status = brain.get_brain_status()
print(f"System status: {status['status']}")
print(f"Active providers: {len(status['active_providers'])}")
print(f"Available models: {status['available_models']}")

# Check provider health
for provider, health in status['provider_health'].items():
    print(f"{provider}: {health['status']} ({health['success_rate']:.1f}% success)")
```

## Best Practices

### 1. Key Management
- Use multiple API keys per provider
- Set appropriate daily limits
- Monitor key usage regularly
- Rotate keys periodically

### 2. Model Selection
- Configure models with appropriate priorities
- Set realistic daily limits
- Monitor model performance
- Update model configurations regularly

### 3. Security
- Never commit API keys to version control
- Use environment variables or .env files
- Store sensitive data securely
- Regular key rotation

### 4. Performance
- Monitor response times
- Optimize model parameters
- Use appropriate temperature settings
- Monitor error rates

### 5. Monitoring
- Regularly check usage statistics
- Set up alerts for unusual patterns
- Monitor provider health
- Track performance metrics

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Check environment variable names
   - Verify .env file is in correct location
   - Ensure environment variables are loaded

2. **Model Not Available**
   - Check model configuration
   - Verify daily limits haven't been reached
   - Ensure model is enabled

3. **Provider Connection Issues**
   - Check internet connection
   - Verify API endpoints
   - Check provider status

4. **Configuration Validation Errors**
   - Check YAML syntax
   - Verify required fields
   - Ensure proper indentation

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

## Summary

Adding keys and models to the enhanced Brain Module is straightforward:

1. **Get API keys** from your providers
2. **Set environment variables** for security
3. **Configure providers** in YAML files
4. **Add models** with appropriate settings
5. **Test configuration** thoroughly
6. **Monitor usage** and performance
7. **Update dynamically** as needed

The system supports multiple API keys per provider with automatic rotation and multiple models per provider with priority-based selection, ensuring high availability and optimal performance.