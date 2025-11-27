from celery import Celery
import os
import logging
from ..shared.db import SessionLocal
from ..shared.models import Request
import datetime
from . import brain_core

# --- Logging Setup ---
log_file_path = os.path.join(os.path.dirname(__file__), 'brain_module.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - QID:%(qid)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file_path),
        logging.StreamHandler()
    ]
)

class QIDLogAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        return '[%s] %s' % (self.extra['qid'], msg), kwargs

def get_logger(qid: str):
    logger = logging.getLogger(__name__)
    return QIDLogAdapter(logger, {'qid': qid})

# --- Celery Setup ---
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("tasks", broker=REDIS_URL, backend=REDIS_URL)

@celery_app.task(name='brain_module.worker.process_task')
def process_task(qid: str, task_type: str, payload: dict):
    logger = get_logger(qid)
    logger.info(f"Task received: type='{task_type}'")

    db = SessionLocal()
    request = db.query(Request).filter(Request.qid == qid).first()

    if not request:
        logger.error("Request not found in the database. Aborting.")
        return {"error": "Request not found"}

    try:
        request.status = "in_progress"
        request.started_at = datetime.datetime.utcnow()
        db.commit()
        logger.info("Task status updated to 'in_progress'.")

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
        else:
            raise ValueError(f"Unknown task_type: {task_type}")

        request.status = "completed"
        request.result = result_payload
        request.finished_at = datetime.datetime.utcnow()
        db.commit()
        logger.info(f"Task '{task_type}' completed successfully.")

        return {"status": "success", "qid": qid, "result": result_payload}

    except Exception as e:
        logger.exception("An unhandled exception occurred during task processing.")
        request.status = "failed"
        request.result = {"error": str(e)}
        request.finished_at = datetime.datetime.utcnow()
        db.commit()
        return {"status": "error", "qid": qid, "error": str(e)}
    finally:
        db.close()
