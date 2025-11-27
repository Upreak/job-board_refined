#!/usr/bin/env python3
"""
API Gateway Layer for Unified Brain Processing System

This module provides the main API gateway that handles incoming requests,
validates them, routes to appropriate processing channels, and manages
the complete unified brain processing pipeline.
"""

import json
import logging
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass, asdict
from enum import Enum

import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from .brain_core import BrainCore, BrainResult
from .text_extraction.final_97_percent_extractor import extract_text_97_percent
from .providers.provider_manager import ProviderManager

class RequestType(Enum):
    """Enumeration of supported request types"""
    TEXT_CHAT = "text_chat"
    FILE_RESUME = "file_resume"
    FILE_GENERIC = "file_generic"
    BATCH_PROCESS = "batch_process"

class ProcessingStatus(Enum):
    """Enumeration of processing status states"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class APIRequest:
    """Data class for API requests"""
    request_id: str
    request_type: RequestType
    input_data: Union[str, Dict[str, Any]]
    metadata: Dict[str, Any]
    timestamp: str
    priority: int = 1
    timeout_seconds: int = 300

@dataclass
class APIResponse:
    """Data class for API responses"""
    request_id: str
    status: ProcessingStatus
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: float = 0.0
    metadata: Optional[Dict[str, Any]] = None
    timestamp: str = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat()

class APIGateway:
    """Main API Gateway for the Unified Brain Processing System"""
    
    def __init__(self,
                 brain_core_config: str = "config/enhanced_providers.yaml",
                 brp_output_dir: str = "../brp",
                 max_concurrent_requests: int = 10):
        """
        Initialize the API Gateway
        
        Args:
            brain_core_config: Path to brain core configuration file
            brp_output_dir: Directory for storing processing results
            max_concurrent_requests: Maximum number of concurrent requests
        """
        self.brp_output_dir = Path(brp_output_dir)
        self.max_concurrent_requests = max_concurrent_requests
        self.active_requests: Dict[str, APIRequest] = {}
        self.completed_requests: Dict[str, APIResponse] = {}
        
        # Setup logging
        self._setup_logging()
        self.logger = logging.getLogger(__name__)
        
        # Initialize brain core
        self.logger.info("Initializing Brain Core...")
        self.brain_core = BrainCore(brain_core_config)
        
        # Initialize provider manager
        self.logger.info("Initializing Provider Manager...")
        self.provider_manager = self.brain_core.provider_manager
        
        # Ensure brp directory exists
        self._ensure_brp_directory()
        
        # Initialize processing statistics
        self.stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'avg_processing_time': 0.0,
            'requests_by_type': {},
            'provider_usage': {}
        }
        
        self.logger.info("API Gateway initialized successfully")
    
    def _setup_logging(self):
        """Setup logging configuration for the API Gateway"""
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        # Create file handler
        log_file = log_dir / f"api_gateway_{datetime.utcnow().strftime('%Y%m%d')}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
    
    def _ensure_brp_directory(self):
        """Ensure the BRP output directory structure exists"""
        directories = [
            self.brp_output_dir,
            self.brp_output_dir / "processed",
            self.brp_output_dir / "metadata",
            self.brp_output_dir / "logs",
            self.brp_output_dir / "backups"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            self.logger.debug(f"Ensured directory exists: {directory}")
    
    def validate_request(self, request_data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate incoming API request
        
        Args:
            request_data: Raw request data
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Check required fields
            required_fields = ['request_type', 'input_data']
            for field in required_fields:
                if field not in request_data:
                    return False, f"Missing required field: {field}"
            
            # Validate request type
            try:
                request_type = RequestType(request_data['request_type'])
            except ValueError:
                valid_types = [rt.value for rt in RequestType]
                return False, f"Invalid request_type. Must be one of: {valid_types}"
            
            # Validate input data
            input_data = request_data['input_data']
            if not isinstance(input_data, (str, dict)):
                return False, "input_data must be a string or dictionary"
            
            # Validate metadata if provided
            if 'metadata' in request_data:
                metadata = request_data['metadata']
                if not isinstance(metadata, dict):
                    return False, "metadata must be a dictionary"
            
            # Validate file-specific constraints
            if request_type in [RequestType.FILE_RESUME, RequestType.FILE_GENERIC]:
                if isinstance(input_data, str):
                    # Check if file path is valid
                    file_path = Path(input_data)
                    if not file_path.exists():
                        return False, f"File does not exist: {input_data}"
                    
                    # Check file size (max 50MB)
                    file_size = file_path.stat().st_size
                    if file_size > 50 * 1024 * 1024:  # 50MB
                        return False, f"File too large: {file_size} bytes (max 50MB)"
            
            return True, None
            
        except Exception as e:
            self.logger.error(f"Request validation error: {e}")
            return False, f"Validation error: {str(e)}"
    
    def route_request(self, request: APIRequest) -> APIResponse:
        """
        Route request to appropriate processing channel
        
        Args:
            request: Validated API request
            
        Returns:
            APIResponse object
        """
        start_time = time.time()
        
        try:
            self.logger.info(f"Routing request {request.request_id} of type {request.request_type.value}")
            
            # Update request tracking
            self.active_requests[request.request_id] = request
            
            # Route based on request type
            if request.request_type == RequestType.TEXT_CHAT:
                return self._process_text_chat(request)
            elif request.request_type == RequestType.FILE_RESUME:
                return self._process_file_resume(request)
            elif request.request_type == RequestType.FILE_GENERIC:
                return self._process_file_generic(request)
            elif request.request_type == RequestType.BATCH_PROCESS:
                return self._process_batch_request(request)
            else:
                return APIResponse(
                    request_id=request.request_id,
                    status=ProcessingStatus.FAILED,
                    error=f"Unsupported request type: {request.request_type.value}"
                )
        
        except Exception as e:
            self.logger.error(f"Request routing error for {request.request_id}: {e}")
            return APIResponse(
                request_id=request.request_id,
                status=ProcessingStatus.FAILED,
                error=str(e),
                processing_time=time.time() - start_time
            )
        
        finally:
            # Clean up active requests
            if request.request_id in self.active_requests:
                del self.active_requests[request.request_id]
    
    def _process_text_chat(self, request: APIRequest) -> APIResponse:
        """Process direct text/chat inputs"""
        start_time = time.time()
        
        try:
            # Direct text input - no file extraction needed
            input_text = request.input_data if isinstance(request.input_data, str) else ""
            
            # Process through brain core
            result = self.brain_core.process_input(
                input_data=input_text,
                task_type="chat",
                **request.metadata
            )
            
            processing_time = time.time() - start_time
            
            # Prepare response data
            response_data = {
                'input_text': input_text[:100] + "..." if len(input_text) > 100 else input_text,
                'ai_response': result.response,
                'provider_used': result.provider,
                'processing_metadata': result.metadata
            }
            
            # Save to brp directory
            self._save_processing_result(request, response_data, ProcessingStatus.COMPLETED)
            
            # Update statistics
            self._update_stats(request.request_type, processing_time, True)
            
            return APIResponse(
                request_id=request.request_id,
                status=ProcessingStatus.COMPLETED,
                data=response_data,
                processing_time=processing_time
            )
        
        except Exception as e:
            processing_time = time.time() - start_time
            self.logger.error(f"Text chat processing error: {e}")
            self._update_stats(request.request_type, processing_time, False)
            
            return APIResponse(
                request_id=request.request_id,
                status=ProcessingStatus.FAILED,
                error=str(e),
                processing_time=processing_time
            )
    
    def _process_file_resume(self, request: APIRequest) -> APIResponse:
        """Process resume files through text extraction pipeline"""
        start_time = time.time()
        
        try:
            # File input - use text extraction engine
            file_path = Path(request.input_data)
            self.logger.info(f"Extracting text from resume file: {file_path}")
            
            # Extract text using the 97% extractor
            extracted_text = extract_text_97_percent(file_path)
            
            if not extracted_text:
                raise ValueError(f"Failed to extract text from file: {file_path}")
            
            # Process extracted text through brain core with resume parsing prompt
            result = self.brain_core.process_input(
                input_data=extracted_text,
                task_type="resume_parsing",
                **request.metadata
            )
            
            processing_time = time.time() - start_time
            
            # Prepare response data
            response_data = {
                'original_file': str(file_path),
                'file_size': file_path.stat().st_size,
                'extracted_text_length': len(extracted_text),
                'ai_response': result.response,
                'provider_used': result.provider,
                'processing_metadata': result.metadata,
                'extraction_metadata': {
                    'file_name': file_path.name,
                    'file_extension': file_path.suffix,
                    'extraction_timestamp': datetime.utcnow().isoformat()
                }
            }
            
            # Save to brp directory
            self._save_processing_result(request, response_data, ProcessingStatus.COMPLETED)
            
            # Update statistics
            self._update_stats(request.request_type, processing_time, True)
            
            return APIResponse(
                request_id=request.request_id,
                status=ProcessingStatus.COMPLETED,
                data=response_data,
                processing_time=processing_time
            )
        
        except Exception as e:
            processing_time = time.time() - start_time
            self.logger.error(f"Resume file processing error: {e}")
            self._update_stats(request.request_type, processing_time, False)
            
            return APIResponse(
                request_id=request.request_id,
                status=ProcessingStatus.FAILED,
                error=str(e),
                processing_time=processing_time
            )
    
    def _process_file_generic(self, request: APIRequest) -> APIResponse:
        """Process generic files (non-resume) through text extraction pipeline"""
        start_time = time.time()
        
        try:
            # Generic file processing - similar to resume but different task type
            file_path = Path(request.input_data)
            self.logger.info(f"Processing generic file: {file_path}")
            
            # Extract text using the 97% extractor
            extracted_text = extract_text_97_percent(file_path)
            
            if not extracted_text:
                raise ValueError(f"Failed to extract text from file: {file_path}")
            
            # Process extracted text through brain core
            task_type = request.metadata.get('task_type', 'generic_instructions')
            result = self.brain_core.process_input(
                input_data=extracted_text,
                task_type=task_type,
                **request.metadata
            )
            
            processing_time = time.time() - start_time
            
            # Prepare response data
            response_data = {
                'original_file': str(file_path),
                'file_size': file_path.stat().st_size,
                'extracted_text_length': len(extracted_text),
                'ai_response': result.response,
                'provider_used': result.provider,
                'task_type': task_type,
                'processing_metadata': result.metadata,
                'extraction_metadata': {
                    'file_name': file_path.name,
                    'file_extension': file_path.suffix,
                    'extraction_timestamp': datetime.utcnow().isoformat()
                }
            }
            
            # Save to brp directory
            self._save_processing_result(request, response_data, ProcessingStatus.COMPLETED)
            
            # Update statistics
            self._update_stats(request.request_type, processing_time, True)
            
            return APIResponse(
                request_id=request.request_id,
                status=ProcessingStatus.COMPLETED,
                data=response_data,
                processing_time=processing_time
            )
        
        except Exception as e:
            processing_time = time.time() - start_time
            self.logger.error(f"Generic file processing error: {e}")
            self._update_stats(request.request_type, processing_time, False)
            
            return APIResponse(
                request_id=request.request_id,
                status=ProcessingStatus.FAILED,
                error=str(e),
                processing_time=processing_time
            )
    
    def _process_batch_request(self, request: APIRequest) -> APIResponse:
        """Process batch requests (multiple files or texts)"""
        start_time = time.time()
        
        try:
            # Handle batch processing
            input_data = request.input_data
            if isinstance(input_data, dict) and 'items' in input_data:
                items = input_data['items']
            else:
                raise ValueError("Batch request must contain 'items' array in input_data")
            
            results = []
            total_items = len(items)
            
            for i, item in enumerate(items):
                self.logger.info(f"Processing batch item {i+1}/{total_items}")
                
                try:
                    # Create sub-request for each item
                    sub_request = APIRequest(
                        request_id=f"{request.request_id}_item_{i}",
                        request_type=RequestType(item.get('type', 'file_generic')),
                        input_data=item['data'],
                        metadata=item.get('metadata', {}),
                        timestamp=datetime.utcnow().isoformat()
                    )
                    
                    sub_response = self.route_request(sub_request)
                    results.append({
                        'item_index': i,
                        'item_data': item,
                        'response': asdict(sub_response)
                    })
                
                except Exception as item_error:
                    self.logger.error(f"Batch item {i} processing error: {item_error}")
                    results.append({
                        'item_index': i,
                        'item_data': item,
                        'error': str(item_error)
                    })
            
            processing_time = time.time() - start_time
            
            # Prepare response data
            response_data = {
                'batch_id': request.request_id,
                'total_items': total_items,
                'successful_items': len([r for r in results if 'error' not in r]),
                'failed_items': len([r for r in results if 'error' in r]),
                'results': results
            }
            
            # Save to brp directory
            self._save_processing_result(request, response_data, ProcessingStatus.COMPLETED)
            
            # Update statistics
            self._update_stats(request.request_type, processing_time, True)
            
            return APIResponse(
                request_id=request.request_id,
                status=ProcessingStatus.COMPLETED,
                data=response_data,
                processing_time=processing_time
            )
        
        except Exception as e:
            processing_time = time.time() - start_time
            self.logger.error(f"Batch processing error: {e}")
            self._update_stats(request.request_type, processing_time, False)
            
            return APIResponse(
                request_id=request.request_id,
                status=ProcessingStatus.FAILED,
                error=str(e),
                processing_time=processing_time
            )
    
    def _save_processing_result(self, request: APIRequest, response_data: Dict[str, Any], status: ProcessingStatus):
        """Save processing result to brp directory"""
        try:
            timestamp = datetime.utcnow()
            date_str = timestamp.strftime('%Y%m%d')
            time_str = timestamp.strftime('%H%M%S')
            
            # Create filename
            filename = f"{request.request_type.value}_{date_str}_{time_str}_{request.request_id}.json"
            filepath = self.brp_output_dir / "processed" / filename
            
            # Prepare output data
            output_data = {
                'request': asdict(request),
                'response': response_data,
                'status': status.value,
                'timestamp': timestamp.isoformat(),
                'api_version': '1.0'
            }
            
            # Save to file
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"Saved processing result to: {filepath}")
            
            # Also save metadata
            metadata_file = self.brp_output_dir / "metadata" / f"{request.request_id}_metadata.json"
            metadata = {
                'request_id': request.request_id,
                'request_type': request.request_type.value,
                'status': status.value,
                'timestamp': timestamp.isoformat(),
                'processing_time': response_data.get('processing_time', 0),
                'file_size': response_data.get('file_size', 0),
                'provider_used': response_data.get('provider_used', 'unknown')
            }
            
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        except Exception as e:
            self.logger.error(f"Failed to save processing result: {e}")
    
    def _update_stats(self, request_type: RequestType, processing_time: float, success: bool):
        """Update processing statistics"""
        self.stats['total_requests'] += 1
        
        if success:
            self.stats['successful_requests'] += 1
        else:
            self.stats['failed_requests'] += 1
        
        # Update average processing time
        total_time = self.stats['avg_processing_time'] * (self.stats['total_requests'] - 1) + processing_time
        self.stats['avg_processing_time'] = total_time / self.stats['total_requests']
        
        # Update request type statistics
        type_key = request_type.value
        if type_key not in self.stats['requests_by_type']:
            self.stats['requests_by_type'][type_key] = {'total': 0, 'success': 0, 'failed': 0}
        
        self.stats['requests_by_type'][type_key]['total'] += 1
        if success:
            self.stats['requests_by_type'][type_key]['success'] += 1
        else:
            self.stats['requests_by_type'][type_key]['failed'] += 1
    
    def serialize_response(self, response: APIResponse) -> Dict[str, Any]:
        """
        Serialize API response for JSON output
        
        Args:
            response: API response object
            
        Returns:
            Serialized response dictionary
        """
        return {
            'request_id': response.request_id,
            'status': response.status.value,
            'data': response.data,
            'error': response.error,
            'processing_time': response.processing_time,
            'timestamp': response.timestamp,
            'metadata': response.metadata
        }
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get API Gateway system status"""
        return {
            'status': 'operational',
            'active_requests': len(self.active_requests),
            'completed_requests': len(self.completed_requests),
            'statistics': self.stats,
            'brain_core_status': self.brain_core.get_brain_status(),
            'provider_status': self.provider_manager.get_provider_status(),
            'brp_directory': str(self.brp_output_dir),
            'max_concurrent_requests': self.max_concurrent_requests,
            'uptime': time.time() - getattr(self, '_start_time', time.time())
        }
    
    def handle_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point for handling API requests
        
        Args:
            request_data: Raw request data from client
            
        Returns:
            Serialized API response
        """
        try:
            # Generate unique request ID
            request_id = str(uuid.uuid4())
            
            # Validate request
            is_valid, error_message = self.validate_request(request_data)
            if not is_valid:
                return self.serialize_response(APIResponse(
                    request_id=request_id,
                    status=ProcessingStatus.FAILED,
                    error=error_message
                ))
            
            # Create API request object
            request = APIRequest(
                request_id=request_id,
                request_type=RequestType(request_data['request_type']),
                input_data=request_data['input_data'],
                metadata=request_data.get('metadata', {}),
                timestamp=datetime.utcnow().isoformat(),
                priority=request_data.get('priority', 1),
                timeout_seconds=request_data.get('timeout_seconds', 300)
            )
            
            # Route and process request
            response = self.route_request(request)
            
            # Store completed response
            self.completed_requests[response.request_id] = response
            
            # Return serialized response
            return self.serialize_response(response)
        
        except Exception as e:
            self.logger.error(f"Request handling error: {e}")
            return self.serialize_response(APIResponse(
                request_id="unknown",
                status=ProcessingStatus.FAILED,
                error=str(e)
            ))


def create_api_gateway(config_path: str = "config/enhanced_providers.yaml") -> APIGateway:
    """
    Factory function to create and configure API Gateway
    
    Args:
        config_path: Path to configuration file
        
    Returns:
        Configured APIGateway instance
    """
    return APIGateway(brain_core_config=config_path)


if __name__ == "__main__":
    # Example usage
    gateway = create_api_gateway()
    
    # Example text chat request
    chat_request = {
        'request_type': 'text_chat',
        'input_data': 'Hello, please analyze this resume for software engineering positions.',
        'metadata': {
            'temperature': 0.7,
            'max_tokens': 1000
        }
    }
    
    response = gateway.handle_request(chat_request)
    print(json.dumps(response, indent=2))