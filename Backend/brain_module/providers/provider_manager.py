import os
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

class ProviderError(Exception):
    """Custom exception for provider-related errors."""
    pass

class BaseProvider:
    def __init__(self, api_key: str):
        if not api_key:
            raise ProviderError(f"{self.__class__.__name__} API key is missing.")
        self.api_key = api_key

    def generate_content(self, prompt: str) -> str:
        raise NotImplementedError

class GeminiProvider(BaseProvider):
    def __init__(self, api_key: str):
        super().__init__(api_key)
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    def generate_content(self, prompt: str) -> str:
        logger.info(f"Generating content with Gemini for prompt: '{prompt[:30]}...'")
        response = self.model.generate_content(prompt)
        return response.text

class GrokProvider(BaseProvider):
    def generate_content(self, prompt: str) -> str:
        logger.info(f"Generating content with Grok for prompt: '{prompt[:30]}...'")
        return f"Response from Grok for: '{prompt}'"

def get_provider(provider_name: str = "gemini"):
    """
    Factory function to get an instance of an AI provider.
    Loads the required API key from environment variables.
    """
    logger.info(f"Attempting to get provider: {provider_name}")

    api_key = None
    if provider_name == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        ProviderClass = GeminiProvider
    elif provider_name == "grok":
        api_key = os.getenv("GROK_API_KEY")
        ProviderClass = GrokProvider
    else:
        logger.error(f"Unknown provider specified: {provider_name}")
        raise ProviderError(f"Unknown provider specified: {provider_name}")

    if not api_key:
        logger.warning(f"API key for {provider_name} not found in environment variables.")
        raise ProviderError(f"API key for {provider_name} not found.")

    try:
        return ProviderClass(api_key=api_key)
    except ProviderError as e:
        logger.error(f"Failed to initialize provider {provider_name}: {e}")
        raise
