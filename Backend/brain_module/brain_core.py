import yaml
import os
from .providers import provider_manager

PROMPT_TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'templates.yaml')

def load_prompt_templates():
    """Loads prompt templates from the YAML file."""
    try:
        with open(PROMPT_TEMPLATES_PATH, 'r') as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        return {}

PROMPT_TEMPLATES = load_prompt_templates()

def get_prompt(task_type: str, context: dict) -> str:
    """Gets a prompt for a given task type and formats it with the context."""
    template = PROMPT_TEMPLATES.get(task_type, {}).get("prompt", "")
    return template.format(**context)

def parse_resume(resume_text: str) -> dict:
    """Parses a resume using an AI provider."""
    provider = provider_manager.get_provider("gemini")
    prompt = get_prompt("resume_parsing", {"resume_text": resume_text})
    response_str = provider.generate_content(prompt)
    return {"parsed_data": response_str}

def generate_chat_response(history: list, candidate_name: str, job_title: str) -> str:
    """Generates a chat response using an AI provider."""
    provider = provider_manager.get_provider("gemini")
    prompt = get_prompt("chat", {
        "candidate_name": candidate_name,
        "job_title": job_title,
        "history": str(history)
    })
    response = provider.generate_content(prompt)
    return response

def search_jobs(query: str) -> list:
    """Searches for jobs using an AI provider."""
    provider = provider_manager.get_provider("gemini")
    prompt = get_prompt("job_search", {"query": query})
    response_str = provider.generate_content(prompt)
    return [{"jobs_found": response_str}]
