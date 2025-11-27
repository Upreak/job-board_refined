"""
Configuration Manager for Provider Management System

Reads API keys from environment variables and configures all providers
with proper validation and setup.
"""

import os
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import yaml
from pathlib import Path


@dataclass
class ProviderConfig:
    """Configuration for a provider"""
    name: str
    api_key_envs: List[str]
    models: List[str]
    priority: int = 1
    enabled: bool = True


class ProviderConfigManager:
    """Manages provider configuration from environment variables and config files"""
    
    def __init__(self, config_file: str = "brain_module/config/providers.yaml"):
        self.config_file = Path(config_file)
        self.logger = logging.getLogger(__name__)
        
        # Default provider configurations
        self.default_configs = {
            "openrouter": ProviderConfig(
                name="openrouter",
                api_key_envs=["OPENROUTER_API_KEY", "OPENROUTER_KEY_2", "OPENROUTER_KEY_3"],
                models=["z-ai/glm-4.5-air:free", "x-ai/grok-4.1-fast:free", "z-ai/glm-4-32b"],
                priority=1,
                enabled=True
            ),
            "grok": ProviderConfig(
                name="grok", 
                api_key_envs=["GROQ_API_KEY", "GROQ_API_KEY_2"],
                models=["grok-beta", "grok-vision-beta"],
                priority=2,
                enabled=True
            ),
            "gemini": ProviderConfig(
                name="gemini",
                api_key_envs=["GEMINI_API_KEY", "GEMINI_API_KEY_2"], 
                models=["gemini-2.0-flash-exp:free", "gemini-2.0-flash-lite-001"],
                priority=3,
                enabled=True
            )
        }
        
        self.logger.info("ProviderConfigManager initialized")
    
    def load_configuration(self) -> Dict[str, ProviderConfig]:
        """Load provider configuration from file or use defaults"""
        configurations = {}
        
        # Try to load from file first
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    config_data = yaml.safe_load(f)
                    configurations = self._parse_config_file(config_data)
                    self.logger.info(f"Loaded configuration from {self.config_file}")
                    
            except Exception as e:
                self.logger.warning(f"Failed to load config file {self.config_file}: {e}")
                self.logger.info("Using default configurations")
                configurations = self.default_configs.copy()
        else:
            self.logger.info(f"Config file {self.config_file} not found, using defaults")
            configurations = self.default_configs.copy()
        
        # Merge with environment variable validation
        validated_configs = self._validate_and_merge_configs(configurations)
        return validated_configs
    
    def _parse_config_file(self, config_data: Dict) -> Dict[str, ProviderConfig]:
        """Parse configuration from YAML data"""
        configurations = {}
        
        if 'providers' in config_data:
            for provider_name, provider_data in config_data['providers'].items():
                try:
                    config = ProviderConfig(
                        name=provider_name,
                        api_key_envs=provider_data.get('api_key_envs', []),
                        models=provider_data.get('models', []),
                        priority=provider_data.get('priority', 1),
                        enabled=provider_data.get('enabled', True)
                    )
                    configurations[provider_name] = config
                    self.logger.info(f"Parsed config for {provider_name}")
                    
                except Exception as e:
                    self.logger.error(f"Failed to parse config for {provider_name}: {e}")
        
        return configurations
    
    def _validate_and_merge_configs(self, configurations: Dict[str, ProviderConfig]) -> Dict[str, ProviderConfig]:
        """Validate configurations and merge with defaults"""
        validated = {}
        
        for provider_name, config in configurations.items():
            # Check if provider is enabled
            if not config.enabled:
                self.logger.info(f"Provider {provider_name} is disabled, skipping")
                continue
            
            # Validate API keys exist
            valid_keys = []
            for key_env in config.api_key_envs:
                if os.getenv(key_env):
                    valid_keys.append(key_env)
                else:
                    self.logger.warning(f"Environment variable {key_env} not found for {provider_name}")
            
            if not valid_keys:
                self.logger.warning(f"No valid API keys found for {provider_name}")
                continue
            
            # Update config with valid keys
            config.api_key_envs = valid_keys
            
            # Merge with default models if none specified
            if not config.models and provider_name in self.default_configs:
                config.models = self.default_configs[provider_name].models
            
            validated[provider_name] = config
            self.logger.info(f"Validated {provider_name} with {len(valid_keys)} API keys")
        
        return validated
    
    def get_available_providers(self) -> Dict[str, ProviderConfig]:
        """Get all available and configured providers"""
        return self.load_configuration()
    
    def get_provider_keys(self, provider: str) -> List[str]:
        """Get API key environment variables for a provider"""
        configs = self.load_configuration()
        if provider in configs:
            return configs[provider].api_key_envs
        return []
    
    def get_provider_models(self, provider: str) -> List[str]:
        """Get models for a provider"""
        configs = self.load_configuration()
        if provider in configs:
            return configs[provider].models
        return []
    
    def is_provider_enabled(self, provider: str) -> bool:
        """Check if a provider is enabled"""
        configs = self.load_configuration()
        return provider in configs
    
    def get_config_summary(self) -> Dict[str, Any]:
        """Get summary of all configurations"""
        configs = self.load_configuration()
        summary = {
            'total_providers': len(configs),
            'providers': {},
            'environment_variables_needed': [],
            'missing_keys': []
        }
        
        all_env_vars = set()
        
        for provider_name, config in configs.items():
            # Provider summary
            summary['providers'][provider_name] = {
                'enabled': config.enabled,
                'api_key_count': len(config.api_key_envs),
                'model_count': len(config.models),
                'priority': config.priority,
                'api_keys': config.api_key_envs,
                'models': config.models
            }
            
            # Collect all environment variables
            all_env_vars.update(config.api_key_envs)
        
        # Check which environment variables are missing
        for env_var in all_env_vars:
            if not os.getenv(env_var):
                summary['missing_keys'].append(env_var)
            summary['environment_variables_needed'].append(env_var)
        
        return summary
    
    def create_sample_config(self):
        """Create a sample configuration file"""
        sample_config = {
            'providers': {
                'openrouter': {
                    'api_key_envs': ['OPENROUTER_API_KEY', 'OPENROUTER_KEY_2'],
                    'models': ['z-ai/glm-4.5-air:free', 'x-ai/grok-4.1-fast:free'],
                    'priority': 1,
                    'enabled': True
                },
                'grok': {
                    'api_key_envs': ['GROQ_API_KEY'],
                    'models': ['grok-beta', 'grok-vision-beta'],
                    'priority': 2,
                    'enabled': True
                },
                'gemini': {
                    'api_key_envs': ['GEMINI_API_KEY'],
                    'models': ['gemini-2.0-flash-exp:free', 'gemini-2.0-flash-lite-001'],
                    'priority': 3,
                    'enabled': True
                }
            }
        }
        
        # Ensure directory exists
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Write sample config
        with open(self.config_file, 'w') as f:
            yaml.dump(sample_config, f, default_flow_style=False, indent=2)
        
        self.logger.info(f"Created sample configuration file: {self.config_file}")
        return str(self.config_file)


def setup_providers_from_config(provider_manager, config_manager: ProviderConfigManager = None):
    """Setup provider manager with configuration from config manager"""
    if config_manager is None:
        config_manager = ProviderConfigManager()
    
    logger = logging.getLogger(__name__)
    configurations = config_manager.load_configuration()
    
    logger.info("Setting up providers from configuration...")
    
    for provider_name, config in configurations.items():
        try:
            # Add API keys to provider
            for i, key_env in enumerate(config.api_key_envs):
                key_name = f"primary" if i == 0 else f"secondary_{i}"
                priority = i + 1
                
                success = provider_manager.add_provider_api_key(
                    provider=provider_name,
                    key_env=key_env,
                    key_name=key_name,
                    priority=priority,
                    daily_limit=1000,  # Strict 1000 limit
                    enabled=True
                )
                
                if success:
                    logger.info(f"Added {provider_name} API key: {key_name} ({key_env})")
                else:
                    logger.error(f"Failed to add {provider_name} API key: {key_name} ({key_env})")
            
            # Configure models for provider
            for model_name in config.models:
                provider_manager.configure_provider_model(
                    provider=provider_name,
                    model_name=model_name,
                    max_tokens=4000 if provider_name != "gemini" else 8192,
                    temperature=0.7,
                    enabled=True
                )
            
            logger.info(f"Configured {len(config.api_key_envs)} API keys and {len(config.models)} models for {provider_name}")
            
        except Exception as e:
            logger.error(f"Failed to setup provider {provider_name}: {e}")
    
    logger.info("Provider setup complete")
    return True


def create_env_template():
    """Create a .env template file with all required environment variables"""
    template_content = """
# Provider Management System - Environment Variables Template
# Copy this to .env file and fill in your actual API keys

# OpenRouter API Keys (Primary provider)
OPENROUTER_API_KEY=your_openrouter_primary_key_here
OPENROUTER_KEY_2=your_openrouter_secondary_key_here
OPENROUTER_KEY_3=your_openrouter_backup_key_here

# Groq/Grok API Keys (Secondary provider)
GROQ_API_KEY=your_groq_primary_key_here
GROQ_API_KEY_2=your_groq_secondary_key_here

# Google Gemini API Keys (Tertiary provider)
GEMINI_API_KEY=your_gemini_primary_key_here
GEMINI_API_KEY_2=your_gemini_secondary_key_here

# Optional: For OpenRouter site identification
SITE_URL=https://your-domain.com
SITE_NAME=Your Application Name

# Provider Configuration
PROVIDER_LOG_LEVEL=INFO
PROVIDER_MONITORING_ENABLED=true
PROVIDER_MONITORING_INTERVAL=60

# Token Limits
OPENROUTER_DAILY_LIMIT=1000
GROQ_DAILY_LIMIT=1000
GEMINI_DAILY_LIMIT=1000
"""
    
    env_file = Path(".env.template")
    with open(env_file, 'w') as f:
        f.write(template_content.strip())
    
    print(f"Created environment template: {env_file}")
    print("Copy this to .env and fill in your actual API keys")
    return str(env_file)


if __name__ == "__main__":
    # Example usage
    config_manager = ProviderConfigManager()
    
    # Create sample config
    config_file = config_manager.create_sample_config()
    print(f"Sample config created: {config_file}")
    
    # Create environment template
    env_template = create_env_template()
    print(f"Environment template created: {env_template}")
    
    # Show config summary
    summary = config_manager.get_config_summary()
    print("\nConfiguration Summary:")
    print(f"Total providers: {summary['total_providers']}")
    print(f"Missing environment variables: {summary['missing_keys']}")
    print(f"Required environment variables: {summary['environment_variables_needed']}")