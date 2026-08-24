from typing import Dict, Any, Optional
import uuid
import datetime

# Simple in-memory store
_jobs: Dict[str, Dict[str, Any]] = {}

def create_job() -> str:
    """Create a new job and return its ID."""
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "result": None,
        "error": None
    }
    return job_id

def update_job_status(job_id: str, status: str, result: Optional[Dict[str, Any]] = None, error: Optional[str] = None) -> None:
    """Update a job's status and potentially its result or error."""
    if job_id in _jobs:
        _jobs[job_id]["status"] = status
        if result is not None:
            _jobs[job_id]["result"] = result
        if error is not None:
            _jobs[job_id]["error"] = error

def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a job by ID."""
    return _jobs.get(job_id)
