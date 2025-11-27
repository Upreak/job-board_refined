from sqlalchemy import Column, String, JSON, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .db import Base

class Request(Base):
    __tablename__ = "requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    qid = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    task_type = Column(String)
    status = Column(String, default="queued")
    payload = Column(JSON)
    result = Column(JSON)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    started_at = Column(DateTime)
    finished_at = Column(DateTime)
    logs = Column(JSON)
