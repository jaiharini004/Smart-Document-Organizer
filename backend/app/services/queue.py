from celery import Celery
from app.config import settings

celery_app = Celery(
    "worker",
    broker=settings.redis_url,
    backend=settings.redis_url
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

def enqueue_process_document(document_id: str, file_path: str):
    """
    Enqueues a task to the Celery worker to process the document.
    """
    celery_app.send_task(
        "process_document_task",
        kwargs={"document_id": str(document_id), "file_path": file_path}
    )
