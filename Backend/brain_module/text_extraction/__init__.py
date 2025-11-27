"""
Text Extraction Package

This package provides comprehensive text extraction functionality including:
- Consolidated extraction interface via final_97_percent_extractor.py
- 97% optimized extraction with enhanced fallback strategies
- Utility functions and configuration management
"""

from .final_97_percent_extractor import (
    # Main consolidated extraction functions
    extract_text_from_file,
    extract_text_from_multiple_files,
    get_supported_file_types,
    validate_file_for_extraction,
    get_extraction_config,
    batch_extract_text,
    
    # 97% optimized extraction functions
    extract_text_97_percent,
    batch_extract_97_percent,
    get_97_percent_config,
    extract_text_with_poppler_optimization,
    extract_text_with_pypdf2_fallback
)

__all__ = [
    # Consolidated extraction functions (replacing extractor.py)
    "extract_text_from_file",
    "extract_text_from_multiple_files",
    "get_supported_file_types",
    "validate_file_for_extraction",
    "get_extraction_config",
    "batch_extract_text",
    
    # 97% optimized extraction functions
    "extract_text_97_percent",
    "batch_extract_97_percent",
    "get_97_percent_config",
    "extract_text_with_poppler_optimization",
    "extract_text_with_pypdf2_fallback"
]