"""V13.0 full validation — SEO endpoints, unified /auth flow, plans, Stripe, donations, admin, gaze-naturale public."""
import os
import time
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE, "REACT_APP_BACKEND_URL must be set"

OWNER_EMAIL = "dragosserban95@gmail.com"
OWNER_PASSWORD = "Nuamparola_9"


@pytest.fixture(scope="session")
def owner_token():
    r = requests.post(f"{BASE}/api/auth/login", json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"owner login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["token"]
    return data["token"]


@pytest.fixture(scope="session")
def new_user():
    """Create a fresh user for register+login tests."""
    ts = int(time.time())
    email = f"test_v130_{ts}@example.com"
    payload = {
        "email": email,
        "password": "TestPass_123!",
        "name": "V130 Test User",
        "gdpr_consent": True,
    }
    r = requests.post(f"{BASE}/api/auth/register", json=payload, timeout=20)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    data = r.json()
    return {"email": email, "password": payload["password"], "token": data["token"], "user": data["user"]}


# ==================== SEO ====================
class TestSEO:
    def test_robots_txt(self):
        r = requests.get(f"{BASE}/robots.txt", timeout=15)
        assert r.status_code == 200
        assert "text/plain" in r.headers.get("content-type", "")
        body = r.text
        assert "User-agent:" in body
        assert "Sitemap:" in body
        # AI crawlers whitelisted (allowed) — see robots.txt content
        for bot in ("GPTBot", "ClaudeBot", "Google-Extended"):
            assert bot in body, f"missing AI bot: {bot}"

    def test_sitemap_xml(self):
        r = requests.get(f"{BASE}/sitemap.xml", timeout=15)
        assert r.status_code == 200
        assert "<urlset" in r.text
        assert r.text.count("<url>") > 10
        # hreflang references (multilingual)
        assert r.text.count("hreflang=") >= 10

    def test_sitemap_industries(self):
        r = requests.get(f"{BASE}/sitemap-industries.xml", timeout=15)
        assert r.status_code == 200
        assert "<urlset" in r.text or "<sitemapindex" in r.text

    def test_sitemap_images(self):
        r = requests.get(f"{BASE}/sitemap-images.xml", timeout=15)
        assert r.status_code == 200
        assert "<urlset" in r.text


# ==================== AUTH ====================
class TestAuth:
    def test_login_owner(self, owner_token):
        assert owner_token
        r = requests.get(f"{BASE}/api/auth/me", headers={"Authorization": f"Bearer {owner_token}"}, timeout=15)
        assert r.status_code == 200
        u = r.json()
        assert u["email"] == OWNER_EMAIL
        assert u.get("is_developer") is True or u.get("is_admin") is True

    def test_login_invalid(self):
        r = requests.post(f"{BASE}/api/auth/login", json={"email": OWNER_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_register_and_login(self, new_user):
        # Login with the fresh user
        r = requests.post(f"{BASE}/api/auth/login", json={"email": new_user["email"], "password": new_user["password"]}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["email"] == new_user["email"]
        assert data["token"]

    def test_register_gdpr_required(self):
        ts = int(time.time())
        r = requests.post(f"{BASE}/api/auth/register", json={
            "email": f"test_v130_nogdpr_{ts}@example.com",
            "password": "TestPass_123!",
            "name": "NoGDPR",
            "gdpr_consent": False,
        }, timeout=15)
        assert r.status_code in (400, 422), f"expected 400/422, got {r.status_code}"


# ==================== FRONTEND HTML ROUTES ====================
class TestFrontendRoutes:
    def test_auth_page_loads(self):
        r = requests.get(f"{BASE}/auth", timeout=15)
        assert r.status_code == 200

    def test_login_route_returns_200(self):
        r = requests.get(f"{BASE}/login", timeout=15)
        assert r.status_code == 200  # SPA — React handles redirect client-side

    def test_register_route_returns_200(self):
        r = requests.get(f"{BASE}/register", timeout=15)
        assert r.status_code == 200

    def test_gaze_naturale_public(self):
        r = requests.get(f"{BASE}/gaze-naturale", timeout=15)
        assert r.status_code == 200


# ==================== PLANS ====================
class TestPlans:
    def test_plans_list(self):
        r = requests.get(f"{BASE}/api/plans", timeout=15)
        assert r.status_code == 200
        plans = r.json()
        # Expect list or dict
        if isinstance(plans, dict):
            plans_list = plans.get("plans") or list(plans.values())
        else:
            plans_list = plans
        assert isinstance(plans_list, list)
        assert len(plans_list) >= 10, f"expected 10+ plans, got {len(plans_list)}"
        ids = {p.get("id") for p in plans_list}
        # Look for critical plan ids from the request
        expected_any = {"basic", "operator", "vgd", "rte"}
        matched = expected_any & ids
        assert len(matched) >= 3, f"missing expected plans (any of {expected_any}), got ids: {ids}"


# ==================== STRIPE CHECKOUT ====================
class TestStripe:
    def test_checkout_create_session(self, owner_token):
        # Try a paid plan (basic) — should return a Stripe URL
        r = requests.post(
            f"{BASE}/api/payments/checkout",
            headers={"Authorization": f"Bearer {owner_token}", "Content-Type": "application/json"},
            json={"plan_id": "basic", "origin_url": BASE},
            timeout=30,
        )
        # Owner is society_admin — plan change may be blocked. Accept 200 or 403.
        if r.status_code == 403:
            pytest.skip(f"Owner cannot downgrade; skipping: {r.text}")
        assert r.status_code == 200, f"checkout failed: {r.status_code} {r.text}"
        data = r.json()
        # Free plans return url without session_id (session_id: null); paid plans return real Stripe URL
        assert "url" in data
        if not data.get("free_activated"):
            assert data["url"].startswith("https://checkout.stripe.com/"), f"unexpected url: {data['url']}"
            assert data.get("session_id", "").startswith("cs_")

    def test_donations_checkout_5_eur(self):
        r = requests.post(f"{BASE}/api/donations/checkout", json={
            "amount": 5.0, "currency": "eur", "donor_name": "Test V130",
            "origin_url": BASE,
        }, timeout=30)
        assert r.status_code == 200, f"donation failed: {r.status_code} {r.text}"
        data = r.json()
        assert data["url"].startswith("https://checkout.stripe.com/")
        assert data["session_id"].startswith("cs_")

    def test_donations_min_amount(self):
        r = requests.post(f"{BASE}/api/donations/checkout", json={
            "amount": 0.5, "currency": "eur",
        }, timeout=15)
        assert r.status_code == 400


# ==================== ADMIN ====================
class TestAdmin:
    def test_admin_users_owner(self, owner_token):
        r = requests.get(f"{BASE}/api/admin/users", headers={"Authorization": f"Bearer {owner_token}"}, timeout=15)
        assert r.status_code == 200, f"admin/users failed: {r.status_code} {r.text}"
        data = r.json()
        users = data.get("users", data) if isinstance(data, dict) else data
        assert isinstance(users, list)
        assert len(users) >= 1
        # Owner should be among them
        emails = [u.get("email") for u in users]
        assert OWNER_EMAIL in emails

    def test_admin_users_forbidden_for_new_user(self, new_user):
        r = requests.get(f"{BASE}/api/admin/users", headers={"Authorization": f"Bearer {new_user['token']}"}, timeout=15)
        assert r.status_code == 403


# ==================== ME/PLAN ====================
class TestMePlan:
    def test_me_plan_owner(self, owner_token):
        r = requests.get(f"{BASE}/api/me/plan", headers={"Authorization": f"Bearer {owner_token}"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "plan_id" in data or "plan" in data or "projects_per_month" in data
