from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from ..shared import models, db
from ..shared.db import engine
from pydantic import BaseModel
import uuid
from celery import Celery
import os
from .rule_engine import RuleEngine

# Get Redis URL from environment variable, with a default
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Configure Celery
celery_app = Celery("tasks", broker=REDIS_URL, backend=REDIS_URL)

# Initialize Rule Engine
rule_engine = RuleEngine("Backend/rulebook/workflows.yaml")

app = FastAPI()

class TaskRequest(BaseModel):
    task_type: str
    payload: dict

@app.post("/tasks")
def create_task(task_request: TaskRequest, db_session: Session = Depends(db.get_db)):
    new_request = models.Request(
        qid=str(uuid.uuid4()),
        task_type=task_request.task_type,
        payload=task_request.payload,
        status="queued"
    )
    db_session.add(new_request)
    db_session.commit()
    db_session.refresh(new_request)

    # Get initial tasks from the rulebook
    initial_tasks = rule_engine.get_initial_tasks(task_request.task_type)

    for task in initial_tasks:
        task_name = task.get("task")
        task_params = task.get("params", {})

        # Merge the original payload with the rulebook params
        final_payload = {**task_request.payload, **task_params}

        celery_app.send_task(
            task_name,
            args=[new_request.qid, task_request.task_type, final_payload]
        )

    return {"qid": new_request.qid}

@app.get("/tasks/{qid}")
def get_task_status(qid: str, db_session: Session = Depends(db.get_db)):
    request = db_session.query(models.Request).filter(models.Request.qid == qid).first()
    if not request:
        return {"error": "Task not found"}
    return {
        "qid": request.qid,
        "status": request.status,
        "result": request.result,
    }

@app.get("/health")
def read_root():
    return {"status": "ok"}
