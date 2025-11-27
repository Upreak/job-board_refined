# VS Code Setup Instructions

This guide will help you set up Visual Studio Code for development with the Brain Module.

## 🚀 Prerequisites

- Visual Studio Code installed
- Python 3.8 or higher
- Git (optional, for version control)

## 📦 VS Code Extension Recommendations

Install these extensions from the VS Code marketplace:

### Essential Extensions

1. **Python Extension** by Microsoft
   - Provides Python language support
   - Debugging capabilities
   - Linting and formatting
   - IntelliSense

2. **Pylance** by Microsoft
   - Fast Python language server
   - Enhanced IntelliSense
   - Type checking

3. **Python Test Explorer** by Microsoft
   - Test discovery and execution
   - Test coverage
   - Test debugging

### Recommended Extensions

4. **GitLens** by Microsoft
   - Git supercharged
   - Code lens with git blame
   - Repository management

5. **Docker** by Microsoft
   - Container integration
   - Dockerfile support

6. **Path Intellisense** by Christian Kohler
   - Autocomplete file paths
   - Path navigation

## 🔧 VS Code Configuration

### 1. Open the Project

```bash
# Open VS Code in the brain_module directory
code .
```

### 2. Create VS Code Workspace Settings

Create a `.vscode` directory and add these configuration files:

#### `.vscode/settings.json`

```json
{
    "python.defaultInterpreterPath": "${workspaceFolder}/venv/Scripts/python.exe",
    "python.analysis.typeCheckingMode": "basic",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    "python.testing.pytestEnabled": true,
    "python.testing.unittestEnabled": false,
    "files.associations": {
        "*.yaml": "yaml",
        "*.yml": "yaml"
    },
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    },
    "terminal.integrated.shell.windows": "cmd.exe",
    "terminal.integrated.shellArgs.windows": ["/K", "venv\\Scripts\\activate.bat"]
}
```

#### `.vscode/launch.json`

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Current File",
            "type": "python",
            "request": "launch",
            "program": "${file}",
            "console": "integratedTerminal",
            "justMyCode": true
        },
        {
            "name": "Python: Brain Module Test",
            "type": "python",
            "request": "launch",
            "module": "pytest",
            "args": [
                "test_basic_functionality.py",
                "-v"
            ],
            "console": "integratedTerminal",
            "justMyCode": false
        },
        {
            "name": "Python: App Debug",
            "type": "python",
            "request": "launch",
            "module": "app",
            "args": [
                "info"
            ],
            "console": "integratedTerminal",
            "justMyCode": true
        }
    ]
}
```

#### `.vscode/tasks.json`

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Install Dependencies",
            "type": "shell",
            "command": "pip install -r requirements.txt",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Run Tests",
            "type": "shell",
            "command": "python test_basic_functionality.py",
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Start Development Server",
            "type": "shell",
            "command": "python app.py info",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Clean Output Directory",
            "type": "shell",
            "command": "rm -rf PR/*.json 2>/dev/null || del PR\\*.json 2>nul",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        }
    ]
}
```

## 🛠️ Development Workflow

### 1. Initial Setup

```bash
# Open VS Code
code .

# Create virtual environment (if not already done)
python -m venv venv

# Activate virtual environment (VS Code should detect it automatically)
# Or run in terminal: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Verify Setup

```bash
# Run the basic functionality test
python test_basic_functionality.py
```

### 3. Development Tasks

#### Running Tests
- **Run all tests**: Use the command palette (Ctrl+Shift+P) and search "Python: Run All Tests"
- **Run specific test**: Right-click on the test file and select "Run Python File"
- **Debug test**: Set breakpoints and use the debug panel

#### Running the Application
- **Run app.py**: Right-click on `app.py` and select "Run Python File"
- **Debug app.py**: Set breakpoints and use the debug panel
- **Use tasks**: Open the command palette and search "Tasks: Run Task"

#### Code Formatting
- **Auto-format**: Save the file (Ctrl+S) to automatically format
- **Format manually**: Right-click and select "Format Document"
- **Organize imports**: Right-click and select "Format Document" or use the command palette

## 🔍 Debugging Configuration

### Debugging the Brain Module

1. **Set breakpoints** in your Python files
2. **Use the debug panel** (Ctrl+Shift+D)
3. **Select the appropriate launch configuration**:
   - "Python: Current File" for debugging individual files
   - "Python: Brain Module Test" for debugging tests
   - "Python: App Debug" for debugging the main application

### Environment Variables for Debugging

Add these to your launch configuration to debug with environment variables:

```json
{
    "name": "Python: Debug with API Keys",
    "type": "python",
    "request": "launch",
    "module": "app",
    "env": {
        "OPENROUTER_API_KEY": "your_debug_key",
        "GEMINI_API_KEY": "your_debug_key",
        "GROQ_API_KEY": "your_debug_key"
    },
    "console": "integratedTerminal",
    "justMyCode": true
}
```

## 📁 File Structure in VS Code

Your VS Code workspace should look like this:

```
brain_module/
├── .vscode/
│   ├── settings.json
│   ├── launch.json
│   └── tasks.json
├── app.py
├── brain_core.py
├── provider_manager.py
├── config/
│   └── providers.yaml
├── text_extraction/
│   ├── __init__.py
│   ├── extractor.py
│   └── utils.py
├── providers/
│   ├── __init__.py
│   ├── provider_base.py
│   ├── openrouter_provider.py
│   ├── gemini_provider.py
│   └── groq_provider.py
├── PR/
├── tmp/
├── requirements.txt
├── test_basic_functionality.py
└── README.md
```

## 🎯 Common VS Code Operations

### Working with the Terminal

1. **Open integrated terminal**: Ctrl+`
2. **Switch between terminals**: Ctrl+Shift+`
3. **Create new terminal**: Click the `+` icon in the terminal panel

### Code Navigation

1. **Go to definition**: F12
2. **Peek definition**: Alt+F12
3. **Find all references**: Shift+F12
4. **Go to symbol**: Ctrl+Shift+O

### Code Editing

1. **IntelliSense**: Ctrl+Space
2. **Quick fix**: Ctrl+.
3. **Rename symbol**: F2
4. **Format document**: Shift+Alt+F

## 🐛 Troubleshooting VS Code Issues

### Virtual Environment Not Detected

1. **Check Python interpreter**: 
   - Open command palette (Ctrl+Shift+P)
   - Search "Python: Select Interpreter"
   - Choose the virtual environment interpreter

2. **Reload VS Code**: 
   - Command palette (Ctrl+Shift+P)
   - Search "Developer: Reload Window"

### Extension Issues

1. **Check extension status**: 
   - Open extensions panel (Ctrl+Shift+X)
   - Verify Python extension is installed and enabled

2. **Check for updates**: 
   - Open extensions panel
   - Click the update button for each extension

### Debugging Issues

1. **Check launch configuration**: 
   - Verify `.vscode/launch.json` is properly configured
   - Check that paths are correct

2. **Check environment variables**: 
   - Verify environment variables are set correctly
   - Check that API keys are valid

## 📊 Development Tips

### 1. Use the Test Explorer

- Open the test explorer (Ctrl+Shift+T)
- Run tests individually or all together
- View test results and coverage

### 2. Use Git Integration

- Install GitLens extension
- View git blame information
- See code changes history

### 3. Use Docker (Optional)

- If using Docker, configure Docker extension
- Run the application in a container for consistent environment

### 4. Use Code Snippets

Create custom snippets for common patterns:

```json
{
    "Brain Module Function": {
        "prefix": "brain_func",
        "body": [
            "def ${1:function_name}(${2:params}):",
            "    \"\"\"",
            "    ${3:Function description}",
            "    \"\"\"",
            "    try:",
            "        ${4:# Implementation}",
            "        return ${5:result}",
            "    except Exception as e:",
            "        logging.error(f\"Error in ${1:function_name}: {e}\")",
            "        raise"
        ],
        "description": "Create a Brain Module function with error handling"
    }
}
```

## 🚀 Next Steps

1. ✅ Install recommended VS Code extensions
2. ✅ Create `.vscode` configuration files
3. ✅ Set up virtual environment in VS Code
4. ✅ Install dependencies
5. ✅ Run basic functionality test
6. ✅ Start developing!

Happy coding! 🎉