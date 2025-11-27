import unittest
import os
import sys
import uuid
from unittest.mock import patch
from sqlalchemy import text

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from Backend.brain_module.worker import process_task, celery_app
from Backend.shared.db import SessionLocal, engine
from Backend.shared.models import Request, Base
from Backend.brain_module.prompts.resume_prompt import ResumePromptRenderer

class BrainModuleIntegrationTest(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()
        celery_app.conf.update(task_always_eager=True)
        Base.metadata.create_all(bind=engine)
        if engine.dialect.name == "postgresql":
            with engine.connect() as connection:
                connection.execute(text("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"))

    def tearDown(self):
        Base.metadata.drop_all(bind=engine)
        self.db.close()

    @patch('Backend.brain_module.brain_core.parse_resume')
    def test_resume_parsing_task(self, mock_parse_resume):
        # Arrange
        mock_parse_resume.return_value = {"status": "parsed"}
        qid = str(uuid.uuid4())
        task_type = "resume_parsing"
        payload = {"resume_text": "This is a test resume."}

        request = Request(qid=qid, task_type=task_type, payload=payload)
        self.db.add(request)
        self.db.commit()

        # Act
        result = process_task.delay(qid, task_type, payload)

        # Assert
        self.assertTrue(result.ready())
        self.assertEqual(result.status, 'SUCCESS')

        updated_request = self.db.query(Request).filter(Request.qid == qid).one()
        self.assertEqual(updated_request.status, "completed")
        self.assertIn("status", updated_request.result)

class TestResumePromptRenderer(unittest.TestCase):

    def test_render_prompt(self):
        renderer = ResumePromptRenderer()
        resume_text = "John Doe\nSoftware Engineer\nSan Francisco, CA"
        prompt = renderer.render_prompt(resume_text)

        # Assert that the prompt is a string
        self.assertIsInstance(prompt, str)

        # Assert that the resume text is in the prompt
        self.assertIn(resume_text, prompt)

        # Assert that the prompt contains the expected fields
        self.assertIn("Full Name:", prompt)
        self.assertIn("Email Address:", prompt)
        self.assertIn("Mobile Number:", prompt)
        self.assertIn("Professional Summary:", prompt)
        self.assertIn("LinkedIn URL:", prompt)
        self.assertIn("Portfolio URL", prompt)
        self.assertIn("Highest Education (PhD/Doctorate):", prompt)
        self.assertIn("Second Highest Education (Masters):", prompt)
        self.assertIn("Third Highest Education (Bachelor):", prompt)
        self.assertIn("DIPLOMA:", prompt)
        self.assertIn("ITI:", prompt)
        self.assertIn("PUC:", prompt)
        self.assertIn("SSLC:", prompt)
        self.assertIn("Certificates:", prompt)
        self.assertIn("Skills:", prompt)
        self.assertIn("Field of Study:", prompt)
        self.assertIn("Projects / Profile:", prompt)
        self.assertIn("GitHub / Behance / Kaggle URL:", prompt)
        self.assertIn("Total Experience (Years):", prompt)
        self.assertIn("Current Role:", prompt)
        self.assertIn("Expected Role:", prompt)
        self.assertIn("Job Type:", prompt)
        self.assertIn("Current Locations:", prompt)
        self.assertIn("Ready to Relocate:", prompt)
        self.assertIn("Notice Period:", prompt)
        self.assertIn("Work Authorization / Visa:", prompt)
        self.assertIn("Current CTC (LPA):", prompt)
        self.assertIn("Expected CTC (LPA):", prompt)
        self.assertIn("Preferred Industries:", prompt)
        self.assertIn("Gender:", prompt)
        self.assertIn("Marital Status:", prompt)
        self.assertIn("Date of Birth:", prompt)
        self.assertIn("Languages Known:", prompt)
        self.assertIn("Job Title/Role:", prompt)
        self.assertIn("Company Name:", prompt)
        self.assertIn("Start Date:", prompt)
        self.assertIn("End Date:", prompt)
        self.assertIn("Key Responsibilities:", prompt)
        self.assertIn("Tools Used:", prompt)


if __name__ == '__main__':
    unittest.main()
