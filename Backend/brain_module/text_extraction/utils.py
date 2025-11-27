"""
Text Extraction Utilities

This module provides shared utility functions for the text extraction module.
"""

import logging
import os
import time
from pathlib import Path
from typing import Dict, Any, List, Optional, Union

def setup_logging(log_level: str = "INFO", log_file: Optional[str] = None) -> None:
    """
    Setup logging configuration for text extraction.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path
    """
    numeric_level = getattr(logging, log_level.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError(f"Invalid log level: {log_level}")
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Setup handlers
    handlers = [logging.StreamHandler()]
    
    if log_file:
        # Create log directory if it doesn't exist
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)
    
    # Configure logging
    logging.basicConfig(
        level=numeric_level,
        handlers=handlers,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

def ensure_directories(directories: List[Union[str, Path]]) -> None:
    """
    Ensure that directories exist.
    
    Args:
        directories: List of directory paths to create
    """
    for directory in directories:
        dir_path = Path(directory)
        dir_path.mkdir(parents=True, exist_ok=True)
        logging.debug(f"Ensured directory exists: {dir_path}")

def get_file_info(file_path: Path) -> Dict[str, Any]:
    """
    Get comprehensive information about a file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Dictionary with file information
    """
    try:
        stat = file_path.stat()
        
        return {
            "path": str(file_path),
            "name": file_path.name,
            "stem": file_path.stem,
            "suffix": file_path.suffix,
            "size": stat.st_size,
            "size_mb": round(stat.st_size / (1024 * 1024), 2),
            "created": stat.st_ctime,
            "modified": stat.st_mtime,
            "is_file": file_path.is_file(),
            "is_dir": file_path.is_dir(),
            "exists": file_path.exists()
        }
    except Exception as e:
        logging.error(f"Failed to get file info for {file_path}: {e}")
        return {
            "path": str(file_path),
            "error": str(e)
        }

def validate_file_path(file_path: Union[str, Path]) -> Dict[str, Any]:
    """
    Validate a file path and return validation results.
    
    Args:
        file_path: Path to validate
        
    Returns:
        Dictionary with validation results
    """
    result = {
        "valid": False,
        "exists": False,
        "is_file": False,
        "is_readable": False,
        "supported_extension": False,
        "error": None
    }
    
    try:
        path = Path(file_path)
        
        # Check if path exists
        if not path.exists():
            result["error"] = "Path does not exist"
            return result
        
        result["exists"] = True
        
        # Check if it's a file
        if not path.is_file():
            result["error"] = "Path is not a file"
            return result
        
        result["is_file"] = True
        
        # Check if file is readable
        if not os.access(path, os.R_OK):
            result["error"] = "File is not readable"
            return result
        
        result["is_readable"] = True
        
        # Check file extension
        supported_extensions = {'.pdf', '.docx', '.doc'}
        if path.suffix.lower() not in supported_extensions:
            result["error"] = f"Unsupported file extension: {path.suffix}"
            return result
        
        result["supported_extension"] = True
        result["valid"] = True
        
        return result
        
    except Exception as e:
        result["error"] = f"Validation error: {e}"
        return result

def get_supported_extensions() -> List[str]:
    """
    Get list of supported file extensions.
    
    Returns:
        List of supported file extensions
    """
    return ['.pdf', '.docx', '.doc']

def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human readable format.
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        Formatted size string
    """
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    size = float(size_bytes)
    
    while size >= 1024.0 and i < len(size_names) - 1:
        size /= 1024.0
        i += 1
    
    return f"{size:.1f} {size_names[i]}"

def get_timestamp() -> str:
    """
    Get current timestamp in ISO format.
    
    Returns:
        ISO formatted timestamp
    """
    return time.strftime("%Y-%m-%dT%H:%M:%S")

def create_unique_filename(base_name: str, extension: str = ".json") -> str:
    """
    Create a unique filename by adding timestamp and random suffix.
    
    Args:
        base_name: Base filename
        extension: File extension
        
    Returns:
        Unique filename
    """
    import uuid
    
    timestamp = get_timestamp().replace(":", "-").replace(".", "-")
    unique_id = str(uuid.uuid4())[:8]
    
    return f"{base_name}-{timestamp}-{unique_id}{extension}"

def clean_text(text: str) -> str:
    """
    Clean and normalize text.
    
    Args:
        text: Input text
        
    Returns:
        Cleaned text
    """
    if not text:
        return ""
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    # Remove control characters
    text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\r\t')
    
    return text

def truncate_text(text: str, max_length: int = 1000, suffix: str = "...") -> str:
    """
    Truncate text to maximum length.
    
    Args:
        text: Input text
        max_length: Maximum length
        suffix: Suffix to add if truncated
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix

def get_file_encoding(file_path: Path) -> str:
    """
    Detect file encoding.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Detected encoding
    """
    try:
        import chardet
        
        with open(file_path, 'rb') as f:
            raw_data = f.read(10000)  # Read first 10KB
            result = chardet.detect(raw_data)
            return result.get('encoding', 'utf-8')
    except ImportError:
        logging.warning("chardet not available, using utf-8 as default")
        return 'utf-8'
    except Exception as e:
        logging.error(f"Failed to detect encoding for {file_path}: {e}")
        return 'utf-8'

def validate_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate configuration dictionary.
    
    Args:
        config: Configuration dictionary
        
    Returns:
        Dictionary with validation results
    """
    result = {
        "valid": True,
        "errors": [],
        "warnings": []
    }
    
    # Check required fields
    required_fields = ["unstructured"]
    for field in required_fields:
        if field not in config:
            result["errors"].append(f"Missing required field: {field}")
            result["valid"] = False
    
    # Check unstructured configuration
    if "unstructured" in config:
        unstructured_config = config["unstructured"]
        
        # Check mode
        if "mode" in unstructured_config:
            mode = unstructured_config["mode"]
            if mode not in ["local", "api"]:
                result["errors"].append(f"Invalid unstructured mode: {mode}")
                result["valid"] = False
        
        # Check strategy for local mode
        if unstructured_config.get("mode") == "local" and "strategy" not in unstructured_config:
            result["warnings"].append("Strategy not specified for local mode, using default")
    
    return result

def merge_configs(base_config: Dict[str, Any], override_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge two configuration dictionaries.
    
    Args:
        base_config: Base configuration
        override_config: Override configuration
        
    Returns:
        Merged configuration
    """
    merged = base_config.copy()
    
    for key, value in override_config.items():
        if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
            merged[key] = merge_configs(merged[key], value)
        else:
            merged[key] = value
    
    return merged

def get_memory_usage() -> Dict[str, Any]:
    """
    Get current memory usage information.
    
    Returns:
        Dictionary with memory usage information
    """
    try:
        import psutil
        
        process = psutil.Process()
        memory_info = process.memory_info()
        
        return {
            "rss": memory_info.rss,
            "vms": memory_info.vms,
            "rss_mb": round(memory_info.rss / (1024 * 1024), 2),
            "vms_mb": round(memory_info.vms / (1024 * 1024), 2),
            "percent": process.memory_percent()
        }
    except ImportError:
        logging.warning("psutil not available, memory information not available")
        return {}
    except Exception as e:
        logging.error(f"Failed to get memory usage: {e}")
        return {}

def benchmark_function(func, *args, **kwargs) -> Dict[str, Any]:
    """
    Benchmark a function execution.
    
    Args:
        func: Function to benchmark
        *args: Function arguments
        **kwargs: Function keyword arguments
        
    Returns:
        Dictionary with benchmark results
    """
    start_time = time.time()
    start_memory = get_memory_usage()
    
    try:
        result = func(*args, **kwargs)
        success = True
    except Exception as e:
        result = str(e)
        success = False
    
    end_time = time.time()
    end_memory = get_memory_usage()
    
    return {
        "success": success,
        "result": result,
        "execution_time": end_time - start_time,
        "memory_before": start_memory,
        "memory_after": end_memory,
        "memory_delta": {
            "rss": end_memory.get("rss", 0) - start_memory.get("rss", 0),
            "vms": end_memory.get("vms", 0) - start_memory.get("vms", 0)
        }
    }

# Export utility functions
__all__ = [
    "setup_logging",
    "ensure_directories",
    "get_file_info",
    "validate_file_path",
    "get_supported_extensions",
    "format_file_size",
    "get_timestamp",
    "create_unique_filename",
    "clean_text",
    "truncate_text",
    "get_file_encoding",
    "validate_config",
    "merge_configs",
    "get_memory_usage",
    "benchmark_function"
]