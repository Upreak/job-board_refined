def parse_resume(resume_text: str) -> dict:
    """
    This function will contain the logic to parse a resume.
    For now, it returns a mock response.
    """
    return {
        "fullName": "John Doe (from Brain Core)",
        "email": "john.doe.core@example.com",
        "phone": "+1 555 0199",
        "skills": ["React", "TypeScript", "Node.js", "Tailwind"],
        "experience": 5,
        "currentCtc": "12 LPA",
        "expectedCtc": "18 LPA"
    }

def generate_chat_response(history: list, candidate_name: str, job_title: str) -> str:
    """
    This function will contain the logic to generate a chat response.
    For now, it returns a mock response.
    """
    return f"(Mock AI from Brain Core): Hi {candidate_name}, thanks for your interest in the {job_title} role. Tell me about your experience."

def search_jobs(query: str) -> list:
    """
    This function will contain the logic to search for jobs using an AI provider.
    For now, it returns a mock response.
    """
    return [
        {"title": "Software Engineer", "company": "Tech Corp", "location": "San Francisco, CA"},
        {"title": "Product Manager", "company": "Innovate Inc.", "location": "New York, NY"},
    ]
