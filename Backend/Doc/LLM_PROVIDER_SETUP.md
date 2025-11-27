# LLM Provider Setup Guide

This guide provides detailed instructions for setting up each LLM provider supported by the Brain Module.

## 📋 Overview

The Brain Module supports multiple LLM providers with intelligent fallback. Each provider requires specific setup steps and configuration.

### Supported Providers

1. **OpenRouter** - Primary provider (recommended)
2. **Gemini** - Google's AI (backup option)
3. **Groq** - Fast inference (backup option)

## 🔑 Getting API Keys

### 1. OpenRouter Setup

#### Step 1: Create Account
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Verify your email address

#### Step 2: Get API Key
1. Log in to your OpenRouter dashboard
2. Navigate to API Keys section
3. Click "Create New API Key"
4. Copy the generated API key

#### Step 3: Set Environment Variable
```bash
# Windows
set OPENROUTER_API_KEY=your_openrouter_api_key_here

# macOS/Linux
export OPENROUTER_API_KEY="your_openrouter_api_key_here"
```

#### Step 4: Configure in providers.yaml
```yaml
providers:
  - name: openrouter_primary
    adapter: providers.openrouter_provider.OpenRouterProvider
    api_key_env: "OPENROUTER_API_KEY"
    api_url: "https://openrouter.ai/api/v1"
    model: "x-ai/grok-4.1-fast:free"  # Free tier available
    daily_limit: 500
    enabled: true
```

#### Step 5: Install Dependencies (Optional)
```bash
pip install httpx  # Already in requirements.txt
```

#### Step 6: Test Setup
```bash
python app.py test
```

### 2. Gemini Setup

#### Step 1: Create Account
1. Visit [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Accept the terms of service

#### Step 2: Get API Key
1. Go to "API Keys" section
2. Click "Create API Key"
3. Copy the generated API key
4. Note: You may need to enable the Gemini API in your Google Cloud project

#### Step 3: Set Environment Variable
```bash
# Windows
set GEMINI_API_KEY=your_gemini_api_key_here

# macOS/Linux
export GEMINI_API_KEY="your_gemini_api_key_here"
```

#### Step 4: Install Dependencies
```bash
pip install google-generativeai
```

#### Step 5: Configure in providers.yaml
```yaml
providers:
  - name: gemini_backup
    adapter: providers.gemini_provider.GeminiProvider
    api_key_env: "GEMINI_API_KEY"
    model: "gemini-1.5-flash"  # Free tier available
    daily_limit: 200
    enabled: true
```

#### Step 6: Test Setup
```bash
python app.py test
```

### 3. Groq Setup

#### Step 1: Create Account
1. Visit [Groq Console](https://console.groq.com)
2. Sign up for a free account
3. Verify your email address

#### Step 2: Get API Key
1. Log in to your Groq dashboard
2. Navigate to API Keys section
3. Copy your API key

#### Step 3: Set Environment Variable
```bash
# Windows
set GROQ_API_KEY=your_groq_api_key_here

# macOS/Linux
export GROQ_API_KEY="your_groq_api_key_here"
```

#### Step 4: Install Dependencies
```bash
pip install groq
```

#### Step 5: Configure in providers.yaml
```yaml
providers:
  - name: groq_backup
    adapter: providers.groq_provider.GroqProvider
    api_key_env: "GROQ_API_KEY"
    model: "llama-3.1-70b-versatile"  # Free tier available
    daily_limit: 300
    enabled: true
```

#### Step 6: Test Setup
```bash
python app.py test
```

## 🎯 Provider Configuration Guide

### Provider Priority and Fallback

The Brain Module uses providers in the order they appear in the configuration file:

```yaml
providers:
  - name: openrouter_primary    # Try first
    enabled: true
  
  - name: gemini_backup         # Try second if first fails
    enabled: true
  
  - name: groq_backup          # Try third if second fails
    enabled: true
```

### Provider Selection Strategy

1. **Primary Provider**: First enabled provider in the list
2. **Health Check**: Automatic provider health monitoring
3. **Fallback Logic**: Switch to next provider on failure
4. **Daily Limits**: Track usage and switch when limits reached

### Model Recommendations

| Provider | Model | Best For | Cost Tier |
|----------|-------|----------|-----------|
| OpenRouter | `x-ai/grok-4.1-fast:free` | General chat, fast responses | Free |
| OpenRouter | `anthropic/claude-3.5-sonnet` | Complex reasoning, analysis | Paid |
| Gemini | `gemini-1.5-flash` | Fast processing, general use | Free |
| Gemini | `gemini-1.5-pro` | High quality, complex tasks | Paid |
| Groq | `llama-3.1-70b-versatile` | Fast inference, large context | Free |

## 🔧 Advanced Configuration

### Custom Models

You can use any model supported by the providers:

#### OpenRouter Custom Models
```yaml
providers:
  - name: openrouter_custom
    adapter: providers.openrouter_provider.OpenRouterProvider
    api_key_env: "OPENROUTER_API_KEY"
    model: "anthropic/claude-3-haiku"
    daily_limit: 100
    enabled: true
```

#### Gemini Custom Models
```yaml
providers:
  - name: gemini_custom
    adapter: providers.gemini_provider.GeminiProvider
    api_key_env: "GEMINI_API_KEY"
    model: "gemini-1.5-pro"
    daily_limit: 50
    enabled: true
```

#### Groq Custom Models
```yaml
providers:
  - name: groq_custom
    adapter: providers.groq_provider.GroqProvider
    api_key_env: "GROQ_API_KEY"
    model: "llama-3.1-8b-instant"
    daily_limit: 1000
    enabled: true
```

### Provider-Specific Settings

#### OpenRouter Settings
```yaml
providers:
  - name: openrouter_advanced
    adapter: providers.openrouter_provider.OpenRouterProvider
    api_key_env: "OPENROUTER_API_KEY"
    model: "x-ai/grok-4.1-fast:free"
    daily_limit: 500
    enabled: true
    # OpenRouter specific settings
    base_url: "https://openrouter.ai/api/v1"
    timeout: 30
    max_retries: 3
```

#### Gemini Settings
```yaml
providers:
  - name: gemini_advanced
    adapter: providers.gemini_provider.GeminiProvider
    api_key_env: "GEMINI_API_KEY"
    model: "gemini-1.5-flash"
    daily_limit: 200
    enabled: true
    # Gemini specific settings
    safety_settings: "BLOCK_NONE"
    temperature: 0.7
    top_p: 0.8
    top_k: 40
```

#### Groq Settings
```yaml
providers:
  - name: groq_advanced
    adapter: providers.groq_provider.GroqProvider
    api_key_env: "GROQ_API_KEY"
    model: "llama-3.1-70b-versatile"
    daily_limit: 300
    enabled: true
    # Groq specific settings
    temperature: 0.7
    max_tokens: 4000
    streaming: false
```

## 📊 Usage Monitoring

### Daily Limits

Each provider can have a daily limit to prevent excessive usage:

```yaml
providers:
  - name: openrouter_primary
    daily_limit: 500    # Max 500 requests per day
    enabled: true
```

### Usage Statistics

Monitor your usage with:

```bash
python app.py stats
```

This will show:
- Total requests per provider
- Daily usage vs limits
- Success rates
- Average response times

### Provider Health

Check provider health:

```bash
python app.py test
```

## 🚨 Troubleshooting Provider Issues

### Common Provider Issues

#### 1. Authentication Failures

**Symptoms**: "API key not found" or "Authentication failed"

**Solutions**:
- Verify environment variables are set correctly
- Check API keys are valid and not expired
- Ensure API keys have sufficient permissions

```bash
# Test environment variables
echo $OPENROUTER_API_KEY
echo $GEMINI_API_KEY
echo $GROQ_API_KEY
```

#### 2. Rate Limit Exceeded

**Symptoms**: "Rate limit exceeded" or "Too many requests"

**Solutions**:
- Check daily limits in configuration
- Monitor usage with `python app.py stats`
- Increase daily limits or add more providers

#### 3. Model Not Found

**Symptoms**: "Model not found" or "Invalid model"

**Solutions**:
- Verify model names are correct
- Check provider documentation for available models
- Use default models as reference

#### 4. Network Issues

**Symptoms**: "Connection timeout" or "Network error"

**Solutions**:
- Check internet connectivity
- Verify API endpoints are accessible
- Check firewall settings

### Debug Mode

Enable verbose logging for detailed debugging:

```bash
python app.py --verbose chat "Hello"
```

### Provider-Specific Debugging

#### OpenRouter Debug
```bash
# Test OpenRouter specifically
curl -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "x-ai/grok-4.1-fast:free", "messages": [{"role": "user", "content": "Hello"}]}'
```

#### Gemini Debug
```bash
# Test Gemini specifically
python -c "
import google.generativeai as genai
genai.configure(api_key='$GEMINI_API_KEY')
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content('Hello')
print(response.text)
"
```

#### Groq Debug
```bash
# Test Groq specifically
python -c "
from groq import Groq
client = Groq(api_key='$GROQ_API_KEY')
response = client.chat.completions.create(
    messages=[{'role': 'user', 'content': 'Hello'}],
    model='llama-3.1-70b-versatile'
)
print(response.choices[0].message.content)
"
```

## 🔄 Provider Migration Guide

### Migrating Between Providers

If you need to switch providers or add new ones:

1. **Get new API keys** from the target provider
2. **Set environment variables** for the new provider
3. **Update providers.yaml** configuration
4. **Test the new provider** with `python app.py test`
5. **Monitor usage** and adjust limits as needed

### Example Migration

From OpenRouter to Gemini:

```yaml
# Before
providers:
  - name: openrouter_primary
    enabled: true

# After
providers:
  - name: openrouter_primary
    enabled: false  # Disable temporarily
  
  - name: gemini_backup
    enabled: true   # Enable as primary
```

## 📈 Cost Optimization

### Free Tier Options

| Provider | Free Model | Free Tier Limits |
|----------|------------|------------------|
| OpenRouter | `x-ai/grok-4.1-fast:free` | 500 requests/day |
| Gemini | `gemini-1.5-flash` | 200 requests/day |
| Groq | `llama-3.1-70b-versatile` | 300 requests/day |

### Cost-Saving Tips

1. **Use free tier models** for development and testing
2. **Set reasonable daily limits** to prevent unexpected charges
3. **Monitor usage regularly** with `python app.py stats`
4. **Use multiple providers** to distribute load
5. **Enable fallback providers** to avoid service interruptions

### Provider Cost Comparison

| Provider | Model Type | Cost (per 1M tokens) | Speed | Quality |
|----------|------------|---------------------|-------|---------|
| OpenRouter | Grok-4 Fast | $0.24 (input) / $0.30 (output) | Fast | High |
| Gemini | 1.5 Flash | $0.15 (input) / $0.60 (output) | Fast | Medium |
| Groq | Llama 3.1 | $0.18 (input) / $0.22 (output) | Very Fast | Medium |

## 🎯 Best Practices

### 1. Provider Configuration

```yaml
# Best practice: Use multiple providers with fallback
providers:
  - name: openrouter_primary
    adapter: providers.openrouter_provider.OpenRouterProvider
    api_key_env: "OPENROUTER_API_KEY"
    model: "x-ai/grok-4.1-fast:free"
    daily_limit: 500
    enabled: true
  
  - name: gemini_backup
    adapter: providers.gemini_provider.GeminiProvider
    api_key_env: "GEMINI_API_KEY"
    model: "gemini-1.5-flash"
    daily_limit: 200
    enabled: true
  
  - name: groq_backup
    adapter: providers.groq_provider.GroqProvider
    api_key_env: "GROQ_API_KEY"
    model: "llama-3.1-70b-versatile"
    daily_limit: 300
    enabled: true
```

### 2. Environment Management

```bash
# Use .env file for development
echo "OPENROUTER_API_KEY=your_key" > .env
echo "GEMINI_API_KEY=your_key" >> .env
echo "GROQ_API_KEY=your_key" >> .env

# Load environment variables
source .env
```

### 3. Regular Monitoring

```bash
# Check provider health daily
python app.py test

# Monitor usage weekly
python app.py stats

# Review outputs monthly
python app.py list
```

## 🚀 Next Steps

1. ✅ Choose your primary provider
2. ✅ Get API keys and set environment variables
3. ✅ Configure providers.yaml
4. ✅ Test provider setup
5. ✅ Monitor usage and adjust limits
6. ✅ Start using the Brain Module!

Happy AI processing! 🎉