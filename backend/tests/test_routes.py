# tests/test_routes.py

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()


def test_companions():
    response = client.get("/api/companions")
    assert response.status_code == 200
    data = response.json()
    assert "tutors" in data
    assert len(data["tutors"]) == 10


def test_webrtc_config():
    response = client.get("/api/webrtc/config")
    assert response.status_code == 200
    data = response.json()
    assert "iceServers" in data
