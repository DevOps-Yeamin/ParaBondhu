import pytest
from fastapi.testclient import TestClient
import sys
sys.path.insert(0, ".")

from backend.app.main import app

client = TestClient(app)

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert "ParaBondhu" in res.json()["platform"]

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_auth_login_and_me():
    res = client.post("/api/v1/auth/login", json={
        "email": "yeamin@parabondhu.bd",
        "password": "Citizen123!"
    })
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    assert token_data["user"]["full_name"] == "Tanvir Yeamin"

    # Test /me with token
    token = token_data["access_token"]
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "yeamin@parabondhu.bd"

def test_traffic_reports():
    res = client.get("/api/v1/traffic/reports")
    assert res.status_code == 200
    reports = res.json()
    assert len(reports) >= 2
    # Verify official feed is distinguished
    official = [r for r in reports if r["is_official"] is True]
    assert len(official) >= 1

def test_neighbor_items():
    res = client.get("/api/v1/neighbor/items")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 2

def test_khunje_dao_and_matching():
    res = client.get("/api/v1/khunje/items")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 2
    
    first_item_id = items[0]["id"]
    match_res = client.get(f"/api/v1/khunje/match-suggestions/{first_item_id}")
    assert match_res.status_code == 200
    assert isinstance(match_res.json(), list)

def test_lineless_providers():
    res = client.get("/api/v1/lineless/providers")
    assert res.status_code == 200
    providers = res.json()
    assert len(providers) >= 1
    assert "queues" in providers[0]

def test_easyaccess_spots():
    res = client.get("/api/v1/easyaccess/spots")
    assert res.status_code == 200
    spots = res.json()
    assert len(spots) >= 1
    assert "has_wheelchair_ramp" in spots[0]

def test_probashi_jobs():
    res = client.get("/api/v1/probashi/jobs")
    assert res.status_code == 200
    jobs = res.json()
    assert len(jobs) >= 1
    assert jobs[0]["is_verified_agency"] is True

def test_workhub_courses_and_jobs():
    courses_res = client.get("/api/v1/workhub/courses")
    assert courses_res.status_code == 200
    assert len(courses_res.json()) >= 1

    jobs_res = client.get("/api/v1/workhub/jobs")
    assert jobs_res.status_code == 200
    assert len(jobs_res.json()) >= 1

def test_stats_endpoint():
    res = client.get("/api/v1/stats")
    assert res.status_code == 200
    stats = res.json()
    assert stats["active_citizens"] > 0
    assert stats["reunited_items_count"] > 0
