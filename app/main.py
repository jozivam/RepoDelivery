from datetime import datetime, timezone
from typing import Dict, List
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="RepoDelivery API", version="0.1.0")


class TaskCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(default="", max_length=500)


class Task(TaskCreate):
    id: str
    done: bool = False
    created_at: datetime


TASKS: Dict[str, Task] = {}


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "repodelivery-api"}


@app.get("/tasks", response_model=List[Task])
def list_tasks() -> List[Task]:
    return list(TASKS.values())


@app.post("/tasks", response_model=Task, status_code=201)
def create_task(payload: TaskCreate) -> Task:
    task = Task(
        id=str(uuid4()),
        title=payload.title,
        description=payload.description,
        done=False,
        created_at=datetime.now(timezone.utc),
    )
    TASKS[task.id] = task
    return task


@app.patch("/tasks/{task_id}", response_model=Task)
def mark_task_done(task_id: str) -> Task:
    task = TASKS.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    task.done = True
    TASKS[task_id] = task
    return task
