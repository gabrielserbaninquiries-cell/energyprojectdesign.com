"""V11.5 — Comprehensive E2E tests for auth, payments (LIVE Stripe URL only), donations,
plans list, me/plan, me/billing, me/menu, company profile, gas-project CRUD, and owner seed.
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
OWNER_EMAIL = "dragosserban95@gmail.com"
OWNER_PASSWORD = "Nuamparola_9"


@pytest.fixture(scope="module")
def http():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(autouse=True)
def _clear_cookies(http):
    """Clear cookies before each test so prior register/login responses don't override Bearer token.
    The backend prefers cookie over Authorization header (auth.py::_extract_token)."""
    http.cookies.clear()
    yield


@pytest.fixture(scope="module")
def owner_token(http):
    # Use a one-off session (no shared cookies) for owner login
    r = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": OWNER_EMAIL,
        "password": OWNER_PASSWORD,
    })
    assert r.status_code == 200, f"owner login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("session_token") or data.get("token") or data.get("access_token")
    assert token, f"no token in login response: {data}"
    return token


@pytest.fixture(scope="module")
def auth_headers(owner_token):
    return {"Authorization": f"Bearer {owner_token}", "Content-Type": "application/json"}


# ---------- Plans ----------
class TestPlans:
    def test_plans_list_returns_11(self, http):
        r = http.get(f"{BASE_URL}/api/plans")
        assert r.status_code == 200
        plans = r.json()
        # may be {"plans": [...]} or list directly
        if isinstance(plans, dict):
            plans = plans.get("plans", plans.get("data", []))
        assert isinstance(plans, list)
        ids = {p.get("plan_id") or p.get("id") for p in plans}
        expected = {"trial", "basic", "operator", "proiectant", "executant",
                    "avize", "ofertare", "contabilitate", "vgd", "rte", "societate"}
        missing = expected - ids
        assert not missing, f"missing plans: {missing}; got: {ids}"
        # Check price for a few
        pmap = {(p.get("plan_id") or p.get("id")): p for p in plans}
        assert pmap["trial"].get("price_eur") in (0, 0.0)
        assert pmap["basic"].get("price_eur") == 29
        assert pmap["proiectant"].get("price_eur") == 129
        assert pmap["societate"].get("price_eur") == 399


# ---------- Auth ----------
class TestAuth:
    def test_owner_login(self, http):
        r = http.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL, "password": OWNER_PASSWORD
        })
        assert r.status_code == 200, r.text
        data = r.json()
        user = data.get("user") or data
        # plan may be on user
        plan = (user.get("plan") if isinstance(user, dict) else None) or data.get("plan")
        assert plan == "society_admin", f"expected society_admin got {plan}; data={data}"

    def test_auth_me_with_token(self, http, auth_headers):
        r = http.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200, r.text
        u = r.json()
        assert u.get("email") == OWNER_EMAIL
        assert u.get("plan") == "society_admin"
        assert u.get("is_admin") is True

    def test_register_missing_gdpr_rejected(self, http):
        # backend should reject when gdpr_consent != true
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = http.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": email,
            "password": "abc123",
            "gdpr_consent": False,
        })
        assert r.status_code in (400, 422), f"expected rejection, got {r.status_code}: {r.text}"
        body = r.text.lower()
        assert "gdpr" in body or "acord" in body, f"error msg missing GDPR mention: {r.text}"

    def test_register_success_with_gdpr(self, http):
        email = f"test_{uuid.uuid4().hex[:10]}@example.com"
        r = http.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": email,
            "password": "abc12345",
            "gdpr_consent": True,
        })
        assert r.status_code in (200, 201), r.text
        data = r.json()
        token = data.get("session_token") or data.get("token")
        assert token, f"no token returned: {data}"
        # verify me works
        me = http.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json().get("email") == email


# NOTE: TestMePlan + TestMeBilling MUST run BEFORE TestPlanCheckout because the
# trial activation mutates owner.plan from society_admin -> trial.

# ---------- me/plan ----------
class TestMePlan:
    def test_owner_plan_capabilities(self, http, auth_headers):
        r = http.get(f"{BASE_URL}/api/me/plan", headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("plan_id") == "society_admin", f"plan: {d.get('plan_id')}"
        caps = d.get("capabilities", {})
        assert caps.get("can_generate_docs") is True
        assert caps.get("can_use_stamps") is True
        assert caps.get("can_export") is True
        dpm = d.get("documents_per_month", caps.get("documents_per_month", 0))
        assert dpm >= 1500, f"doc quota too low: {dpm}"


# ---------- me/billing ----------
class TestMeBilling:
    def test_billing_structure(self, http, auth_headers):
        r = http.get(f"{BASE_URL}/api/me/billing", headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "current_plan" in d
        assert "transactions" in d
        assert "activations" in d
        assert isinstance(d["transactions"], list)
        assert isinstance(d["activations"], list)
        cp = d["current_plan"]
        assert cp.get("plan_id") == "society_admin", f"plan: {cp.get('plan_id')}"


# ---------- Plan checkout MOVED TO END OF FILE ----------


# ---------- Menu ----------
class TestMenu:
    def test_owner_menu_has_cont_dept(self, http, auth_headers):
        r = http.get(f"{BASE_URL}/api/me/menu", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        # could be {departments: [...]} or list
        depts = data.get("departments", data) if isinstance(data, dict) else data
        # search for 'cont' department (exact match — 'contabilitate' is a different dept)
        cont = None
        for d in depts:
            did = d.get("id") or d.get("key") or d.get("name", "").lower()
            if str(did).lower() == "cont":
                cont = d
                break
        assert cont is not None, f"'cont' department missing; got: {[d.get('id') or d.get('name') for d in depts]}"
        pages = cont.get("pages", [])
        paths = {p.get("path") or p.get("url") for p in pages}
        assert "/company" in paths, f"/company missing in {paths}"
        assert "/billing" in paths, f"/billing missing in {paths}"


# ---------- Company profile ----------
class TestCompanyProfile:
    def test_company_profile_save_and_get(self, http, auth_headers):
        payload = {"company_name": "Test Company V115"}
        r = http.put(f"{BASE_URL}/api/company-profile", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        # GET
        r2 = http.get(f"{BASE_URL}/api/company-profile", headers=auth_headers)
        assert r2.status_code == 200
        assert r2.json().get("company_name") == "Test Company V115"


# ---------- Gas project CRUD ----------
class TestGasProject:
    def test_gas_project_create_update_get(self, http, auth_headers):
        # CREATE
        r = http.post(f"{BASE_URL}/api/gas-project", headers=auth_headers, json={
            "title": "E2E V115 Test",
            "country": "RO",
            "subdomain": "bransament-casnic",
            "phase": "tema",
            "data": {"tip_lucrare": "bransament", "beneficiar_nume": "E2E"},
        })
        assert r.status_code == 200, r.text
        pid = r.json().get("pid") or r.json().get("id")
        assert pid

        # UPDATE
        r2 = http.patch(f"{BASE_URL}/api/gas-project/{pid}", headers=auth_headers, json={
            "data": {"beneficiar_nume": "Updated"}
        })
        assert r2.status_code == 200, r2.text

        # GET
        r3 = http.get(f"{BASE_URL}/api/gas-project/{pid}", headers=auth_headers)
        assert r3.status_code == 200
        body = r3.json()
        # data may be nested in project.data
        data_field = body.get("data") or body.get("project", {}).get("data") or {}
        assert data_field.get("beneficiar_nume") == "Updated", f"persistence failed: {body}"


# ---------- me/plan (moved up) ----------
# ---------- me/billing (moved up) ----------


# ====== Mutating endpoints below (run last; trial activation mutates owner plan) ======

class TestPlanCheckout:
    """LIVE Stripe URL verification — trial activation MUTATES owner.plan to 'trial'."""

    @pytest.mark.parametrize("plan_id", ["basic", "proiectant", "societate", "avize"])
    def test_paid_plan_returns_live_stripe_url(self, http, auth_headers, plan_id):
        r = http.post(f"{BASE_URL}/api/payments/checkout", headers=auth_headers,
                      json={"plan_id": plan_id, "origin_url": "https://www.energyprojectdesign.com"})
        assert r.status_code == 200, f"{plan_id}: {r.status_code} {r.text}"
        d = r.json()
        url = d.get("url") or d.get("checkout_url")
        sid = d.get("session_id") or d.get("sessionId")
        assert url, f"{plan_id}: no url in response: {d}"
        assert "checkout.stripe.com" in url, f"{plan_id}: not a stripe url: {url}"
        assert "cs_live_" in url or (sid and sid.startswith("cs_live_")), \
            f"{plan_id}: not LIVE mode (url={url}, sid={sid})"

    def test_trial_free_activation(self, http, auth_headers):
        """Runs LAST in this class — will mutate owner.plan → trial."""
        r = http.post(f"{BASE_URL}/api/payments/checkout", headers=auth_headers,
                      json={"plan_id": "trial", "origin_url": "https://www.energyprojectdesign.com"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("free_activated") is True or d.get("url") in (None, "")


class TestDonations:
    def test_donation_ron_live(self, http):
        r = http.post(f"{BASE_URL}/api/donations/checkout", json={
            "amount": 10, "currency": "ron",
            "donor_name": "Test", "donor_email": "test@example.com",
            "origin_url": BASE_URL,
        })
        assert r.status_code == 200, r.text
        d = r.json()
        url = d.get("url") or d.get("checkout_url")
        assert url and "checkout.stripe.com" in url
        sid = d.get("session_id") or ""
        assert "cs_live_" in url or sid.startswith("cs_live_"), f"not LIVE: {d}"

    def test_donation_eur_live(self, http):
        r = http.post(f"{BASE_URL}/api/donations/checkout", json={
            "amount": 5, "currency": "eur",
            "donor_name": "Test", "donor_email": "test@example.com",
            "origin_url": BASE_URL,
        })
        assert r.status_code == 200, r.text
        d = r.json()
        url = d.get("url") or d.get("checkout_url")
        assert url and "checkout.stripe.com" in url
        sid = d.get("session_id") or ""
        assert "cs_live_" in url or sid.startswith("cs_live_"), f"not LIVE: {d}"

    def test_donation_min_amount_ron_rejected(self, http):
        r = http.post(f"{BASE_URL}/api/donations/checkout", json={
            "amount": 1, "currency": "ron",
            "donor_name": "Test", "donor_email": "test@example.com",
            "origin_url": BASE_URL,
        })
        assert r.status_code == 400, r.text
        assert "min" in r.text.lower() or "2 ron" in r.text.lower() or "suma" in r.text.lower()
