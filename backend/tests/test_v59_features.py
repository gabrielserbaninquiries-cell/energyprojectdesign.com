"""V5.9 regression suite — Clients CRM + Companies Directory + QR verify page wiring.

Covers (test functions intentionally focused on V5.9 deliverables, plus quick
regression checks for unchanged modules):
  - GET /api/companies/roles (public)
  - GET /api/companies/stats (public)
  - GET /api/companies (public list with filters)
  - POST /api/companies (auth, auto-verify when is_developer)
  - GET /api/companies/{id}, 404, PATCH 403/200, DELETE 200
  - Clients CRM CRUD (per-user, auth-required)
  - Regression: gas-project phases (11), subscribers/types (5), AI agents rate_limit,
    auth/login admin.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"

ADMIN_EMAIL = "dragosserban95@gmail.com"
ADMIN_PASS = "Test12345"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def anon_session():
    """Fresh session with NO cookies/auth — for testing auth-required endpoints reject."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    token = data.get("token") or data.get("access_token")
    assert token, f"no token in login response: {data}"
    return token


@pytest.fixture(scope="module")
def auth_session(session, admin_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"})
    return s


# ====================== COMPANIES DIRECTORY ======================

def test_companies_roles_public(session):
    r = session.get(f"{BASE_URL}/api/companies/roles")
    assert r.status_code == 200
    roles = r.json()
    assert isinstance(roles, list)
    assert len(roles) >= 8
    ids = {x["id"] for x in roles}
    assert {"designer", "executor", "vgd", "rte"}.issubset(ids)
    for item in roles:
        assert "id" in item and "label" in item


def test_companies_stats_public(session):
    r = session.get(f"{BASE_URL}/api/companies/stats")
    assert r.status_code == 200
    assert isinstance(r.json(), dict)


def test_companies_list_public_with_filters(session):
    r = session.get(f"{BASE_URL}/api/companies", params={"industry": "gas", "role": "designer"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_companies_full_crud_lifecycle(auth_session, session):
    # CREATE — admin is developer so should be auto-verified
    payload = {
        "name": "TEST_V59 Proiectanti Gaz SRL",
        "cui": "RO99999000",
        "industry": "gas",
        "roles": ["designer", "vgd"],
        "city": "Bucuresti",
        "county": "Bucuresti",
        "email": "test_v59@example.com",
        "description": "TEST_V59 company for regression suite",
    }
    r = auth_session.post(f"{BASE_URL}/api/companies", json=payload)
    assert r.status_code == 200, f"create failed: {r.status_code} {r.text[:200]}"
    doc = r.json()
    assert doc["name"] == payload["name"]
    assert doc["verified"] is True, "admin (is_developer) must auto-verify"
    assert doc["status"] == "verified"
    assert doc["submitted_by"]
    cid = doc["company_id"]
    assert cid.startswith("co_")

    # GET by id (public)
    r = session.get(f"{BASE_URL}/api/companies/{cid}")
    assert r.status_code == 200
    assert r.json()["name"] == payload["name"]

    # GET 404
    r = session.get(f"{BASE_URL}/api/companies/co_does_not_exist_xyz")
    assert r.status_code == 404

    # LIST should now find it via industry+role filter
    r = session.get(f"{BASE_URL}/api/companies", params={"industry": "gas", "role": "designer"})
    assert r.status_code == 200
    names = [c["name"] for c in r.json()]
    assert payload["name"] in names

    # PATCH without auth -> 401/403 (use anon to avoid leaking cookies from prior login)
    anon = requests.Session()
    anon.headers.update({"Content-Type": "application/json"})
    r = anon.patch(f"{BASE_URL}/api/companies/{cid}", json={"city": "Cluj"})
    assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code}"

    # PATCH as developer admin
    r = auth_session.patch(f"{BASE_URL}/api/companies/{cid}", json={"city": "Cluj"})
    assert r.status_code == 200
    assert r.json()["city"] == "Cluj"

    # DELETE as admin
    r = auth_session.delete(f"{BASE_URL}/api/companies/{cid}")
    assert r.status_code == 200

    # Verify gone
    r = session.get(f"{BASE_URL}/api/companies/{cid}")
    assert r.status_code == 404


# ====================== CLIENTS CRM ======================

def test_clients_requires_auth(anon_session):
    r = anon_session.get(f"{BASE_URL}/api/clients")
    assert r.status_code in (401, 403)


def test_clients_full_crud_lifecycle(auth_session):
    # CREATE
    payload = {
        "name": "TEST_V59 Client Popescu Ion",
        "type": "physical",
        "cnp_or_cui": "1900101220011",
        "email": "popescu_test_v59@example.com",
        "city": "Bucuresti",
        "industry": "gas",
        "status": "active",
    }
    r = auth_session.post(f"{BASE_URL}/api/clients", json=payload)
    assert r.status_code == 200, f"{r.status_code} {r.text[:200]}"
    doc = r.json()
    assert doc["name"] == payload["name"]
    assert doc["status"] == "active"
    cli_id = doc["client_id"]
    assert cli_id.startswith("cli_")

    # GET by id
    r = auth_session.get(f"{BASE_URL}/api/clients/{cli_id}")
    assert r.status_code == 200
    assert r.json()["name"] == payload["name"]

    # LIST with filters
    r = auth_session.get(f"{BASE_URL}/api/clients", params={"status": "active", "industry": "gas"})
    assert r.status_code == 200
    names = [c["name"] for c in r.json()]
    assert payload["name"] in names

    # PATCH
    r = auth_session.patch(f"{BASE_URL}/api/clients/{cli_id}", json={"city": "Iasi"})
    assert r.status_code == 200
    assert r.json()["city"] == "Iasi"

    # DELETE
    r = auth_session.delete(f"{BASE_URL}/api/clients/{cli_id}")
    assert r.status_code == 200

    # Verify gone
    r = auth_session.get(f"{BASE_URL}/api/clients/{cli_id}")
    assert r.status_code == 404


# ====================== REGRESSION ======================

def test_regression_gas_project_phases(session):
    r = session.get(f"{BASE_URL}/api/gas-project/phases")
    assert r.status_code == 200
    data = r.json()
    phases = data["phases"] if isinstance(data, dict) else data
    assert isinstance(phases, list)
    assert len(phases) == 11


def test_regression_subscribers_types(session):
    r = session.get(f"{BASE_URL}/api/subscribers/types")
    assert r.status_code == 200
    data = r.json()
    types = data["types"] if isinstance(data, dict) else data
    assert isinstance(types, list)
    assert len(types) == 5


def test_regression_verify_public_qr_endpoint(session):
    r = session.get(f"{BASE_URL}/api/gas-project/gp_7b51a8a17592023e/public")
    assert r.status_code == 200
    data = r.json()
    assert data["pid"] == "gp_7b51a8a17592023e"
    assert data["title"]
    assert data["status"] in ("draft", "signed")


def test_regression_ai_agents_rate_limit_shape(auth_session):
    """One call only — verify rate_limit object shape (do not burn quota)."""
    r = auth_session.post(f"{BASE_URL}/api/ai/agents/user", json={
        "agent": "general",
        "message": "Salut, doar test V5.9 — un singur cuvant.",
    })
    assert r.status_code == 200, f"{r.status_code} {r.text[:300]}"
    data = r.json()
    assert "rate_limit" in data, f"rate_limit missing: {list(data.keys())}"
    rl = data["rate_limit"]
    assert {"minute_used", "minute_limit", "day_used", "day_limit"}.issubset(rl.keys())
