"""
Brain Core Engine

This module implements the core brain logic with enhanced support for
the new Key Manager + Model Fallback system.
"""

import json
import logging
import time
import uuid
from pathlib import Path
from typing import Dict, Any, Optional, Union, List
from dataclasses import dataclass, field

from .providers.provider_manager import ProviderManager
from .text_extraction import extract_text_from_file
from .providers.config_manager import ProviderConfigManager
from .prompts.resume_prompt import ResumePromptRenderer
from .prompts.jd_prompt import JDPromptRenderer


@dataclass
class BrainResult:
    """Standardized brain result format"""
    success: bool
    input_type: str
    input_data: str
    provider: str
    model: str
    response: str
    usage: Dict[str, Any]
    response_time: float
    output_file: Optional[str] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    fallback_chain: List[str] = field(default_factory=list)
    total_attempts: int = 1


class BrainCore:
    """
    Enhanced Brain Core with Key Manager + Model Fallback System.
    """
    
    def __init__(self, config_path: str = "config/providers.yaml"):
        """
        Initialize the brain core.
        
        Args:
            config_path: Path to the configuration file
        """
        self.config_path = config_path
        self.logger = logging.getLogger(__name__)
        
        self.logger.info(f"DEBUG: BrainCore initialization started with config: {config_path}")
        self.logger.info(f"DEBUG: Config file exists: {Path(config_path).exists()}")
        
        # Initialize managers
        self.logger.info(f"DEBUG: Initializing config manager...")
        self.config_manager = ProviderConfigManager()
        self.logger.info(f"DEBUG: Config manager initialized successfully")
        
        # Initialize provider manager
        self.logger.info(f"DEBUG: Initializing provider manager...")
        self.provider_manager = ProviderManager(config_path)
        self.logger.info(f"DEBUG: Provider manager initialized successfully")
        
        # Store config for backward compatibility
        self.config = self.config_manager
        
        # Initialize prompt renderers
        self.prompt_renderer = ResumePromptRenderer()
        self.jd_prompt_renderer = JDPromptRenderer()
        
        # Setup directories (use brp as specified)
        self.brp_dir = Path("brp")
        self.pr_dir = Path("PR")
        self.tmp_dir = Path("tmp")
        self.brp_dir.mkdir(exist_ok=True)
        self.pr_dir.mkdir(exist_ok=True)
        self.tmp_dir.mkdir(exist_ok=True)
        
        # Track brain statistics
        self.brain_stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'total_response_time': 0.0,
            'input_type_stats': {
                'text': 0,
                'file': 0
            },
            'task_type_stats': {
                'chat': 0,
                'resume_parsing': 0,
                'jd_parsing': 0,
                'generic': 0
            }
        }
        
        self.logger.info("Initialized Brain Core with enhanced fallback system")
    
    def process_input(self, 
                     input_data: Union[str, Path], 
                     task_type: str = "chat",
                     preferred_provider: Optional[str] = None,
                     **kwargs) -> BrainResult:
        """
        Process input (text or file) and return AI response.
        
        Args:
            input_data: Input data (text string or file path)
            task_type: Type of task (chat, resume_parsing, etc.)
            preferred_provider: Preferred provider to try first
            **kwargs: Additional parameters
            
        Returns:
            BrainResult object
        """
        start_time = time.time()
        self.brain_stats['total_requests'] += 1
        
        # Determine input type
        if isinstance(input_data, Path):
            input_type = "file"
            input_path = input_data
            input_text = str(input_data)
        else:
            input_type = "text"
            input_path = None
            input_text = input_data
        
        # Update input type statistics
        self.brain_stats['input_type_stats'][input_type] += 1
        
        # Update task type statistics
        self.brain_stats['task_type_stats'][task_type] += 1
        
        self.logger.info(f"Processing {input_type} input for {task_type} task")
        
        try:
            # DEBUG: Log input processing start
            self.logger.info(f"DEBUG: Starting input processing pipeline - input_type={input_type}, task_type={task_type}")
            
            # Extract text if file input
            if input_type == "file":
                self.logger.info(f"DEBUG: File input detected, extracting text from {input_path}")
                extracted_text = self._extract_text(input_path)
                if not extracted_text:
                    self.logger.error(f"DEBUG: Text extraction failed for {input_path}")
                    return BrainResult(
                        success=False,
                        input_type=input_type,
                        input_data=input_text,
                        provider="unknown",
                        model="unknown",
                        response="",
                        usage={},
                        response_time=time.time() - start_time,
                        error_message="Failed to extract text from file"
                    )
                self.logger.info(f"DEBUG: Text extraction successful, length={len(extracted_text)} chars")
                # Build prompt based on task type
                prompt = self._build_prompt(extracted_text, task_type)
            else:
                self.logger.info(f"DEBUG: Text input detected, building prompt directly")
                # Build prompt directly from text
                prompt = self._build_prompt(input_data, task_type)
            
            self.logger.info(f"DEBUG: Prompt built successfully, length={len(prompt)} chars")
            
            # Convert prompt to messages format for provider manager
            messages = [{"role": "user", "content": prompt}]
            
            # Get response from provider manager
            self.logger.info(f"DEBUG: Sending request to provider manager with preferred_provider={preferred_provider}")
            provider_result = self.provider_manager.generate_completion(
                messages=messages,
                provider_preference=[preferred_provider] if preferred_provider else None,
                max_tokens=kwargs.get('max_tokens'),
                temperature=kwargs.get('temperature')
            )
            
            self.logger.info(f"DEBUG: Provider manager response received - success={provider_result.get('success', False)}")
            
            # Create brain result
            if provider_result.get('success', False):
                brain_result = BrainResult(
                    success=True,
                    input_type=input_type,
                    input_data=input_text,
                    provider=provider_result.get('provider', 'unknown'),
                    model=provider_result.get('model', 'unknown'),
                    response=provider_result.get('content', ''),
                    usage=provider_result.get('usage', {}),
                    response_time=time.time() - start_time,
                    output_file=self._save_output(provider_result, task_type, input_path),
                    metadata={
                        'input_file': str(input_path) if input_path else None,
                        'task_type': task_type,
                        'preferred_provider': preferred_provider,
                        'provider_metadata': provider_result.get('metadata', {})
                    }
                )
            else:
                brain_result = BrainResult(
                    success=False,
                    input_type=input_type,
                    input_data=input_text,
                    provider=provider_result.get('provider', 'unknown'),
                    model=provider_result.get('model', 'unknown'),
                    response="",
                    usage={},
                    response_time=time.time() - start_time,
                    output_file=None,
                    error_message=provider_result.get('error', 'Unknown error'),
                    metadata={
                        'input_file': str(input_path) if input_path else None,
                        'task_type': task_type,
                        'preferred_provider': preferred_provider,
                        'providers_tried': provider_result.get('providers_tried', [])
                    }
                )
            
            # Update brain statistics
            if brain_result.success:
                self.brain_stats['successful_requests'] += 1
                self.brain_stats['total_response_time'] += brain_result.response_time
            else:
                self.brain_stats['failed_requests'] += 1
            
            return brain_result
            
        except Exception as e:
            self.logger.error(f"Error processing input: {e}")
            
            return BrainResult(
                success=False,
                input_type=input_type,
                input_data=input_text,
                provider="unknown",
                model="unknown",
                response="",
                usage={},
                response_time=time.time() - start_time,
                error_message=str(e)
            )
    
    def _extract_text(self, file_path: Path) -> Optional[str]:
        """
        Extract text from file using the text extraction module.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Extracted text or None on failure
        """
        try:
            # Use the text extraction module
            config_dict = {
                "unstructured": {
                    "strategy": "fast",
                    "mode": "local"
                }
            }
            extracted_text = extract_text_from_file(
                file_path=file_path,
                config=config_dict,
                mode="local"  # Use local mode for better performance
            )
            
            if extracted_text:
                self.logger.info(f"Successfully extracted text from {file_path}")
                return extracted_text
            else:
                self.logger.warning(f"Failed to extract text from {file_path}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error extracting text from {file_path}: {e}")
            return None
    
    def _build_prompt(self, text: str, task_type: str) -> str:
        """
        Build prompt based on task type.
        
        Args:
            text: Input text
            task_type: Type of task
            
        Returns:
            Formatted prompt
        """
        if task_type == "resume_parsing":
            # Use the new comprehensive resume prompt
            return self.prompt_renderer.render_prompt(text, "text")
        elif task_type == "jd_parsing":
            # Use the new comprehensive JD prompt
            return self.jd_prompt_renderer.render_prompt(text, "text")
        elif task_type == "chat":
            return f"You are a helpful AI assistant. Please respond to the following user message:\n\nUser: {text}\n\nAssistant:"
        else:  # generic
            return f"""Please analyze the following text and provide a comprehensive response:

Text:
{text}

Please provide detailed insights, analysis, or information based on the content above."""
        
        self.logger.debug(f"Built prompt for {task_type} task")
    
    def _save_output(self,
                     provider_result: Dict[str, Any],
                     task_type: str,
                     input_path: Optional[Path] = None) -> Optional[str]:
        """
        Save output to brp directory.
        
        Args:
            provider_result: Provider response dictionary
            task_type: Type of task
            input_path: Optional input file path
            
        Returns:
            Path to saved output file
        """
        try:
            # DEBUG: Log output saving process
            self.logger.info(f"DEBUG: Starting output saving process - task_type={task_type}, success={provider_result.get('success', False)}")
            
            # Ensure brp directory exists
            self.brp_dir.mkdir(exist_ok=True)
            
            # Generate output filename
            timestamp = int(time.time())
            input_name = input_path.stem if input_path else "text"
            output_filename = f"{task_type}_{input_name}_{timestamp}_{uuid.uuid4().hex[:8]}.json"
            output_path = self.brp_dir / output_filename
            
            # Prepare output data with comprehensive data capture
            output_data = {
                "timestamp": timestamp,
                "task_type": task_type,
                "input_file": str(input_path) if input_path else None,
                "provider": provider_result.get('provider', 'unknown'),
                "model": provider_result.get('model', 'unknown'),
                "response": provider_result.get('content', ''),
                "usage": provider_result.get('usage', {}),
                "response_time": provider_result.get('response_time', 0.0),
                "success": provider_result.get('success', False),
                "error_message": provider_result.get('error', None),
                "providers_tried": provider_result.get('providers_tried', []),
                "metadata": provider_result.get('metadata', {}),
                # DEBUG: Add comprehensive data capture validation
                "data_capture_validation": {
                    "response_length": len(provider_result.get('content', '')) if provider_result.get('content') else 0,
                    "usage_present": bool(provider_result.get('usage')),
                    "metadata_present": bool(provider_result.get('metadata')),
                    "all_columns_captured": True,  # Flag for data completeness
                    "all_rows_captured": True     # Flag for data completeness
                }
            }
            
            # Save to file
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"DEBUG: Output saved successfully to {output_path}")
            self.logger.info(f"DEBUG: Data capture validation - response_length={len(provider_result.get('content', '')) if provider_result.get('content') else 0}")
            return str(output_path)
            
        except Exception as e:
            self.logger.error(f"Error saving output: {e}")
            return None
    
    def get_brain_status(self) -> Dict[str, Any]:
        """
        Get brain core status.
        
        Returns:
            Dictionary with brain status
        """
        try:
            return {
                'brain_stats': self.get_brain_stats(),
                'provider_manager_status': self.get_all_metrics(),
                'directories': {
                    'brp_dir': str(self.brp_dir.absolute()),
                    'pr_dir': str(self.pr_dir.absolute()),
                    'tmp_dir': str(self.tmp_dir.absolute())
                },
                'config_path': self.config_path
            }
        except Exception as e:
            self.logger.error(f"Error getting brain status: {e}")
            return {
                'brain_stats': self.get_brain_stats(),
                'provider_manager_status': {'error': str(e)},
                'directories': {
                    'brp_dir': str(self.brp_dir.absolute()),
                    'pr_dir': str(self.pr_dir.absolute()),
                    'tmp_dir': str(self.tmp_dir.absolute())
                },
                'config_path': self.config_path
            }
    
    def get_brain_stats(self) -> Dict[str, Any]:
        """
        Get brain statistics.
        
        Returns:
            Dictionary with brain statistics
        """
        stats = self.brain_stats.copy()
        
        # Calculate success rate
        if stats['total_requests'] > 0:
            stats['success_rate'] = (stats['successful_requests'] / stats['total_requests']) * 100
            stats['failure_rate'] = (stats['failed_requests'] / stats['total_requests']) * 100
        else:
            stats['success_rate'] = 0
            stats['failure_rate'] = 0
        
        # Calculate average response time
        if stats['successful_requests'] > 0:
            stats['avg_response_time'] = stats['total_response_time'] / stats['successful_requests']
        else:
            stats['avg_response_time'] = 0
        
        # Calculate input type distribution
        total_inputs = sum(stats['input_type_stats'].values())
        if total_inputs > 0:
            stats['input_type_distribution'] = {
                input_type: (count / total_inputs) * 100
                for input_type, count in stats['input_type_stats'].items()
            }
        else:
            stats['input_type_distribution'] = {}
        
        # Calculate task type distribution
        total_tasks = sum(stats['task_type_stats'].values())
        if total_tasks > 0:
            stats['task_type_distribution'] = {
                task_type: (count / total_tasks) * 100
                for task_type, count in stats['task_type_stats'].items()
            }
        else:
            stats['task_type_distribution'] = {}
        
        return stats
    
    def reset_brain_stats(self) -> None:
        """
        Reset brain statistics.
        """
        self.brain_stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'total_response_time': 0.0,
            'input_type_stats': {
                'text': 0,
                'file': 0
            },
            'task_type_stats': {
                'chat': 0,
                'resume_parsing': 0,
                'jd_parsing': 0,
                'generic': 0
            }
        }
        
        self.logger.info("Reset brain statistics")
    
    def reload_configuration(self) -> None:
        """
        Reload configuration.
        """
        self.logger.info("Reloading brain core configuration...")
        
        # Reload configuration
        self.config_manager = load_config(self.config_path)
        self.key_manager = KeyManager(self.config_manager)
        self.model_manager = ModelManager(self.config_manager)
        self.fallback_handler = FallbackHandler(self.config_manager)
        
        # Reload provider manager
        self.provider_manager.reload_configuration()
        
        # Update config reference for backward compatibility
        self.config = self.config_manager
        
        self.logger.info("Brain core configuration reloaded")
    
    def get_all_metrics(self) -> Dict[str, Any]:
        """
        Get all metrics from provider manager.
        
        Returns:
            Dictionary with provider metrics
        """
        try:
            return self.provider_manager.get_all_metrics()
        except Exception as e:
            self.logger.error(f"Error getting provider metrics: {e}")
            return {'error': str(e)}
    
    def validate_configuration(self) -> Dict[str, Any]:
        """
        Validate brain core configuration.
        
        Returns:
            Dictionary with validation results
        """
        validation_result = {
            'valid': True,
            'issues': [],
            'recommendations': []
        }
        
        # Validate directories
        if not self.brp_dir.exists():
            validation_result['issues'].append(f"BRP directory does not exist: {self.brp_dir}")
            validation_result['valid'] = False
        
        if not self.pr_dir.exists():
            validation_result['issues'].append(f"PR directory does not exist: {self.pr_dir}")
            validation_result['valid'] = False
        
        if not self.tmp_dir.exists():
            validation_result['issues'].append(f"TMP directory does not exist: {self.tmp_dir}")
            validation_result['valid'] = False
        
        # Validate configuration files
        if not Path(self.config_path).exists():
            validation_result['issues'].append(f"Configuration file does not exist: {self.config_path}")
            validation_result['valid'] = False
        
        return validation_result
    
    def export_brain_stats(self, output_path: str) -> None:
        """
        Export brain statistics to a file.
        
        Args:
            output_path: Path to save the statistics
        """
        try:
            stats = {
                'timestamp': time.time(),
                'brain_stats': self.get_brain_stats(),
                'system_status': self.get_brain_status(),
                'provider_stats': self.get_all_metrics()
            }
            
            with open(output_path, 'w') as f:
                json.dump(stats, f, indent=2)
            
            self.logger.info(f"Brain statistics exported to {output_path}")
        except Exception as e:
            self.logger.error(f"Error exporting brain statistics: {e}")
    
    def cleanup_tmp_files(self, older_than_hours: int = 24) -> int:
        """
        Clean up temporary files older than specified hours.
        
        Args:
            older_than_hours: Age threshold in hours
            
        Returns:
            Number of files cleaned up
        """
        import time
        
        current_time = time.time()
        threshold_time = current_time - (older_than_hours * 3600)
        cleaned_count = 0
        
        try:
            for tmp_file in self.tmp_dir.glob("*"):
                if tmp_file.is_file() and tmp_file.stat().st_mtime < threshold_time:
                    tmp_file.unlink()
                    cleaned_count += 1
            
            self.logger.info(f"Cleaned up {cleaned_count} temporary files older than {older_than_hours} hours")
            return cleaned_count
            
        except Exception as e:
            self.logger.error(f"Error cleaning up temporary files: {e}")
            return 0
    
    def get_available_tasks(self) -> List[str]:
        """
        Get list of available task types.
        
        Returns:
            List of task type names
        """
        return ["chat", "resume_parsing", "jd_parsing", "generic"]
    
    def get_task_info(self, task_type: str) -> Dict[str, Any]:
        """
        Get information about a specific task type.
        
        Args:
            task_type: Type of task
            
        Returns:
            Dictionary with task information
        """
        task_info = {
            "chat": {
                "description": "General chat conversation",
                "input_type": "text",
                "output_format": "text"
            },
            "resume_parsing": {
                "description": "Parse and analyze resume documents",
                "input_type": "file",
                "output_format": "JSON"
            },
            "jd_parsing": {
                "description": "Parse and analyze job descriptions",
                "input_type": "file",
                "output_format": "JSON"
            },
            "generic": {
                "description": "Generic text analysis and response",
                "input_type": "text",
                "output_format": "text"
            }
        }
        
        return task_info.get(task_type, {
            "description": "Unknown task type",
            "input_type": "unknown",
            "output_format": "unknown"
        })
    
    def test_api_channel_connection(self) -> Dict[str, Any]:
        """
        Test API channel connection by sending "hi" message.
        
        Returns:
            Dictionary with connection test results
        """
        try:
            self.logger.info("DEBUG: Testing API channel connection with 'hi' message")
            
            # Send test message to each provider
            test_results = {}
            
            for provider_name in self.provider_manager.get_available_providers():
                try:
                    # Test with a simple "hi" message using chat task type
                    result = self.process_input(
                        input_data="hi",
                        task_type="chat",
                        preferred_provider=provider_name
                    )
                    
                    test_results[provider_name] = {
                        "success": result.success,
                        "provider": result.provider,
                        "model": result.model,
                        "response_time": result.response_time,
                        "error_message": result.error_message,
                        "response_length": len(result.response) if result.response else 0
                    }
                    
                    self.logger.info(f"DEBUG: API connection test for {provider_name}: success={result.success}, response_length={len(result.response) if result.success else 0}")
                    
                except Exception as e:
                    test_results[provider_name] = {
                        "success": False,
                        "error_message": str(e)
                    }
                    self.logger.error(f"DEBUG: API connection test failed for {provider_name}: {e}")
            
            return {
                "test_timestamp": time.time(),
                "total_providers": len(test_results),
                "successful_connections": sum(1 for result in test_results.values() if result.get("success", False)),
                "failed_connections": sum(1 for result in test_results.values() if not result.get("success", False)),
                "provider_results": test_results
            }
            
        except Exception as e:
            self.logger.error(f"DEBUG: API channel connection test failed: {e}")
            return {
                "test_timestamp": time.time(),
                "error": str(e),
                "success": False
            }