from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_task_flow() -> None:
    create = client.post("/tasks", json={"title": "Entregar MVP", "description": "API inicial"})
    assert create.status_code == 201
    task_id = create.json()["id"]

    listing = client.get("/tasks")
    assert listing.status_code == 200
    assert any(item["id"] == task_id for item in listing.json())

    done = client.patch(f"/tasks/{task_id}")
    assert done.status_code == 200
    assert done.json()["done"] is True
