import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

celery_app = Celery(
    "jharkhand_command",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "app.tasks.ingest",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Beat schedule for periodic polling
celery_app.conf.beat_schedule = {
    "run-all-ingestion": {
        "task": "app.tasks.ingest.run_all_sources",
        "schedule": 300.0,  # every 5 minutes
    },
}
