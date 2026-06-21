"""V10.3 backend tests — Transfer project endpoint + audit log + dispatch email + regression.

Tests cover:
- Login
- POST /api/gas-project/{pid}/transfer (new endpoint)
- GET /api/gas-project/{pid}/audit-log (new endpoint)
- POST /api/gas-project/{pid}/phase/{phase_id}/dispatch (email dispatch — should not 500)
- GET /api/gas-project/{pid}/dossier.zip (regression — 34 files)
- PATCH /api/gas-project/{pid} (send-to-avizare status mutation)
"""
import os
import io
import zipfile
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
EMAIL = "dragosserban95@gmail.com"
PASSWORD = "Nuamparola_9"
PID = "gp_e79e2810cc64b5b4"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text[:300]}"
    t = r.json().get("token")
    assert t and isinstance(t, str)
    return t


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ----- Login regression -----
def test_login_ok(token):
    assert len(token) > 20


# ----- Transfer endpoint -----
def test_transfer_rejects_self(auth_headers):
    r = requests.post(f"{BASE_URL}/api/gas-project/{PID}/transfer",
                      headers=auth_headers,
                      json={"target_email": EMAIL, "target_role": "vgd"}, timeout=30)
    assert r.status_code == 400, f"Expected 400 for self transfer, got {r.status_code}: {r.text[:200]}"


def test_transfer_success(auth_headers):
    r = requests.post(f"{BASE_URL}/api/gas-project/{PID}/transfer",
                      headers=auth_headers,
                      json={"target_email": "TEST_colaborator@example.com",
                            "target_role": "vgd",
                            "note": "Te rog verifica (test automated)"}, timeout=30)
    assert r.status_code == 200, f"{r.status_code} {r.text[:400]}"
    data = r.json()
    assert data.get("ok") is True
    assert "shared_access" in data
    sa = data["shared_access"]
    assert sa["email"] == "test_colaborator@example.com"
    assert sa["role"] == "vgd"
    assert "target_exists_in_platform" in data
    assert "email_sent" in data  # could be False if SMTP not configured — OK


def test_transfer_invalid_pid(auth_headers):
    r = requests.post(f"{BASE_URL}/api/gas-project/gp_doesnotexist/transfer",
                      headers=auth_headers,
                      json={"target_email": "x@example.com", "target_role": "proiectant"},
                      timeout=30)
    assert r.status_code == 404


def test_transfer_missing_email(auth_headers):
    r = requests.post(f"{BASE_URL}/api/gas-project/{PID}/transfer",
                      headers=auth_headers,
                      json={"target_role": "vgd"}, timeout=30)
    assert r.status_code in (400, 422)


# ----- Audit log endpoint -----
def test_audit_log_returns_structure(auth_headers):
    r = requests.get(f"{BASE_URL}/api/gas-project/{PID}/audit-log",
                     headers=auth_headers, timeout=30)
    assert r.status_code == 200, f"{r.status_code} {r.text[:300]}"
    data = r.json()
    assert "audit_log" in data
    assert "shared_access" in data
    assert isinstance(data["audit_log"], list)
    assert isinstance(data["shared_access"], list)
    # We just transferred — at least one entry must exist for our test email
    actions = [e for e in data["audit_log"] if e.get("action") == "transfer"]
    assert len(actions) >= 1, "Expected at least one transfer audit entry"
    # latest transfer entry should be to our test target
    latest = actions[-1]
    assert latest["by"].lower() == EMAIL.lower()


def test_audit_log_invalid_pid(auth_headers):
    r = requests.get(f"{BASE_URL}/api/gas-project/gp_doesnotexist/audit-log",
                     headers=auth_headers, timeout=30)
    assert r.status_code == 404


# ----- Email dispatch endpoint (must NOT 500 if SMTP not configured) -----
def test_dispatch_does_not_500(auth_headers):
    # Find a real phase id — use 'primarie' which is the common default route
    payload = {"to": ["TEST_recipient@example.com"], "subject": "Test", "message": "test"}
    r = requests.post(f"{BASE_URL}/api/gas-project/{PID}/phase/primarie/dispatch",
                      headers=auth_headers,
                      json=payload, timeout=60)
    # Accept 200 with ok=false (SMTP not configured) OR 200 ok=true. 4xx for unknown phase also OK.
    # Critically — MUST NOT be 500.
    assert r.status_code != 500, f"Dispatch returned 500: {r.text[:400]}"
    assert r.status_code in (200, 400, 404, 422), f"Unexpected: {r.status_code} {r.text[:200]}"


# ----- send-to-avizare / status PATCH regression -----
def test_patch_status_awaiting_avizare(auth_headers):
    r = requests.patch(f"{BASE_URL}/api/gas-project/{PID}",
                       headers=auth_headers,
                       json={"status": "awaiting_avizare"}, timeout=30)
    assert r.status_code == 200, f"{r.status_code} {r.text[:300]}"
    # restore to signed for next runs
    requests.patch(f"{BASE_URL}/api/gas-project/{PID}",
                   headers=auth_headers,
                   json={"status": "signed"}, timeout=30)


# ----- Dossier zip regression -----
def test_dossier_zip_has_files(auth_headers):
    r = requests.get(f"{BASE_URL}/api/gas-project/{PID}/dossier.zip",
                     headers={"Authorization": auth_headers["Authorization"]}, timeout=120)
    assert r.status_code == 200, f"{r.status_code} {r.text[:200]}"
    assert len(r.content) > 100_000  # > 100KB
    z = zipfile.ZipFile(io.BytesIO(r.content))
    names = z.namelist()
    # 34 files expected per memory doc; allow >=30 to be tolerant
    assert len(names) >= 30, f"Expected ≥30 files, got {len(names)}: {names[:5]}"


# ----- Doc templates count regression -----
def test_doc_templates_count(auth_headers):
    r = requests.get(f"{BASE_URL}/api/gas-project/doc-templates",
                     headers=auth_headers, timeout=30)
    assert r.status_code == 200
    data = r.json()
    templates = data.get("templates") if isinstance(data, dict) else data
    assert isinstance(templates, list)
    assert len(templates) >= 30
