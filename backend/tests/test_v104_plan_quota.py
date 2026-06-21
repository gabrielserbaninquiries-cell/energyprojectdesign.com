"""V10.4 — Plan + Quota + Capability tests.
Covers: GET /api/me/plan, project quota enforcement,
doc generation quota, dossier zip capability gate, SMTP env cleanup.
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
TEMPLATE_ID = "memoriu_tehnic"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    tok = r.json().get("token") or r.json().get("access_token")
    assert tok, f"No token in login response: {r.json()}"
    return tok


@pytest.fixture(scope="module")
def headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- 1. GET /api/me/plan ----------
class TestMePlan:
    def test_me_plan_structure(self, headers):
        r = requests.get(f"{BASE_URL}/api/me/plan", headers=headers, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        # Top-level required keys
        for k in ["plan_id", "plan_name", "documents_per_month", "projects_per_month", "capabilities", "usage"]:
            assert k in data, f"Missing key {k} in /me/plan response"
        # Plan must be one of the owner/internal plans
        assert data["plan_id"] in ("developer", "developer_elite", "society_admin", "cofounder", "inside_full"), \
            f"Unexpected plan_id: {data['plan_id']}"
        # Quotas
        assert data["documents_per_month"] >= 99999, f"Documents quota too low: {data['documents_per_month']}"
        assert data["projects_per_month"] >= 99999, f"Projects quota too low: {data['projects_per_month']}"
        # Capabilities — all true for developer/owner
        caps = data["capabilities"]
        for cap in ["can_generate_docs", "can_certify", "can_dispatch_emails", "can_export",
                    "can_audit", "can_use_stamps", "can_use_ai", "can_offer", "can_accounting", "can_transfer"]:
            assert cap in caps, f"Missing capability {cap}"
            assert caps[cap] is True, f"Capability {cap} expected True for {data['plan_id']}, got {caps[cap]}"
        # Usage
        usage = data["usage"]
        for k in ["projects_this_month", "documents_this_month", "projects_remaining",
                  "projects_pct", "documents_pct"]:
            assert k in usage, f"Missing usage key {k}"
        assert isinstance(usage["projects_this_month"], int)
        assert isinstance(usage["documents_this_month"], int)


# ---------- 2. Project quota — developer should always allow ----------
class TestProjectQuotaDeveloper:
    created_pid = None

    def test_create_project_under_developer_increments_usage(self, headers):
        # baseline
        r0 = requests.get(f"{BASE_URL}/api/me/plan", headers=headers, timeout=30)
        before = r0.json()["usage"]["projects_this_month"]

        payload = {"title": "TEST_V104_quota_check", "subtitle": "auto-cleanup"}
        r = requests.post(f"{BASE_URL}/api/gas-project", headers=headers, json=payload, timeout=30)
        assert r.status_code in (200, 201), f"Create failed: {r.status_code} {r.text}"
        body = r.json()
        new_pid = body.get("project_id") or body.get("pid") or body.get("id")
        assert new_pid, f"No project id in response: {body}"
        TestProjectQuotaDeveloper.created_pid = new_pid

        r1 = requests.get(f"{BASE_URL}/api/me/plan", headers=headers, timeout=30)
        after = r1.json()["usage"]["projects_this_month"]
        assert after == before + 1, f"projects_this_month did not increment: {before}->{after}"

    def test_cleanup_test_project(self, headers):
        pid = TestProjectQuotaDeveloper.created_pid
        if not pid:
            pytest.skip("No project to delete")
        r = requests.delete(f"{BASE_URL}/api/gas-project/{pid}", headers=headers, timeout=30)
        # 200, 204, or 404 (already gone) all acceptable
        assert r.status_code in (200, 204, 404), f"Delete failed: {r.status_code} {r.text}"


# ---------- 3. Doc generation logging + usage increment ----------
class TestDocGenerationQuota:
    def test_doc_generation_increments_log(self, headers):
        r0 = requests.get(f"{BASE_URL}/api/me/plan", headers=headers, timeout=30)
        before = r0.json()["usage"]["documents_this_month"]

        r = requests.get(f"{BASE_URL}/api/gas-project/{PID}/doc/{TEMPLATE_ID}", headers=headers, timeout=60)
        assert r.status_code == 200, f"Doc gen failed: {r.status_code} {r.text[:200]}"
        # DOCX returned
        assert len(r.content) > 1000, "Document content too small"

        r1 = requests.get(f"{BASE_URL}/api/me/plan", headers=headers, timeout=30)
        after = r1.json()["usage"]["documents_this_month"]
        assert after == before + 1, f"documents_this_month did not increment: {before}->{after}"


# ---------- 4. Dossier ZIP capability gate ----------
class TestDossierZip:
    def test_dossier_zip_allowed_for_developer(self, headers):
        r = requests.get(f"{BASE_URL}/api/gas-project/{PID}/dossier.zip", headers=headers, timeout=120)
        assert r.status_code == 200, f"Dossier zip failed: {r.status_code} {r.text[:200]}"
        # Verify it is a valid zip
        z = zipfile.ZipFile(io.BytesIO(r.content))
        names = z.namelist()
        assert len(names) >= 10, f"Dossier zip too small ({len(names)} files)"


# ---------- 5. SMTP env cleanup (no duplicate Gmail keys) ----------
class TestSMTPEnvCleanup:
    def test_env_has_single_gmail_user(self):
        with open("/app/backend/.env", "r") as f:
            lines = [ln for ln in f.read().splitlines() if ln.strip() and not ln.strip().startswith("#")]
        gmail_user_count = sum(1 for ln in lines if ln.startswith("GMAIL_USER="))
        gmail_pass_count = sum(1 for ln in lines if ln.startswith("GMAIL_APP_PASSWORD="))
        assert gmail_user_count == 1, f"Expected 1 GMAIL_USER line, got {gmail_user_count}"
        assert gmail_pass_count == 1, f"Expected 1 GMAIL_APP_PASSWORD line, got {gmail_pass_count}"


# ---------- 6. Unauthorized access ----------
class TestUnauthorized:
    def test_me_plan_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/me/plan", timeout=15)
        assert r.status_code in (401, 403), f"Expected 401/403 without auth, got {r.status_code}"
