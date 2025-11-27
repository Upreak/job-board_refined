"""
Brain Module Package

This package provides the unified brain workflow with enhanced LLM provider support,
automatic fallback, and text extraction capabilities.
"""

__version__ = "1.0.0"
__author__ = "Brain Module Team"

from .brain_core import BrainCore

__all__ = [
    "BrainCore"
]