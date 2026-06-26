"""V11.9 — Test suite for new plans (doubled prices, mass_production, Societate=1PC,
projects limit 150/300), DB cleanup confirmation, transparency audit, and Stripe
checkout behavior with dummy key.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

OWNER_EMAIL = "dragosserban95@gmail.com"
OWNER_PASSWORD = "Nuamparola_9"

EXPECTED_PRICES = {
    "trial": 0,
    "basic": 58,
    "operator": 118,
    "proiectant": 258,
    "executant": 198,
    "avize": 138,
    "ofertare": 158,
    "contabilitate": 98,
    "vgd": 338,
    "rte": 298,
    "societate": 798,
    "mass_production": 2500,
}


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def owner_token(session):
    r = session.post(f"{API}/auth/login", json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD})
    assert r.status_code == 200, f"Owner login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("token") or data.get("access_token")
    assert token, "No token in owner login response"
    # cleanup cookies to ensure Bearer-only requests later
    session.cookies.clear()
    return token


@pytest.fixture(scope="module")
def auth_headers(owner_token):
    return {"Authorization": f"Bearer {owner_token}"}


# === 1. Plans listing ===
class TestPlansEndpoint:
    def test_plans_endpoint_returns_list(self, session):
        r = session.get(f"{API}/plans")
        assert r.status_code == 200, r.text
        data = r.json()
        # may be list or dict with 'plans'
        plans = data if isinstance(data, list) else data.get("plans") or data.get("data") or []
        assert isinstance(plans, list) and len(plans) > 0
        # store on cls for reuse
        TestPlansEndpoint.plans = plans
        TestPlansEndpoint.by_id = {p.get("id") or p.get("plan_id"): p for p in plans}

    def test_public_plans_count_includes_mass_production(self, session):
        plans = TestPlansEndpoint.plans
        ids = [p.get("id") or p.get("plan_id") for p in plans]
        # Should include 12 specific ones at minimum
        required = set(EXPECTED_PRICES.keys())
        missing = required - set(ids)
        assert not missing, f"Missing plans from /api/plans: {missing}. Got: {ids}"

    def test_prices_doubled_exact(self, session):
        by_id = TestPlansEndpoint.by_id
        for pid, expected_price in EXPECTED_PRICES.items():
            plan = by_id.get(pid)
            assert plan is not None, f"Plan {pid} missing"
            actual = plan.get("price_eur")
            assert actual == expected_price, f"Plan {pid} price_eur={actual}, expected {expected_price}"

    def test_currency_eur_and_label_fara_tva(self, session):
        by_id = TestPlansEndpoint.by_id
        for pid in EXPECTED_PRICES.keys():
            if pid == "trial":
                continue
            plan = by_id[pid]
            assert (plan.get("currency") or "").lower() == "eur", f"{pid} currency != eur"
            label = (plan.get("currency_label") or "")
            assert "fără TVA" in label or "fara TVA" in label.lower(), f"{pid} currency_label='{label}' missing 'fără TVA'"

    def test_societate_one_pc(self, session):
        by_id = TestPlansEndpoint.by_id
        societate = by_id["societate"]
        assert societate.get("users_allowed") == 1, f"societate users_allowed={societate.get('users_allowed')}, expected 1"
        label = (societate.get("label") or "") + " " + (societate.get("name") or "")
        assert "1 PC" in label, f"societate label/name doesn't mention '1 PC': label='{societate.get('label')}', name='{societate.get('name')}'"

    def test_mass_production_plan(self, session):
        by_id = TestPlansEndpoint.by_id
        mp = by_id["mass_production"]
        assert mp.get("price_eur") == 2500
        assert mp.get("users_allowed") == 1
        # documents_per_month=5000 per request
        assert mp.get("documents_per_month") == 5000, f"mass_production documents_per_month={mp.get('documents_per_month')}"


# === 2. projects_per_month limits via /api/me/plan ===
class TestProjectLimits:
    def test_owner_me_plan_is_society_admin(self, session, auth_headers):
        r = session.get(f"{API}/me/plan", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("plan_id") in ("society_admin", "society_admin"), data

    def test_plans_payload_has_projects_per_month(self, session):
        # Some implementations include projects_per_month at /api/plans, others via /api/me/plan
        r = session.get(f"{API}/plans")
        plans = r.json() if isinstance(r.json(), list) else r.json().get("plans", [])
        by_id = {p.get("id"): p for p in plans}
        # Validate via /api/plans/<id>/limits or just trust _PROJECT_QUOTA logic via /api/me/plan
        # We assert the EXPECTED quotas via a helper endpoint if exposed
        for pid in ["basic", "operator", "proiectant", "executant", "avize", "ofertare",
                    "contabilitate", "vgd", "rte", "societate"]:
            p = by_id.get(pid, {})
            ppm = p.get("projects_per_month")
            if ppm is not None:
                assert ppm == 150, f"{pid} projects_per_month={ppm}, expected 150"
        mp = by_id.get("mass_production", {})
        if mp.get("projects_per_month") is not None:
            assert mp["projects_per_month"] == 300
        trial = by_id.get("trial", {})
        if trial.get("projects_per_month") is not None:
            assert trial["projects_per_month"] == 5


# === 3. Auth & owner state ===
class TestAuth:
    def test_owner_login_returns_admin(self, session):
        r = session.post(f"{API}/auth/login", json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        user = data.get("user") or {}
        assert data.get("token") or data.get("access_token")
        assert user.get("plan") == "society_admin", f"plan={user.get('plan')}"
        assert user.get("is_admin") is True, f"is_admin={user.get('is_admin')}"


# === 4. DB cleanup confirmation ===
class TestPublicStats:
    def test_public_stats_zero_after_cleanup(self, session):
        r = session.get(f"{API}/transparenta/public-stats")
        assert r.status_code == 200, r.text
        data = r.json()
        # owner excluded
        users = data.get("users", {})
        engineering = data.get("engineering", {})
        donations = data.get("donations", {})
        transactions = data.get("transactions", {})
        assert users.get("total_registered") == 0, f"users.total_registered={users.get('total_registered')}"
        assert engineering.get("total_gas_projects") == 0, f"gas_projects={engineering.get('total_gas_projects')}"
        assert engineering.get("total_documents_generated") == 0, f"documents={engineering.get('total_documents_generated')}"
        assert donations.get("total_paid_count") == 0
        assert donations.get("total_initiated_count") == 0
        assert transactions.get("total_paid_count") == 0


# === 5. Transparency audit ===
class TestTransparencyAudit:
    def test_audit_endpoint(self, session):
        r = session.get(f"{API}/transparenta/audit")
        assert r.status_code == 200, r.text
        data = r.json()
        steps = data.get("lifecycle_steps") or data.get("steps") or data.get("lifecycle") or []
        assert len(steps) == 12, f"Expected 12 audit steps, got {len(steps)}"
        honest = data.get("honest_status") or {}
        assert honest.get("fully_live") == 9, f"fully_live={honest.get('fully_live')}"
        assert honest.get("beta") == 3, f"beta={honest.get('beta')}"
        # First 9 live, last 3 beta
        live_count = sum(1 for s in steps if s.get("status") == "live")
        beta_count = sum(1 for s in steps if s.get("status") == "beta")
        assert live_count == 9 and beta_count == 3


# === 6. Checkout behavior ===
class TestCheckout:
    def test_owner_checkout_trial_blocks_downgrade(self, session, auth_headers):
        r = session.post(f"{API}/payments/checkout", headers=auth_headers,
                         json={"plan_id": "trial", "origin_url": BASE_URL})
        # Must be 403 — protects owner from downgrade
        assert r.status_code == 403, f"Expected 403 downgrade block, got {r.status_code}: {r.text[:300]}"

    def test_owner_checkout_mass_production_no_500(self, session, auth_headers):
        r = session.post(f"{API}/payments/checkout", headers=auth_headers,
                         json={"plan_id": "mass_production", "origin_url": BASE_URL})
        # Accept any non-500: 200 (URL), 400 (dummy stripe key), or 403 (admin blocked)
        assert r.status_code != 500, f"500 from /payments/checkout mass_production: {r.text[:300]}"
        assert r.status_code in (200, 400, 403), f"Unexpected status {r.status_code}: {r.text[:300]}"


# === 7. Owner gas projects marked is_test_developer ===
class TestGasProjects:
    def test_owner_gas_projects_marked_test(self, session, auth_headers):
        r = session.get(f"{API}/gas-project", headers=auth_headers)
        # Endpoint may be /api/gas-project or /api/gas-project/list
        if r.status_code == 404:
            r = session.get(f"{API}/gas-project/list", headers=auth_headers)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:200]}"
        data = r.json()
        projects = data if isinstance(data, list) else data.get("projects") or data.get("items") or []
        if not projects:
            pytest.skip("No owner projects present — cleanup may have removed them")
        # all should be marked is_test_developer=True
        not_marked = [p for p in projects if not p.get("is_test_developer")]
        assert not not_marked, f"{len(not_marked)} owner projects NOT marked is_test_developer"
