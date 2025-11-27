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

class BrainModuleIntegrationTest(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()
        celery_app.conf.update(task_always_eager=True)
        Base.metadata.create_all(bind=engine)
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
        self.assertIn("parsed_data", updated_request.result)

if __name__ == '__main__':
    unittest.main()
