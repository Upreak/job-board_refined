def get_provider(provider_name: str = "default"):
    """
    This function will manage and return the appropriate AI provider.
    For now, it returns a mock provider.
    """
    class MockProvider:
        def generate_content(self, prompt: str) -> str:
            return "This is a mock response from the mock provider."

    return MockProvider()
