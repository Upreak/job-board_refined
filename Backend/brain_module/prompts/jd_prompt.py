# prompts/jd_prompt.py
from typing import Dict, Any
from jinja2 import Template
import json

class JDPromptRenderer:
    """Renders prompts for job description parsing"""
    
    def __init__(self):
        self.template = self._get_jd_template()
    
    def _get_jd_template(self) -> str:
        """Get the job description parsing template"""
        return """Task:
Extract all information explicitly mentioned in the job description (structured/unstructured text) and structure it according to the Job Details schema below. Do NOT infer or generate missing information. If a field is not present, leave it blank.

General Rules:
- Use only the text provided in the JD.
- Maintain exact wording for responsibilities, skills, and descriptions.
- For lists (skills, locations, perks, responsibilities), return as arrays.
- Preserve original wording, punctuation, and formatting.
- Output strictly in JSON.

Fields to Extract (Output):

Basic Job Details:
  client:
  job_title:
  job_id:
  employment_type:
  work_mode:
  industry:
  functional_area:

Location & Compensation:
  job_locations: []
  minimum_salary:
  maximum_salary:
  currency:
  salary_unit:
  benefits_perks: []

Job Description:
  about_company:
  job_summary:
  responsibilities_key_duties: []
  experience_required:
  education_qualification:
  required_skills: []
  preferred_skills: []
  tools_tech_stack: []

Application Details:
  number_of_openings:
  application_deadline:
  hiring_process_rounds: []

Compliance / Misc:
  notice_period_accepted:

SEO & Metadata:
  slug_url:
  meta_title:
  meta_description:

Processing Guidelines:
- Do not assume seniority or role level unless explicitly stated.
- Capture responsibilities exactly as listed—one item per bullet/line.
- Required, preferred, and tools/tech stack must match the JD text exactly.
- For dates, keep the original format from the JD.
- For salary fields, extract values exactly as written.
- Leave blank fields as empty strings or empty arrays.
- Return ONLY the final JSON.

Job Description Text:
{{ jd_text }}
"""
    
    def render_prompt(self, text: str, source_type: str = "text", filename: str = None) -> str:
        """Render the job description parsing prompt"""
        context = {
            'jd_text': text,
            'source_type': source_type,
            'filename': filename or 'unknown'
        }
        
        template = Template(self.template)
        return template.render(**context)