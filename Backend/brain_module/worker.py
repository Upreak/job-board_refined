import time
from celery import Celery
import os
from shared.db import SessionLocal
from shared.models import Request
import datetime
from . import brain_core

# Get Redis URL from environment variable, with a default
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Configure Celery
celery_app = Celery("tasks", broker=REDIS_URL, backend=REDIS_URL)

@celery_app.task(name='brain_module.worker.process_task')
def process_task(qid: str, task_type: str, payload: dict):
    """
    Celery task to process a job. This will be executed by the Brain Module worker.
    """
    db = SessionLocal()
    try:
        # Find the request in the database
        request = db.query(Request).filter(Request.qid == qid).first()
        if not request:
            # Handle error: request not found
            return {"error": "Request not found"}

        # Update status to 'in_progress'
        request.status = "in_progress"
        request.started_at = datetime.datetime.utcnow()
        db.commit()

        # Execute the appropriate function from brain_core
        result_payload = {}
        if task_type == "resume_parsing":
            result_payload = brain_core.parse_resume(payload.get("resume_text", ""))
        elif task_type == "chat":
            result_payload = {
                "message": brain_core.generate_chat_response(
                    payload.get("history", []),
                    payload.get("candidate_name", ""),
                    payload.get("job_title", "")
                )
            }
        elif task_type == "search_jobs":
            result_payload = brain_core.search_jobs(payload.get("query", ""))

        # Update status to 'completed' and save the result
        request.status = "completed"
        request.result = result_payload
        request.finished_at = datetime.datetime.utcnow()
        db.commit()

        print(f"--- Brain Module: Finished task {qid} ---")

        return {"status": "success", "qid": qid, "result": result_payload}

    except Exception as e:
        # Handle exceptions, update status to 'failed'
        request.status = "failed"
        request.result = {"error": str(e)}
        request.finished_at = datetime.datetime.utcnow()
        db.commit()
        return {"status": "error", "qid": qid, "error": str(e)}
    finally:
        db.close()
