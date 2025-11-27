# Brain Module - AI Processing with Multiple LLM Providers

A powerful Python module that combines text extraction using Unstructured IO with multi-provider LLM orchestration. The Brain Module supports both chat interactions and file processing with intelligent provider fallback.

## 🚀 Features

- **Multi-Provider LLM Support**: OpenRouter, Gemini, and Groq with intelligent fallback
- **Text Extraction**: Leverages Unstructured IO for PDF and DOCX processing
- **Provider Fallback**: Automatic switching when providers fail or hit limits
- **CLI Interface**: Simple command-line interface for all operations
- **Configuration Management**: YAML-based provider configuration
- **Usage Tracking**: Monitor API usage and daily limits
- **Output Management**: Structured JSON outputs with metadata
- **Error Handling**: Comprehensive error handling and logging

## 📁 Project Structure

```
brain_module/
├── app.py                    # Main CLI application
├── brain_core.py            # Core brain logic
├── provider_manager.py      # Multi-provider LLM orchestration
├── config/
│   └── providers.yaml       # Provider configuration
│
├── text_extraction/         # Text extraction (using existing unstructured_io_runner.py)
│   ├── __init__.py
│   ├── extractor.py         # Integration wrapper for unstructured_io_runner.py
│   └── utils.py             # Shared utilities
│
├── providers/               # LLM provider implementations
│   ├── __init__.py
│   ├── provider_base.py     # Abstract base class
│   ├── openrouter_provider.py
│   ├── gemini_provider.py
│   └── groq_provider.py
│
├── PR/                      # AI output storage
├── tmp/                     # Temporary files
├── requirements.txt         # Python dependencies
├── test_basic_functionality.py  # Basic functionality test
└── README.md               # This file
```

## 🛠️ Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Setup Instructions

1. **Clone or download the brain_module directory**

2. **Create and activate a virtual environment**

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Install optional provider libraries** (if you plan to use them)

   ```bash
   # For Gemini support
   pip install google-generativeai

   # For Groq support
   pip install groq
   ```

## 🔧 Configuration

### 1. Set up API Keys

Get API keys from the following providers:

- **OpenRouter**: https://openrouter.ai
- **Gemini**: https://aistudio.google.com
- **Groq**: https://console.groq.com

### 2. Configure Providers

Edit `config/providers.yaml` to set up your providers:

```yaml
providers:
  - name: openrouter_primary
    adapter: providers.openrouter_provider.OpenRouterProvider
    api_key_env: "OPENROUTER_API_KEY"
    api_url: "https://openrouter.ai/api/v1"
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

### 3. Set Environment Variables

Set your API keys as environment variables:

```bash
# Windows
set OPENROUTER_API_KEY=your_openrouter_key
set GEMINI_API_KEY=your_gemini_key
set GROQ_API_KEY=your_groq_key

# macOS/Linux
export OPENROUTER_API_KEY="your_openrouter_key"
export GEMINI_API_KEY="your_gemini_key"
export GROQ_API_KEY="your_groq_key"
```

## 📖 Usage

### Basic Commands

#### 1. Get System Information

```bash
python app.py info
```

#### 2. Test All Providers

```bash
python app.py test
```

#### 3. Show Provider Statistics

```bash
python app.py stats
```

#### 4. List Output Files

```bash
python app.py list
```

### Chat Interface

```bash
# Basic chat
python app.py chat "Hello, how are you?"

# With custom parameters
python app.py chat "Explain quantum computing" --temperature 0.5 --max-tokens 1500
```

### File Processing

```bash
# Process a PDF resume
python app.py file "resume.pdf" --task-type resume_parsing

# Process a DOCX job description
python app.py file "job_description.docx" --task-type jd_parsing

# Custom task with parameters
python app.py file "document.pdf" --task-type analysis --temperature 0.3 --max-tokens 2000
```

### Supported Task Types

- `resume_parsing`: Extract and analyze resume information
- `jd_parsing`: Parse job descriptions
- `generic_instructions`: Process general document instructions
- `summarization`: Create document summaries
- `analysis`: Perform document analysis

## 🧪 Testing

### Run Basic Functionality Test

```bash
python test_basic_functionality.py
```

This test validates:
- File structure and directories
- Requirements and dependencies
- Import functionality
- Configuration loading
- Text extraction capabilities
- Provider manager initialization
- Brain core functionality
- CLI interface

### Expected Test Output

```
==================================================
BRAIN MODULE BASIC FUNCTIONALITY TEST
==================================================
--- File Structure ---
[PASS] All required files present
--- Directories ---
[PASS] All required directories present
--- Requirements ---
[PASS] Requirements file looks good
--- Imports ---
[PASS] All imports successful
--- Configuration ---
[PASS] Configuration loaded successfully
--- Text Extraction ---
[PASS] Text extraction functionality works
--- Provider Manager ---
[PASS] Provider manager initialized with 3 providers
--- Brain Core ---
[PASS] Brain core initialized successfully
--- CLI Interface ---
[PASS] CLI interface works
--- Test Sample ---
[PASS] Test sample created

==================================================
TEST RESULTS
==================================================
Passed: 10
Failed: 0
Total: 10

[SUCCESS] All tests passed! The Brain Module is ready to use.
```

## 📊 Output Format

All outputs are saved as JSON files in the `PR/` directory with the following structure:

```json
{
  "provider": "openrouter_primary",
  "model": "x-ai/grok-4.1-fast:free",
  "text": "AI response text...",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 300,
    "total_tokens": 450
  },
  "response_time": 2.45,
  "task_type": "resume_parsing",
  "processing_metadata": {
    "input_file": "resume.pdf",
    "output_file": "PR/resume-20251123-141517.json",
    "extraction_method": "unstructured_io"
  }
}
```

## 🔧 Advanced Configuration

### Provider Priority

The Brain Module uses providers in the order they appear in the configuration file. If the first provider fails, it automatically tries the next one.

### Daily Limits

Each provider can have a daily limit. The Brain Module tracks usage and will switch providers when limits are reached.

### Logging

Enable verbose logging for debugging:

```bash
python app.py --verbose chat "Hello"
```

## 🚨 Troubleshooting

### Common Issues

1. **Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check Python version (3.8+ required)

2. **API Key Issues**
   - Verify environment variables are set correctly
   - Check API keys are valid and have sufficient permissions

3. **Provider Failures**
   - Run `python app.py test` to check provider status
   - Check network connectivity
   - Verify API quotas and limits

4. **File Processing Errors**
   - Ensure files are in supported formats (PDF, DOCX)
   - Check file permissions
   - Verify Unstructured IO installation

### Debug Mode

Enable verbose logging for detailed debugging information:

```bash
python app.py --verbose info
```

## 📈 Monitoring

### Provider Statistics

Monitor provider usage and performance:

```bash
python app.py stats
```

This shows:
- Total providers and their status
- Daily usage statistics
- Success rates
- Average response times

### Output Files

List all generated outputs:

```bash
python app.py list
```

## 🔄 Provider Fallback Logic

The Brain Module implements intelligent fallback:

1. **Primary Provider**: First provider in the list
2. **Backup Providers**: Subsequent providers in order
3. **Failure Conditions**:
   - API authentication failure
   - Daily limit exceeded
   - Network timeout
   - Service unavailable
4. **Health Checks**: Automatic provider health monitoring

## 📝 Examples

### Example 1: Resume Analysis

```bash
# Process a resume
python app.py file "candidate_resume.pdf" --task-type resume_parsing

# Output saved to: PR/resume-<timestamp>.json
```

### Example 2: Job Description Parsing

```bash
# Parse a job description
python app.py file "job_posting.docx" --task-type jd_parsing --temperature 0.3

# Extract key requirements and responsibilities
```

### Example 3: Document Analysis

```bash
# Analyze a research paper
python app.py file "research_paper.pdf" --task-type analysis --max-tokens 3000

# Get comprehensive analysis and insights
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the basic functionality test
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Run the basic functionality test
3. Review the configuration
4. Check provider documentation

## 🔄 Updates

The Brain Module is regularly updated with:
- New provider support
- Improved text extraction
- Enhanced error handling
- Performance optimizations

---

**Next Steps:**
1. ✅ Set up your API keys in `config/providers.yaml`
2. ✅ Set environment variables for your API keys
3. ✅ Run: `python app.py info`
4. ✅ Start using the module!

**Happy AI Processing! 🎉**