"""V12.0 — Verificator workflow + new plans (OSD 999999, VGD/RTE 1000) + registration/checkout/donations tests."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

OWNER_EMAIL = "dragosserban95@gmail.com"
OWNER_PASS = "Nuamparola_9"


@pytest.fixture(scope="session")
def owner_token():
    r = requests.post(f"{API}/auth/login", json={"email": OWNER_EMAIL, "password": OWNER_PASS}, timeout=30)
    assert r.status_code == 200, f"Owner login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def random_user():
    ts = int(time.time())
    email = f"test_v120_{ts}_{uuid.uuid4().hex[:6]}@example.com"
    pw = "TestPass_123!"
    r = requests.post(f"{API}/auth/register", json={
        "email": email, "password": pw, "name": "V120 Tester", "gdpr_consent": True
    }, timeout=30)
    assert r.status_code in (200, 201), f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    return {"email": email, "password": pw, "token": data["token"]}


# ============ PLANS ============
class TestPlans:
    def test_plans_count_and_includes_new_ones(self):
        r = requests.get(f"{API}/plans", timeout=30)
        assert r.status_code == 200
        body = r.json()
        plans = body.get("plans") if isinstance(body, dict) else body
        assert isinstance(plans, list)
        ids = {p["id"] for p in plans}
        assert "osd" in ids, f"Missing osd: {ids}"
        assert "vgd" in ids and "rte" in ids
        assert "mass_production" in ids and "societate" in ids
        by_id = {p["id"]: p for p in plans}
        assert by_id["osd"]["price_eur"] == 999999, by_id["osd"]
        assert by_id["vgd"]["price_eur"] == 1000
        assert by_id["rte"]["price_eur"] == 1000
        assert by_id["mass_production"]["price_eur"] == 2500
        assert by_id["societate"]["price_eur"] == 798
        # Documents per month
        assert "documents_per_month" in by_id["osd"]
        # 13 public plans
        assert len(plans) >= 13, f"Expected >=13 public plans, got {len(plans)}: {ids}"


# ============ ME/PLAN limits ============
class TestMePlan:
    def test_owner_society_admin_limits(self, owner_token):
        r = requests.get(f"{API}/me/plan", headers={"Authorization": f"Bearer {owner_token}"}, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["plan_id"] == "society_admin"

    def test_basic_user_limits(self, random_user):
        r = requests.get(f"{API}/me/plan", headers={"Authorization": f"Bearer {random_user['token']}"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        # New users default to basic per plans.py
        assert data["plan_id"] == "basic"
        assert data["projects_per_month"] == 150


# ============ AUTH register/login ============
class TestAuth:
    def test_register_login_me(self):
        ts = int(time.time())
        email = f"test_v120_login_{ts}@example.com"
        pw = "TestPass_123!"
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": pw, "name": "Login Tester", "gdpr_consent": True
        }, timeout=30)
        assert r.status_code in (200, 201), r.text
        tok = r.json()["token"]
        # Login
        r2 = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=30)
        assert r2.status_code == 200, r2.text
        assert r2.json().get("token")
        # /me
        r3 = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {tok}"}, timeout=30)
        assert r3.status_code == 200
        assert r3.json().get("email") == email

    def test_register_without_gdpr_fails(self):
        ts = int(time.time())
        email = f"test_v120_nogdpr_{ts}@example.com"
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": "TestPass_123!", "name": "No GDPR"
        }, timeout=30)
        assert r.status_code in (400, 422), f"Expected 400/422, got {r.status_code}: {r.text}"


# ============ STRIPE checkout ============
class TestCheckout:
    def test_checkout_basic(self, random_user):
        r = requests.post(f"{API}/payments/checkout",
            headers={"Authorization": f"Bearer {random_user['token']}"},
            json={"plan_id": "basic", "origin_url": BASE_URL}, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        url = data.get("url") or data.get("checkout_url")
        assert url and "cs_live_" in url, f"Expected cs_live_ URL, got: {data}"

    def test_checkout_vgd_1000eur(self, random_user):
        r = requests.post(f"{API}/payments/checkout",
            headers={"Authorization": f"Bearer {random_user['token']}"},
            json={"plan_id": "vgd", "origin_url": BASE_URL}, timeout=60)
        assert r.status_code == 200, r.text
        url = r.json().get("url") or r.json().get("checkout_url")
        assert url and "cs_live_" in url

    def test_checkout_trial_free_activation(self, random_user):
        r = requests.post(f"{API}/payments/checkout",
            headers={"Authorization": f"Bearer {random_user['token']}"},
            json={"plan_id": "trial", "origin_url": BASE_URL}, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        # Trial = 0 EUR → must not create stripe session, free_activated true
        assert data.get("free_activated") is True or data.get("free") is True, f"Expected free activation: {data}"


# ============ DONATIONS ============
class TestDonations:
    def test_donate_10_ron(self):
        r = requests.post(f"{API}/donations/checkout",
            json={"amount": 10, "currency": "ron", "origin_url": BASE_URL}, timeout=60)
        assert r.status_code == 200, r.text
        url = r.json().get("url") or r.json().get("checkout_url")
        assert url and "cs_live_" in url

    def test_donate_5_eur(self):
        r = requests.post(f"{API}/donations/checkout",
            json={"amount": 5, "currency": "eur", "origin_url": BASE_URL}, timeout=60)
        assert r.status_code == 200, r.text
        url = r.json().get("url") or r.json().get("checkout_url")
        assert url and "cs_live_" in url

    def test_donate_too_small_fails(self):
        r = requests.post(f"{API}/donations/checkout",
            json={"amount": 0.5, "currency": "ron", "origin_url": BASE_URL}, timeout=30)
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"


# ============ VERIFICATOR INBOX/LEDGER access control ============
class TestVerificatorAccess:
    def test_inbox_owner_access(self, owner_token):
        r = requests.get(f"{API}/verificator/inbox",
            headers={"Authorization": f"Bearer {owner_token}"}, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "items" in data and "total" in data

    def test_inbox_basic_user_forbidden(self, random_user):
        r = requests.get(f"{API}/verificator/inbox",
            headers={"Authorization": f"Bearer {random_user['token']}"}, timeout=30)
        assert r.status_code == 403, f"Expected 403, got {r.status_code}: {r.text}"

    def test_ledger_owner_access(self, owner_token):
        r = requests.get(f"{API}/verificator/ledger",
            headers={"Authorization": f"Bearer {owner_token}"}, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "groups" in data and "total_societies" in data


# ============ VERIFICATOR SUBMIT/DECIDE end-to-end ============
class TestVerificatorWorkflow:
    @pytest.fixture(scope="class")
    def project_pid(self, owner_token):
        r = requests.post(f"{API}/gas-project",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"title": "TEST V120 verif", "country": "RO", "subdomain": "bransament-casnic", "phase": "tema", "data": {}},
            timeout=30)
        assert r.status_code in (200, 201), r.text
        body = r.json()
        pid = body.get("pid") or (body.get("project") or {}).get("pid")
        assert pid
        return pid

    @pytest.fixture(scope="class")
    def vgd_creds(self):
        # Use pre-created VGD user from credentials
        email = "vgd_test_1782441873@example.com"
        pw = "VGDPass_123!"
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=30)
        if r.status_code != 200:
            pytest.skip(f"VGD test user not available: {r.status_code} {r.text}")
        return {"email": email, "token": r.json()["token"]}

    def test_submit_to_inexistent_verifier_404(self, owner_token, project_pid):
        r = requests.post(f"{API}/verificator/projects/{project_pid}/submit",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"verifier_email": "nobody_xyz_does_not_exist@example.com", "role": "vgd", "note": "test"},
            timeout=30)
        assert r.status_code == 404

    def test_submit_to_non_vgd_user_400(self, owner_token, project_pid, random_user):
        r = requests.post(f"{API}/verificator/projects/{project_pid}/submit",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"verifier_email": random_user["email"], "role": "vgd", "note": "test"},
            timeout=30)
        assert r.status_code == 400, r.text

    def test_submit_and_decide_full_flow(self, owner_token, project_pid, vgd_creds):
        # Submit
        r = requests.post(f"{API}/verificator/projects/{project_pid}/submit",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"verifier_email": vgd_creds["email"], "role": "vgd", "note": "Te rog verifică"},
            timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("ok") is True
        vs = body.get("verification_state") or {}
        assert vs.get("status") == "pending"
        assert vs.get("verifier_email") == vgd_creds["email"]

        # VGD inbox should contain it
        r2 = requests.get(f"{API}/verificator/inbox",
            headers={"Authorization": f"Bearer {vgd_creds['token']}"}, timeout=30)
        assert r2.status_code == 200, r2.text
        items = r2.json().get("items", [])
        pids = [i.get("pid") for i in items]
        assert project_pid in pids, f"PID {project_pid} not in VGD inbox: {pids}"

        # Decide approved
        r3 = requests.post(f"{API}/verificator/projects/{project_pid}/decide",
            headers={"Authorization": f"Bearer {vgd_creds['token']}"},
            json={"decision": "approved", "observations": "OK conform NTPE 2018"},
            timeout=30)
        assert r3.status_code == 200, r3.text
        dec = r3.json()
        assert dec.get("status") == "approved"
        dhash = dec.get("decision_hash")
        assert isinstance(dhash, str) and len(dhash) == 64
        assert "qes" in (dec.get("qes_note") or "").lower()

        # Ledger groups
        r4 = requests.get(f"{API}/verificator/ledger",
            headers={"Authorization": f"Bearer {vgd_creds['token']}"}, timeout=30)
        assert r4.status_code == 200, r4.text
        groups = r4.json().get("groups", [])
        owner_group = next((g for g in groups if g.get("submitter_email") == OWNER_EMAIL), None)
        assert owner_group, f"No group for owner in ledger: {groups}"
        assert owner_group["counts"]["approved"] >= 1
