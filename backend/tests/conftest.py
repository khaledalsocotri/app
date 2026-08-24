import os
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/") + "/api"


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def user_token(api):
    # Try login for known seeded regular user; if it doesn't exist, register it.
    r = api.post(f"{BASE_URL}/auth/login", json={"email": "visitor@socotra.app", "password": "Visit@123"})
    if r.status_code == 200:
        return r.json()["token"]
    r = api.post(f"{BASE_URL}/auth/register", json={"name": "Visitor", "email": "visitor@socotra.app", "password": "Visit@123"})
    assert r.status_code == 200, f"register visitor failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(f"{BASE_URL}/auth/login", json={"email": "admin@socotra.app", "password": "Admin@123"})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture
def auth_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
