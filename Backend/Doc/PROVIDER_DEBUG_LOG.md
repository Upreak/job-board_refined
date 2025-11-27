# Provider Debug Log & Configuration Guide

## Overview
This document tracks provider issues, fixes, and configuration for the Brain Module LLM providers.

## Current Status (Updated: 2025-11-24)
**✅ ALL PROVIDERS WORKING - 100% SUCCESS RATE**

| Provider | Status | Model | Response Time | API Key |
|----------|--------|-------|---------------|---------|
| OpenRouter | ✅ Working | z-ai/glm-4.5-air:free (with 7 fallbacks) | ~4.2s | ✅ Valid |
| Gemini | ✅ Working | gemini-2.5-flash | ~1.7s | ✅ Valid |
| Groq | ✅ Working | llama-3.1-8b-instant | ~0.7s | ✅ Valid |

## Provider Configuration

### 1. OpenRouter Provider
- **Primary Model**: z-ai/glm-4.5-air:free
- **Fallback Models**: 7 models including x-ai/grok-4.1-fast:free, google/gemini models
- **API Key**: `OPENROUTER_API_KEY`
- **Status**: Working with comprehensive fallback system
- **Response**: Handles Unicode encoding properly

### 2. Gemini Provider  
- **Primary Model**: gemini-2.5-flash ✅ (UPDATED)
- **Fallback Models**: gemini-2.5-pro, gemini-1.5-flash, gemini-1.5-pro, gemini-pro
- **API Key**: `GEMINI_API_KEY`
- **Status**: Fixed - was using outdated model names
- **Response**: "Hi there! How can I help you today?"

### 3. Groq Provider
- **Model**: llama-3.1-8b-instant
- **API Key**: `GROQ_API_KEY`
- **Status**: Working perfectly
- **Response**: "How can I assist you today?"

## Issue Resolution History

### Gemini Provider Fix (2025-11-24)
**Problem**: Gemini provider failing with 404 errors
**Root Cause**: Using deprecated model names (gemini-1.5-flash) incompatible with current API
**Solution**: Updated to modern gemini-2.5-flash model
**Result**: 100% success rate achieved

**Debug Process**:
1. ❌ Initial models: gemini-1.5-flash, gemini-1.5-pro, gemini-pro
2. ❌ Error: "404 models not found for API version v1beta"
3. ✅ Solution: Updated to gemini-2.5-flash, gemini-2.5-pro
4. ✅ Result: All models working with graceful fallback

### OpenRouter Unicode Fix
**Problem**: Windows console encoding errors with emoji characters
**Solution**: Added UTF-8 encoding handling with error ignore
**Result**: Robust cross-platform compatibility

### Groq Model Correction
**Problem**: Incorrect model name in reporting
**Solution**: Corrected from "llama-3.1-70b-versatile" to "llama-3.1-8b-instant"
**Result**: Accurate model reporting

## API Key Management

### Current Keys Status
- **OPENROUTER_API_KEY**: ✅ Active (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)
- **GEMINI_API_KEY**: ✅ Active (AIzaSyARzc_tePOTVQZXdL5YQOL5WJGeBI9kKQw)
- **GROQ_API_KEY**: ✅ Active (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)

### Key Management Notes
- All API keys are properly loaded from `.env` file
- Keys are validated during provider initialization
- Failed keys trigger automatic fallback to next provider

## Configuration Files

### Primary Configuration
- **File**: `brain_module/config/providers.yaml`
- **Status**: ✅ Updated with correct Groq model
- **Features**: Enhanced fallback system, multiple models per provider

### Environment Configuration  
- **File**: `brain_module/.env`
- **Status**: ✅ All keys present and valid
- **Notes**: Gemini key comment mentions "renew required" but key is actually active

## Testing Framework

### Provider Testing
- **Script**: `brain_module/providers/provider_base.py` (base class)
- **Individual Providers**: `openrouter_provider.py`, `gemini_provider.py`, `groq_provider.py`
- **Features**: Comprehensive fallback, error handling, response validation

### Test Results
- **Success Rate**: 100% (3/3 providers working)
- **Response Times**: OpenRouter ~4.2s, Gemini ~1.7s, Groq ~0.7s
- **Error Handling**: Robust fallback systems in place

## Debugging Guidelines

### Common Issues & Solutions

1. **404 Model Not Found**
   - **Cause**: Using deprecated model names
   - **Solution**: Update to current model names (gemini-2.5-flash, etc.)
   - **Prevention**: Regular model name validation

2. **Unicode Encoding Errors**
   - **Cause**: Windows console encoding issues
   - **Solution**: Add UTF-8 encoding with error ignore
   - **Prevention**: Robust text encoding handling

3. **API Key Errors**
   - **Cause**: Expired or invalid keys
   - **Solution**: Update keys in `.env` file
   - **Prevention**: Key validation during startup

4. **Network Timeouts**
   - **Cause**: Provider server issues
   - **Solution**: Automatic fallback to next provider
   - **Prevention**: Multiple backup providers

### Debug Commands
```bash
# Test all providers
python brain_module/providers/openrouter_provider.py
python brain_module/providers/gemini_provider.py  
python brain_module/providers/groq_provider.py

# Check configuration
python -c "from brain_module.config_manager import ConfigManager; print(ConfigManager().get_all_providers_status())"
```

## Maintenance Checklist

### Weekly Checks
- [ ] Verify all providers responding
- [ ] Check API key expiration dates
- [ ] Monitor response times
- [ ] Validate fallback models

### Monthly Maintenance
- [ ] Update model names if deprecated
- [ ] Review API usage limits
- [ ] Test new provider models
- [ ] Update configuration as needed

### Emergency Procedures
1. **Provider Down**: Automatic fallback to next provider
2. **Key Expired**: Update in `.env` and restart
3. **Model Deprecated**: Update configuration with current models
4. **Network Issues**: Check connectivity and provider status pages

## Performance Metrics

### Response Times (Average)
- OpenRouter: 4.2s (with network latency)
- Gemini: 1.7s (fast response)
- Groq: 0.7s (fastest provider)

### Reliability
- OpenRouter: High (7 fallback models)
- Gemini: High (5 fallback models)  
- Groq: High (single working model)

### Cost Efficiency
- OpenRouter: Free models available
- Gemini: Low cost (0.0025/1k tokens)
- Groq: Free (current allocation)

## Future Improvements

### Planned Enhancements
1. **Auto-Discovery**: Automatic model availability checking
2. **Performance Monitoring**: Real-time response time tracking
3. **Cost Optimization**: Automatic selection of cheapest working model
4. **Health Checks**: Periodic provider availability verification

### Model Updates Required
- Regular review of deprecated model warnings
- Proactive model name updates
- Performance comparison of new models

## Logging & Error Handling

### Logging Configuration
The Brain Module uses comprehensive logging for debugging and monitoring:

#### Log Levels
- **DEBUG**: Detailed debugging information
- **INFO**: General operational information
- **WARNING**: Non-critical issues that don't stop execution
- **ERROR**: Critical errors that prevent functionality
- **CRITICAL**: Severe errors that may cause system shutdown

#### Log Files
- **Primary Log**: `brain.log` (configured in `.env`)
- **Provider Logs**: Individual provider error tracking
- **Performance Logs**: Response time and usage metrics

#### Log Format
```
%(asctime)s [%(levelname)s] %(name)s: %(message)s
```

### Error Handling System

#### Provider Error Types
1. **Network Errors**
   - Timeout: Request timeout exceeded
   - Connection: Network connectivity issues
   - DNS: Domain resolution failures

2. **API Errors**
   - 401 Unauthorized: Invalid API key
   - 403 Forbidden: Access denied
   - 429 Rate Limited: Too many requests
   - 400 Bad Request: Invalid request format
   - 500+ Server Errors: Provider server issues

3. **Model Errors**
   - Model Not Found: Deprecated or invalid model names
   - Model Quota Exceeded: Daily/monthly limits reached
   - Model Invalid Response: Malformed API responses

4. **Content Errors**
   - Input Too Long: Prompt exceeds model limits
   - Invalid Content: Unprocessable input format
   - Safety Filters: Content blocked by provider

#### Error Handling Flow
```python
try:
    # Provider API call
    response = provider.send_request(prompt)
    
    if response.success:
        return response.text
    else:
        # Handle provider-specific errors
        if "api_key_invalid" in response.error_message:
            logger.error("API key validation failed")
            # Switch to backup provider
        elif "provider_overloaded" in response.error_message:
            logger.warning("Provider overloaded, retrying...")
            # Retry with delay
        else:
            logger.error(f"Unknown error: {response.error_message}")
            # Fallback to next provider
            
except Exception as e:
    logger.critical(f"Unhandled exception: {str(e)}")
    # Emergency fallback procedures
```

#### Fallback Mechanism
1. **Primary Provider**: OpenRouter with 7 fallback models
2. **Secondary Provider**: Gemini with 5 fallback models
3. **Tertiary Provider**: Groq with current working model
4. **Emergency**: Graceful degradation with error reporting

### Debug Logging Examples

#### Successful Request Logging
```
2025-11-24 20:23:15,123 [INFO] openrouter_provider: Request successful - Model: z-ai/glm-4.5-air:free, Response Time: 4.23s
2025-11-24 20:23:16,874 [INFO] gemini_provider: Request successful - Model: gemini-2.5-flash, Response Time: 1.74s
2025-11-24 20:23:17,504 [INFO] groq_provider: Request successful - Model: llama-3.1-8b-instant, Response Time: 0.73s
```

#### Error Logging Examples
```
2025-11-24 20:23:15,456 [WARNING] gemini_provider: Model gemini-1.5-flash failed - 404 models/gemini-1.5-flash is not found for API version v1beta
2025-11-24 20:23:15,789 [INFO] gemini_provider: Trying fallback model: gemini-2.5-flash
2025-11-24 20:23:16,523 [ERROR] fallback_handler: All Gemini models failed - switching to Groq backup
```

#### Configuration Error Logging
```
2025-11-24 20:23:14,123 [ERROR] config_manager: OPENROUTER_API_KEY environment variable not set
2025-11-24 20:23:14,456 [CRITICAL] provider_base: No API keys available for openrouter_primary
2025-11-24 20:23:14,789 [WARNING] provider_manager: Provider openrouter_primary disabled due to configuration errors
```

### Monitoring and Alerting

#### Performance Metrics
- **Response Time Tracking**: Monitor provider response times
- **Success Rate Monitoring**: Track provider reliability
- **Error Rate Analysis**: Identify recurring issues
- **Usage Analytics**: API key and model usage patterns

#### Alert Thresholds
- **Response Time**: Alert if > 10s average response time
- **Error Rate**: Alert if > 10% error rate over 5 minutes
- **Provider Downtime**: Alert if provider unavailable for > 5 minutes
- **API Limits**: Alert when approaching usage limits

### Debug Commands

#### Testing Individual Providers
```bash
# Test OpenRouter
python -c "
from brain_module.providers.openrouter_provider import OpenRouterProvider
from brain_module.config_manager import ConfigManager
from brain_module.key_manager import KeyManager
# ... test code
"

# Test Gemini
python -c "
import google.generativeai as genai
genai.configure(api_key='your_key')
model = genai.GenerativeModel('gemini-2.5-flash')
response = model.generate_content('hi')
print(response.text)
"

# Test Groq
python -c "
import httpx
# ... test code for Groq API
"
```

#### Log Analysis Commands
```bash
# View recent logs
tail -f brain.log

# Search for errors
grep -i "error\|failed\|exception" brain.log

# Monitor response times
grep "Response Time" brain.log | tail -20

# Check provider status
grep "Provider.*success\|Provider.*failed" brain.log
```

#### Configuration Validation
```bash
# Check API key loading
python -c "
import os
print('OPENROUTER_API_KEY:', 'Set' if os.getenv('OPENROUTER_API_KEY') else 'Missing')
print('GEMINI_API_KEY:', 'Set' if os.getenv('GEMINI_API_KEY') else 'Missing')
print('GROQ_API_KEY:', 'Set' if os.getenv('GROQ_API_KEY') else 'Missing')
"

# Validate provider configuration
python -c "
from brain_module.config_manager import ConfigManager
config = ConfigManager()
providers = config.get_all_providers_status()
for name, status in providers.items():
    print(f'{name}: {status}')
"
```

### Troubleshooting Guide

#### Common Error Patterns

1. **Unicode Encoding Errors**
   ```
   Error: 'charmap' codec can't encode character
   Solution: Add UTF-8 encoding with error ignore
   Prevention: Use proper text encoding handling
   ```

2. **API Key Authentication Errors**
   ```
   Error: 401 Unauthorized / api_key_invalid
   Solution: Verify API key in .env file
   Prevention: Regular key validation checks
   ```

3. **Model Deprecation Errors**
   ```
   Error: 404 models/gemini-1.5-flash is not found
   Solution: Update to current model names (gemini-2.5-flash)
   Prevention: Regular model name validation
   ```

4. **Rate Limiting Errors**
   ```
   Error: 429 Too Many Requests
   Solution: Implement retry with exponential backoff
   Prevention: Monitor usage and implement rate limiting
   ```

5. **Network Connectivity Errors**
   ```
   Error: Connection timeout / Network unreachable
   Solution: Check internet connection and provider status
   Prevention: Implement connection health checks
   ```

#### Debug Checklist

**When encountering provider issues:**

1. ✅ **Check Log Files**: Review `brain.log` for error details
2. ✅ **Verify Configuration**: Check `.env` API keys and config files
3. ✅ **Test Individual Providers**: Use debug commands above
4. ✅ **Check Provider Status**: Verify provider API status pages
5. ✅ **Review Error Messages**: Identify specific error types
6. ✅ **Implement Fallback**: Ensure fallback providers are working
7. ✅ **Monitor Performance**: Check response times and success rates

### Performance Optimization

#### Response Time Optimization
- **Connection Pooling**: Reuse HTTP connections
- **Parallel Requests**: Process multiple requests concurrently
- **Caching**: Cache frequent responses when appropriate
- **Model Selection**: Use fastest working model first

#### Error Rate Reduction
- **Proactive Monitoring**: Monitor provider health
- **Graceful Degradation**: Implement smooth fallbacks
- **Input Validation**: Validate prompts before sending
- **Retry Logic**: Implement intelligent retry mechanisms

#### Resource Management
- **Memory Usage**: Monitor and optimize memory consumption
- **API Usage**: Track and optimize API key usage
- **Network Usage**: Minimize unnecessary network calls
- **Processing Time**: Optimize text processing algorithms

---

**Last Updated**: November 24, 2025
**Next Review**: December 24, 2025
**Status**: All providers operational - 100% success rate
**Logging**: Comprehensive logging and error handling implemented