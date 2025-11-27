import logging
import os
import sys
from pathlib import Path
from typing import List, Optional

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

def load_unstructured_partitioners():
    """
    Load the required unstructured partitioners for text extraction.
    This follows the unstructured.io documentation for minimal required tools.
    """
    try:
        # Import only the required partitioners from unstructured.io
        from unstructured.partition.pdf import partition_pdf
        from unstructured.partition.docx import partition_docx
        logger.info("Successfully loaded unstructured partitioners")
        return partition_pdf, partition_docx
    except ImportError as e:
        logger.error("Failed to import unstructured partitioners: %s", e)
        # Try alternative import paths for different versions
        try:
            logger.info("Trying alternative import paths...")
            from unstructured_inference.inference.layoutelement import partition_pdf
            from unstructured.partition.docx import partition_docx
            logger.info("Successfully loaded unstructured partitioners with alternative path")
            return partition_pdf, partition_docx
        except ImportError:
            logger.error("Alternative import paths also failed")
            raise RuntimeError(
                "unstructured library is required. "
                "Install with: pip install 'unstructured[local-inference]'"
            ) from e

def extract_text_with_pypdf2_fallback(file_path: Path) -> Optional[str]:
    """
    Fallback text extraction using PyPDF2 when unstructured.io fails.
    This provides an alternative when Poppler is not available.
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Extracted text or None on failure
    """
    try:
        import PyPDF2
        
        logger.info(f"Trying PyPDF2 fallback extraction for {file_path}")
        
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text_parts = []
            
            for page_num, page in enumerate(reader.pages):
                try:
                    text = page.extract_text()
                    if text and text.strip():
                        text_parts.append(f"--- Page {page_num + 1} ---")
                        text_parts.append(text.strip())
                except Exception as page_error:
                    logger.warning(f"Failed to extract text from page {page_num + 1}: {page_error}")
                    continue
            
        if text_parts:
            full_text = "\n\n".join(text_parts)
            logger.info(f"Successfully extracted text using PyPDF2 fallback from {file_path} ({len(full_text)} characters)")
            return full_text.strip()
        else:
            logger.warning(f"No text extracted using PyPDF2 fallback from {file_path}")
            return None
            
    except ImportError:
        logger.warning("PyPDF2 not available for fallback extraction")
        return None
    except Exception as e:
        logger.error(f"PyPDF2 fallback extraction failed for {file_path}: {e}")
        return None

def extract_text_from_pdf(file_path: Path, strategy: str = "fast") -> Optional[str]:
    """
    Extract text from PDF files using unstructured partition_pdf.
    Includes fallback mechanisms for Poppler dependency issues.
    
    Args:
        file_path: Path to the PDF file
        strategy: Partitioning strategy ('fast', 'hi_res', 'auto', 'ocr_only')
        
    Returns:
        Extracted text or None on failure
    """
    try:
        partition_pdf, _ = load_unstructured_partitioners()
        
        logger.info(f"Extracting text from {file_path} using unstructured partition_pdf with strategy: {strategy}")
        
        # Enhanced configuration for better OCR processing
        partition_config = {
            "filename": str(file_path),
            "strategy": strategy,
            "infer_table_structure": True,
            "include_page_breaks": True,
            "languages": ["eng"],  # English language for OCR
            "skip_infer_table_types": ["pdf"],  # Don't skip PDF table inference
        }
        
        # For image-based PDFs, try different strategies
        if strategy == "fast":
            # Try hi_res strategy as fallback for better OCR
            fallback_strategies = ["hi_res", "auto", "ocr_only"]
        else:
            fallback_strategies = []
        
        # Extract elements from PDF
        elements = partition_pdf(**partition_config)
        
        # Convert elements to text
        text = "\n".join([str(element) for element in elements if hasattr(element, 'text')])
        
        # If no text extracted with fast strategy, try hi_res
        if not text.strip() and strategy == "fast":
            logger.info(f"No text extracted with 'fast' strategy, trying 'hi_res' for {file_path}")
            partition_config["strategy"] = "hi_res"
            try:
                elements = partition_pdf(**partition_config)
                text = "\n".join([str(element) for element in elements if hasattr(element, 'text')])
                logger.info(f"Successfully extracted text with 'hi_res' strategy from {file_path} ({len(text)} characters)")
            except Exception as fallback_error:
                logger.warning(f"Fallback hi_res strategy also failed for {file_path}: {fallback_error}")
                
                # Try alternative approach for Poppler dependency issues
                if "poppler" in str(fallback_error).lower() or "page count" in str(fallback_error).lower():
                    logger.warning(f"Poppler dependency issue detected for {file_path}, trying alternative approach")
                    try:
                        # Try with different configuration that might work without Poppler
                        partition_config_alt = {
                            "filename": str(file_path),
                            "strategy": "auto",
                            "infer_table_structure": False,
                            "include_page_breaks": False,
                            "languages": ["eng"],
                        }
                        elements = partition_pdf(**partition_config_alt)
                        text = "\n".join([str(element) for element in elements if hasattr(element, 'text')])
                        if text.strip():
                            logger.info(f"Successfully extracted text with alternative config from {file_path} ({len(text)} characters)")
                            return text.strip()
                    except Exception as alt_error:
                        logger.warning(f"Alternative approach also failed for {file_path}: {alt_error}")
        
        # If still no text, try OCR-only approach
        if not text.strip() and strategy in ["fast", "hi_res"]:
            logger.info(f"Trying OCR-only approach for {file_path}")
            partition_config["strategy"] = "ocr_only"
            partition_config["ocr_languages"] = ["eng"]
            try:
                elements = partition_pdf(**partition_config)
                text = "\n".join([str(element) for element in elements if hasattr(element, 'text')])
                logger.info(f"Successfully extracted text with OCR-only strategy from {file_path} ({len(text)} characters)")
            except Exception as ocr_error:
                logger.warning(f"OCR-only strategy also failed for {file_path}: {ocr_error}")
                
                # Final fallback: try with minimal configuration
                if "poppler" in str(ocr_error).lower() or "page count" in str(ocr_error).lower():
                    logger.warning(f"Final fallback for Poppler issue with {file_path}")
                    try:
                        partition_config_minimal = {
                            "filename": str(file_path),
                            "strategy": "fast",
                            "languages": ["eng"],
                        }
                        elements = partition_pdf(**partition_config_minimal)
                        text = "\n".join([str(element) for element in elements if hasattr(element, 'text')])
                        if text.strip():
                            logger.info(f"Successfully extracted text with minimal config from {file_path} ({len(text)} characters)")
                            return text.strip()
                    except Exception as minimal_error:
                        logger.error(f"Minimal config also failed for {file_path}: {minimal_error}")
        
        if text.strip():
            logger.info(f"Successfully extracted text from {file_path} ({len(text)} characters)")
            return text.strip()
        else:
            logger.warning(f"No text extracted from {file_path} after trying multiple strategies")
            logger.info(f"Trying PyPDF2 fallback for {file_path}")
            pypdf2_text = extract_text_with_pypdf2_fallback(file_path)
            if pypdf2_text:
                logger.info(f"PyPDF2 fallback successful for {file_path}")
                return pypdf2_text
            return None
        
    except Exception as e:
        logger.error(f"Failed to extract text from PDF {file_path}: {e}")
        return None

def extract_text_from_docx(file_path: Path) -> Optional[str]:
    """
    Extract text from DOCX files using unstructured partition_docx.
    
    Args:
        file_path: Path to the DOCX file
        
    Returns:
        Extracted text or None on failure
    """
    try:
        _, partition_docx = load_unstructured_partitioners()
        
        logger.info(f"Extracting text from {file_path} using unstructured partition_docx")
        
        # Extract elements from DOCX
        elements = partition_docx(filename=str(file_path))
        
        # Convert elements to text
        text = "\n".join([str(element) for element in elements if hasattr(element, 'text')])
        
        logger.info(f"Successfully extracted text from {file_path} ({len(text)} characters)")
        return text.strip()
        
    except Exception as e:
        logger.error(f"Failed to extract text from DOCX {file_path}: {e}")
        return None

def extract_text_from_file(file_path: Path, strategy: str = "fast") -> Optional[str]:
    """
    Extract text from files using unstructured.io partitioners.
    This is the main function that should be called by other modules.
    
    Args:
        file_path: Path to the file to extract text from
        strategy: Partitioning strategy for PDF files
        
    Returns:
        Extracted text or None on failure
    """
    try:
        # Validate file path
        if not file_path.exists():
            logger.error(f"File not found: {file_path}")
            return None
        
        # Validate file extension
        supported_extensions = {'.pdf', '.docx', '.doc'}
        if file_path.suffix.lower() not in supported_extensions:
            logger.warning(f"Unsupported file extension: {file_path.suffix}. Supported: {supported_extensions}")
            return None
        
        # Extract text based on file type
        if file_path.suffix.lower() == '.pdf':
            return extract_text_from_pdf(file_path, strategy)
        elif file_path.suffix.lower() in ['.docx', '.doc']:
            return extract_text_from_docx(file_path)
        else:
            logger.warning(f"Unsupported file type: {file_path.suffix}")
            return None
            
    except Exception as e:
        logger.error(f"Failed to extract text from {file_path}: {e}")
        return None

def process_one_file_local(src_path: Path, cfg: dict) -> Optional[str]:
    """
    Process a single file using unstructured local partitioners.
    This function maintains compatibility with the existing extractor interface.
    
    Args:
        src_path: Path to the source file
        cfg: Configuration dictionary (unused but kept for compatibility)
        
    Returns:
        Extracted text or None on failure
    """
    # Get strategy from config, default to 'fast'
    strategy = cfg.get("unstructured", {}).get("strategy", "fast")
    
    return extract_text_from_file(src_path, strategy)

def process_one_file_api(src_path: Path, cfg: dict) -> Optional[str]:
    """
    Process file using API (placeholder - not implemented in this focused version).
    
    Args:
        src_path: Path to the source file
        cfg: Configuration dictionary
        
    Returns:
        None (API processing not implemented)
    """
    logger.warning("API processing not implemented in this focused version")
    return None

def elements_to_text(elements: List, preserve_cfg: dict = None, 
                    include_element_types: bool = False, 
                    join_with_blank_lines: bool = True) -> str:
    """
    Convert unstructured elements to text.
    
    Args:
        elements: List of unstructured elements
        preserve_cfg: Configuration for preserving layout (unused but kept for compatibility)
        include_element_types: Whether to include element types (unused but kept for compatibility)
        join_with_blank_lines: Whether to join elements with blank lines
        
    Returns:
        Combined text string
    """
    if isinstance(elements, str):
        return elements
    
    # Extract text from elements
    text_parts = []
    for element in elements:
        if hasattr(element, 'text'):
            text = str(element.text).strip()
            if text:
                text_parts.append(text)
    
    # Join with blank lines if requested
    if join_with_blank_lines and len(text_parts) > 1:
        result = "\n\n".join(text_parts)
    else:
        result = "\n".join(text_parts)
    
    return result.strip()

def call_unstructured_api(api_url: str, api_key: str, file_path: Path, strategy: str) -> List[dict]:
    """
    Call unstructured API (placeholder - not implemented).
    
    Args:
        api_url: API URL
        api_key: API key
        file_path: File path
        strategy: Processing strategy
        
    Returns:
        Empty list (API not implemented)
    """
    logger.warning("Unstructured API not implemented in this focused version")
    return []

# Export main functions for external use
__all__ = [
    "extract_text_from_file",
    "process_one_file_local",
    "process_one_file_api",
    "elements_to_text",
    "call_unstructured_api",
    "extract_text_from_pdf",
    "extract_text_from_docx"
]

# Main function for command-line usage
def main():
    """
    Main function for command-line testing.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="Extract text from files using unstructured.io")
    parser.add_argument("file_path", help="Path to the file to process")
    parser.add_argument("--strategy", default="fast", help="Partitioning strategy for PDF files")
    args = parser.parse_args()
    
    file_path = Path(args.file_path)
    if not file_path.exists():
        print(f"Error: File not found: {file_path}")
        sys.exit(1)
    
    text = extract_text_from_file(file_path, args.strategy)
    if text:
        print(f"Extracted text ({len(text)} characters):")
        print("=" * 50)
        print(text)
    else:
        print("Failed to extract text from file")

if __name__ == "__main__":
    main()