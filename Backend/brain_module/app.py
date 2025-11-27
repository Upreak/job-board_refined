"""
Brain Module Application

This module provides the main CLI interface for the Brain Module.
It handles command-line arguments and orchestrates the core functionality.
"""

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Dict, Any, Optional

from .brain_core import BrainCore

def setup_logging(verbose: bool = False) -> None:
    """
    Setup logging configuration.
    
    Args:
        verbose: Enable verbose logging
    """
    log_level = logging.DEBUG if verbose else logging.INFO
    
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.StreamHandler(),
        ]
    )

def handle_chat_command(brain_core: BrainCore, message: str, args: Dict[str, Any]) -> None:
    """
    Handle chat command.
    
    Args:
        brain_core: BrainCore instance
        message: Chat message
        args: Additional arguments
    """
    try:
        logging.info(f"Processing chat message: {message[:100]}...")
        
        # Process the chat message
        logging.info(f"DEBUG: Attempting to call process_chat method on BrainCore")
        try:
            response = brain_core.process_chat(
                message,
                temperature=args.get("temperature"),
                max_tokens=args.get("max_tokens")
            )
            logging.info(f"DEBUG: process_chat call successful")
        except AttributeError as e:
            logging.error(f"DEBUG: process_chat method not found, trying process_input instead: {e}")
            # Use the correct method name
            response = brain_core.process_input(
                input_data=message,
                task_type="chat",
                temperature=args.get("temperature"),
                max_tokens=args.get("max_tokens")
            )
            logging.info(f"DEBUG: process_input call successful as fallback")
        
        # Display response
        print("\n" + "="*50)
        print("AI RESPONSE:")
        print("="*50)
        print(response.text if hasattr(response, 'text') else str(response))
        print("="*50)
        
        # Display metadata
        print(f"\nProvider: {response.provider if hasattr(response, 'provider') else 'unknown'}")
        print(f"Model: {response.model if hasattr(response, 'model') else 'unknown'}")
        print(f"Response Time: {response.response_time if hasattr(response, 'response_time') else 0:.2f}s")
        
        if hasattr(response, 'usage') and response.usage:
            usage = response.usage
            print(f"Tokens Used: {usage.get('total_tokens', 0)}")
        
        if hasattr(response, 'processing_metadata') and response.processing_metadata:
            print(f"\nOutput saved to: {response.processing_metadata.get('output_file', 'unknown')}")
        
    except Exception as e:
        logging.error(f"Chat processing failed: {e}")
        print(f"Error: {e}")
        sys.exit(1)

def handle_file_command(brain_core: BrainCore, file_path: str, args: Dict[str, Any]) -> None:
    """
    Handle file processing command.
    
    Args:
        brain_core: BrainCore instance
        file_path: Path to the file to process
        args: Additional arguments
    """
    try:
        file_path_obj = Path(file_path)
        
        if not file_path_obj.exists():
            print(f"Error: File not found: {file_path}")
            sys.exit(1)
        
        logging.info(f"Processing file: {file_path}")
        
        # Determine task type
        task_type = args.get("task_type", "resume_parsing")
        
        # Process the file
        logging.info(f"DEBUG: Attempting to call process_file method on BrainCore")
        try:
            response = brain_core.process_file(
                file_path,
                task_type=task_type,
                temperature=args.get("temperature"),
                max_tokens=args.get("max_tokens")
            )
            logging.info(f"DEBUG: process_file call successful")
        except AttributeError as e:
            logging.error(f"DEBUG: process_file method not found, trying process_input instead: {e}")
            # Use the correct method name
            response = brain_core.process_input(
                input_data=file_path,
                task_type=task_type,
                temperature=args.get("temperature"),
                max_tokens=args.get("max_tokens")
            )
            logging.info(f"DEBUG: process_input call successful as fallback")
        
        # Display response
        print("\n" + "="*50)
        print("PROCESSING RESULTS:")
        print("="*50)
        print(response.text if hasattr(response, 'text') else str(response))
        print("="*50)
        
        # Display metadata
        print(f"\nTask Type: {response.task_type if hasattr(response, 'task_type') else 'unknown'}")
        print(f"Provider: {response.provider if hasattr(response, 'provider') else 'unknown'}")
        print(f"Model: {response.model if hasattr(response, 'model') else 'unknown'}")
        print(f"Response Time: {response.response_time if hasattr(response, 'response_time') else 0:.2f}s")
        
        if hasattr(response, 'usage') and response.usage:
            usage = response.usage
            print(f"Tokens Used: {usage.get('total_tokens', 0)}")
        
        if hasattr(response, 'processing_metadata') and response.processing_metadata:
            print(f"\nOutput saved to: {response.processing_metadata.get('output_file', 'unknown')}")
        
    except Exception as e:
        logging.error(f"File processing failed: {e}")
        print(f"Error: {e}")
        sys.exit(1)

def handle_info_command(brain_core: BrainCore) -> None:
    """
    Handle info command.
    
    Args:
        brain_core: BrainCore instance
    """
    try:
        # Get system information
        system_info = brain_core.get_system_info()
        
        print("\n" + "="*50)
        print("BRAIN MODULE INFORMATION")
        print("="*50)
        
        print(f"Version: {system_info['brain_core_version']}")
        print(f"Config Path: {system_info['config_path']}")
        print(f"Output Directory: {system_info['pr_directory']}")
        print(f"Temp Directory: {system_info['tmp_directory']}")
        
        # Display provider statistics
        provider_stats = system_info['provider_stats']
        print(f"\nProviders: {provider_stats['total_providers']}")
        print(f"Enabled: {provider_stats['enabled_providers']}")
        print(f"Healthy: {provider_stats['healthy_providers']}")
        
        # Display provider details
        print("\nProvider Details:")
        for name, info in provider_stats['providers'].items():
            status = "✓" if info['enabled'] else "✗"
            print(f"  {status} {name} ({info['model']})")
        
        # Display supported tasks
        print(f"\nSupported Tasks: {', '.join(system_info['supported_tasks'])}")
        
    except Exception as e:
        logging.error(f"Info command failed: {e}")
        print(f"Error: {e}")
        sys.exit(1)

def handle_list_command(brain_core: BrainCore) -> None:
    """
    Handle list command to show output files.
    
    Args:
        brain_core: BrainCore instance
    """
    try:
        # Get output files
        output_files = brain_core.get_output_files()
        
        if not output_files:
            print("No output files found.")
            return
        
        print("\n" + "="*70)
        print("OUTPUT FILES")
        print("="*70)
        
        print(f"{'Filename':<30} {'Task Type':<15} {'Provider':<15} {'Size':<10} {'Modified':<12}")
        print("-"*70)
        
        for file_info in output_files:
            filename = file_info['filename'][:27] + "..." if len(file_info['filename']) > 30 else file_info['filename']
            task_type = file_info['task_type'][:12] + "..." if len(file_info['task_type']) > 15 else file_info['task_type']
            provider = file_info['provider'][:12] + "..." if len(file_info['provider']) > 15 else file_info['provider']
            size = f"{file_info['size']} bytes"
            modified = file_info['modified']
            
            print(f"{filename:<30} {task_type:<15} {provider:<15} {size:<10} {modified:<12}")
        
        print(f"\nTotal: {len(output_files)} files")
        
    except Exception as e:
        logging.error(f"List command failed: {e}")
        print(f"Error: {e}")
        sys.exit(1)

def handle_test_command(brain_core: BrainCore) -> None:
    """
    Handle test command to test all providers.
    
    Args:
        brain_core: BrainCore instance
    """
    try:
        print("\n" + "="*50)
        print("TESTING PROVIDERS")
        print("="*50)
        
        # Test all providers
        results = brain_core.provider_manager.test_all_providers()
        
        for provider_name, success in results.items():
            status = "✓ PASS" if success else "✗ FAIL"
            print(f"{provider_name}: {status}".encode('utf-8', 'replace').decode('utf-8'))
        
        # Show provider order
        provider_order = getattr(brain_core.provider_manager, 'provider_order', [])
        if provider_order:
            print(f"\nProvider Order: {', '.join(provider_order)}")
        else:
            print("\nProvider Order: Not configured")
        
    except Exception as e:
        logging.error(f"Test command failed: {e}")
        print(f"Error: {e}")
        sys.exit(1)

def handle_stats_command(brain_core: BrainCore) -> None:
    """
    Handle stats command to show provider statistics.
    
    Args:
        brain_core: BrainCore instance
    """
    try:
        # Get provider statistics
        stats = brain_core.provider_manager.get_provider_stats()
        
        print("\n" + "="*50)
        print("PROVIDER STATISTICS")
        print("="*50)
        
        print(f"Total Providers: {stats['total_providers']}")
        print(f"Enabled Providers: {stats['enabled_providers']}")
        print(f"Healthy Providers: {stats['healthy_providers']}")
        
        print("\nDetailed Statistics:")
        for name, provider_info in stats['providers'].items():
            print(f"\n{name}:")
            print(f"  Model: {provider_info['model']}")
            print(f"  Enabled: {provider_info['enabled']}")
            print(f"  Requests Today: {provider_info['usage_stats']['requests_today']}")
            print(f"  Daily Limit: {provider_info['usage_stats']['daily_limit']}")
            print(f"  Success Rate: {provider_info['usage_stats']['success_rate']:.1f}%")
            print(f"  Avg Response Time: {provider_info['usage_stats']['average_response_time']:.2f}s")
        
    except Exception as e:
        logging.error(f"Stats command failed: {e}")
        print(f"Error: {e}")
        sys.exit(1)

def main():
    """
    Main application entry point.
    """
    parser = argparse.ArgumentParser(
        description="Brain Module - AI Processing with Multiple LLM Providers",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Chat with AI
  python app.py chat "Hello, how are you?"
  
  # Process a file
  python app.py file "resume.pdf" --task-type resume_parsing
  
  # Get system information
  python app.py info
  
  # List output files
  python app.py list
  
  # Test all providers
  python app.py test
  
  # Show provider statistics
  python app.py stats
        """
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging"
    )
    
    parser.add_argument(
        "--config", "-c",
        default="config/providers.yaml",
        help="Path to configuration file"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Chat command
    chat_parser = subparsers.add_parser("chat", help="Process a chat message")
    chat_parser.add_argument("message", help="Message to send to AI")
    chat_parser.add_argument("--temperature", type=float, default=0.7, help="Temperature for response generation")
    chat_parser.add_argument("--max-tokens", type=int, default=1000, help="Maximum tokens in response")
    
    # File command
    file_parser = subparsers.add_parser("file", help="Process a file")
    file_parser.add_argument("file_path", help="Path to the file to process")
    file_parser.add_argument("--task-type", default="resume_parsing", 
                           choices=["resume_parsing", "jd_parsing", "generic_instructions", "summarization", "analysis"],
                           help="Type of processing to perform")
    file_parser.add_argument("--temperature", type=float, default=0.7, help="Temperature for response generation")
    file_parser.add_argument("--max-tokens", type=int, default=2000, help="Maximum tokens in response")
    
    # Info command
    subparsers.add_parser("info", help="Show system information")
    
    # List command
    subparsers.add_parser("list", help="List output files")
    
    # Test command
    subparsers.add_parser("test", help="Test all providers")
    
    # Stats command
    subparsers.add_parser("stats", help="Show provider statistics")
    
    # Parse arguments
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Setup logging
    setup_logging(args.verbose)
    
    try:
        # Initialize brain core
        logging.info(f"DEBUG: Initializing Brain Core with config: {args.config}")
        logging.info(f"DEBUG: Config file exists: {Path(args.config).exists()}")
        logging.info(f"DEBUG: Config file size: {Path(args.config).stat().st_size if Path(args.config).exists() else 'N/A'} bytes")
        
        # Validate configuration file first
        from brain_module.config_manager import load_config
        try:
            config_manager = load_config(args.config)
            validation_result = config_manager.validate_config()
            logging.info(f"DEBUG: Configuration validation result: {validation_result}")
            if not validation_result['valid']:
                logging.error(f"DEBUG: Configuration validation failed with issues: {validation_result['issues']}")
        except Exception as e:
            logging.error(f"DEBUG: Configuration loading failed: {e}")
        
        brain_core = BrainCore(args.config)
        logging.info(f"DEBUG: Brain Core initialization completed successfully")
        
        # Handle commands
        if args.command == "chat":
            handle_chat_command(brain_core, args.message, vars(args))
        
        elif args.command == "file":
            handle_file_command(brain_core, args.file_path, vars(args))
        
        elif args.command == "info":
            handle_info_command(brain_core)
        
        elif args.command == "list":
            handle_list_command(brain_core)
        
        elif args.command == "test":
            handle_test_command(brain_core)
        
        elif args.command == "stats":
            handle_stats_command(brain_core)
        
        logging.info("Application completed successfully")
        
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        sys.exit(1)
    
    except Exception as e:
        logging.error(f"Application failed: {e}")
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()