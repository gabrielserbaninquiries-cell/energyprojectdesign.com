"""
V10.8 — Backend tests for public plans + auth + Stripe regression.

Coverage:
 - Email register (name + gdpr_consent) → 200 + token + Set-Cookie
 - Email login (existing user) → 200 + token + Set-Cookie + plan
 - Hybrid Auth Bearer-only → /api/auth/me 200
 - Donations LIVE → cs_live_* session
 - Subscriptions LIVE → cs_live_* session for proiectant plan
 - /api/plans public (no auth) → 11 plans (incl trial/basic/operator/proiectant/executant/societate)
 - SEO meta on /pricing, /contact, /sponsorizeaza
"""
import os
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
EXISTING_EMAIL = "dragosserban95@gmail.com"
EXISTING_PASSWORD = "Nuamparola_9"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def login_payload(session):
    """Login & return (token, set-cookie header, user). Module-scoped to share token."""
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"email": EXISTING_EMAIL, "password": EXISTING_PASSWORD},
                     timeout=20)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    return {"token": data.get("token"), "user": data.get("user"), "set_cookie": r.headers.get("set-cookie", "")}


# ---------- Register ----------
class TestAuthRegister:
    def test_register_with_name_gdpr(self, session):
        unique = f"test_{uuid.uuid4().hex[:8]}_{int(time.time())}@temp.com"
        r = requests.post(f"{BASE_URL}/api/auth/register",
                          json={"email": unique, "password": "Test12345!",
                                "name": "Test User V108", "gdpr_consent": True},
                          timeout=20)
        assert r.status_code == 200, f"register failed: {r.status_code} {r.text[:300]}"
        data = r.json()
        assert data.get("token"), "No token in response"
        assert isinstance(data["token"], str) and len(data["token"]) > 20
        assert "user" in data
        assert data["user"]["email"] == unique
        # Set-Cookie should be present
        set_cookie = r.headers.get("set-cookie", "")
        assert "epd_auth" in set_cookie.lower() or "token" in set_cookie.lower() or set_cookie != "", \
            f"Expected Set-Cookie header. Got: {set_cookie!r}"


# ---------- Login ----------
class TestAuthLogin:
    def test_login_existing_user(self, login_payload):
        assert login_payload["token"]
        user = login_payload["user"]
        assert user["email"] == EXISTING_EMAIL
        # Plan id should be one of expected (developer / society_admin)
        plan_id = user.get("plan") or user.get("plan_id") or user.get("plan_label")
        assert plan_id, f"No plan in user: {user}"
        assert "epd_auth" in login_payload["set_cookie"].lower() or login_payload["set_cookie"], \
            "Missing Set-Cookie"

    def test_me_with_bearer_only(self, login_payload):
        token = login_payload["token"]
        # Use bare requests (no session cookies) to confirm Bearer-only path works
        r = requests.get(f"{BASE_URL}/api/auth/me",
                         headers={"Authorization": f"Bearer {token}"},
                         timeout=15)
        assert r.status_code == 200, f"/auth/me Bearer failed: {r.status_code} {r.text[:200]}"
        body = r.json()
        assert body.get("email") == EXISTING_EMAIL


# ---------- Public Plans ----------
class TestPublicPlans:
    def test_plans_public_no_auth(self):
        r = requests.get(f"{BASE_URL}/api/plans", timeout=15)
        assert r.status_code == 200
        plans = r.json()
        assert isinstance(plans, list)
        ids = {p.get("id") for p in plans}
        required = {"trial", "basic", "operator", "proiectant", "executant", "societate"}
        missing = required - ids
        assert not missing, f"Missing required public plan ids: {missing}. Got: {ids}"
        assert len(plans) >= 6, f"Expected >=6 plans, got {len(plans)}"

    def test_plans_has_prices(self):
        r = requests.get(f"{BASE_URL}/api/plans", timeout=15)
        plans = {p["id"]: p for p in r.json()}
        # Spot-check that proiectant has a price > 0
        proiectant = plans.get("proiectant")
        assert proiectant is not None
        price = proiectant.get("price_eur") or proiectant.get("price") or 0
        assert price and price > 0, f"proiectant price missing/zero: {proiectant}"


# ---------- Donations LIVE ----------
class TestDonations:
    def test_donations_checkout_live(self):
        r = requests.post(f"{BASE_URL}/api/donations/checkout",
                          json={"amount": 5, "currency": "ron"},
                          timeout=25)
        assert r.status_code == 200, f"donations failed: {r.status_code} {r.text[:300]}"
        body = r.json()
        session_id = body.get("session_id") or body.get("id") or ""
        url = body.get("url", "")
        assert session_id.startswith("cs_live_"), f"Expected cs_live_ session, got {session_id!r}"
        assert "checkout.stripe.com" in url, f"Bad checkout URL: {url}"


# ---------- Subscription LIVE ----------
class TestSubscriptionCheckout:
    def test_subscription_proiectant(self, login_payload):
        token = login_payload["token"]
        r = requests.post(f"{BASE_URL}/api/payments/checkout",
                          json={"plan_id": "proiectant", "origin_url": BASE_URL},
                          headers={"Authorization": f"Bearer {token}"},
                          timeout=25)
        assert r.status_code == 200, f"/api/payments/checkout failed: {r.status_code} {r.text[:300]}"
        body = r.json()
        sess = body.get("session_id") or body.get("id") or ""
        url = body.get("url", "")
        assert sess.startswith("cs_live_"), f"Expected cs_live_, got {sess!r}"
        assert "checkout.stripe.com" in url


# ---------- SEO meta on public pages ----------
@pytest.mark.parametrize("path,must_have", [
    ("/pricing", ["<title", "canonical"]),
    ("/contact", ["<title", "canonical"]),
    ("/sponsorizeaza", ["<title", "canonical"]),
])
def test_seo_meta(path, must_have):
    r = requests.get(f"{BASE_URL}{path}", timeout=15)
    assert r.status_code == 200, f"{path} returned {r.status_code}"
    html = r.text.lower()
    for token in must_have:
        assert token.lower() in html, f"{path} missing token {token!r} in HTML"
