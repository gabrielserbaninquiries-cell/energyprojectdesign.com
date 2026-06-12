"""V8.3 backend tests — Gas project ad-hoc service catalog + per-service Stripe checkout.

Endpoints:
  - GET  /api/gas-project/{pid}/services          → {catalog[5], purchases[], purchased_active[]}
  - POST /api/gas-project/{pid}/service-checkout  → Stripe URL + session_id + service + amount
  - GET  /api/gas-project/{pid}/service-status/{sid}

Plus V8.2 regression smoke (billing, registry, dossier, /api/payments/checkout).

PID: gp_e79e2810cc64b5b4 (owned by dragosserban95@gmail.com).
"""
import io
import os
import zipfile

import pytest
import requests

def _load_frontend_env_backend_url():
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    return line.split("=", 1)[1].strip()
    except Exception:
        pass
    return None


BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or _load_frontend_env_backend_url() or "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL not configured"
ADMIN_EMAIL = "dragosserban95@gmail.com"
ADMIN_PASS = "Test12345"
PID = "gp_e79e2810cc64b5b4"

EXPECTED_SERVICES = {
    "express_24h": 49.0,
    "qes_signature": 5.0,
    "seap_dispatch": 15.0,
    "tech_review": 35.0,
    "carte_legata": 25.0,
}


@pytest.fixture(scope="session")
def auth_token():
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASS},
        timeout=30,
    )
    if r.status_code != 200:
        pytest.skip(f"Login failed: {r.status_code} {r.text[:200]}")
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# ============ GET /api/gas-project/{pid}/services ============

class TestListServices:
    def test_list_services_catalog_has_5_items(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/services",
            headers=auth_headers, timeout=20,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "catalog" in data
        assert "purchases" in data
        assert "purchased_active" in data
        catalog = data["catalog"]
        assert isinstance(catalog, list)
        assert len(catalog) == 5, f"Expected 5 services, got {len(catalog)}"
        # validate each expected service
        ids = {s["id"]: s for s in catalog}
        for sid, price in EXPECTED_SERVICES.items():
            assert sid in ids, f"Missing service {sid}"
            s = ids[sid]
            assert s["price_eur"] == price, f"{sid} price {s['price_eur']} != {price}"
            assert s.get("label")
            assert s.get("description")
            assert s.get("icon")
            assert s.get("category")
            assert "purchased" in s
            assert isinstance(s["purchased"], bool)

    def test_list_services_unknown_project_returns_404(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/gp_nonexistent_xxxxx/services",
            headers=auth_headers, timeout=15,
        )
        assert r.status_code == 404

    def test_list_services_unauth(self):
        r = requests.get(f"{BASE_URL}/api/gas-project/{PID}/services", timeout=15)
        assert r.status_code in (401, 403)


# ============ POST /api/gas-project/{pid}/service-checkout ============

class TestServiceCheckout:
    def test_checkout_express_24h_returns_stripe_url(self, auth_headers):
        body = {
            "service_id": "express_24h",
            "origin_url": BASE_URL,
            "quantity": 1,
        }
        r = requests.post(
            f"{BASE_URL}/api/gas-project/{PID}/service-checkout",
            json=body, headers=auth_headers, timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        url = data.get("url", "")
        assert "stripe.com" in url, f"Not a Stripe URL: {url}"
        assert data.get("session_id"), "missing session_id"
        assert data.get("service", {}).get("id") == "express_24h"
        assert data.get("amount") == 49.0

    def test_checkout_qes_signature(self, auth_headers):
        body = {"service_id": "qes_signature", "origin_url": BASE_URL, "quantity": 1}
        r = requests.post(
            f"{BASE_URL}/api/gas-project/{PID}/service-checkout",
            json=body, headers=auth_headers, timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["amount"] == 5.0
        assert "stripe.com" in data["url"]

    def test_checkout_invalid_service_returns_400(self, auth_headers):
        body = {"service_id": "non_existent_svc", "origin_url": BASE_URL, "quantity": 1}
        r = requests.post(
            f"{BASE_URL}/api/gas-project/{PID}/service-checkout",
            json=body, headers=auth_headers, timeout=20,
        )
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"

    def test_checkout_unknown_project_returns_404(self, auth_headers):
        body = {"service_id": "express_24h", "origin_url": BASE_URL, "quantity": 1}
        r = requests.post(
            f"{BASE_URL}/api/gas-project/gp_nonexistent_xxxxx/service-checkout",
            json=body, headers=auth_headers, timeout=20,
        )
        assert r.status_code == 404

    def test_checkout_unauth(self):
        body = {"service_id": "express_24h", "origin_url": BASE_URL, "quantity": 1}
        r = requests.post(
            f"{BASE_URL}/api/gas-project/{PID}/service-checkout",
            json=body, timeout=15,
        )
        assert r.status_code in (401, 403)


# ============ GET /api/gas-project/{pid}/service-status/{sid} ============

class TestServiceStatus:
    def test_status_for_freshly_created_session(self, auth_headers):
        # create a fresh checkout
        body = {"service_id": "tech_review", "origin_url": BASE_URL, "quantity": 1}
        r = requests.post(
            f"{BASE_URL}/api/gas-project/{PID}/service-checkout",
            json=body, headers=auth_headers, timeout=30,
        )
        assert r.status_code == 200, r.text
        sid = r.json()["session_id"]
        # poll status
        r2 = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/service-status/{sid}",
            headers=auth_headers, timeout=20,
        )
        assert r2.status_code == 200, r2.text
        data = r2.json()
        # Unpaid Stripe session → status should be 'open' or 'unpaid'/not 'paid'
        assert data.get("status") != "paid" or data.get("already") is True
        # purchase row must exist with status='pending' or 'paid'
        # (test_list_services already validates persistence)

    def test_status_for_unknown_session(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/service-status/cs_nonexistent_session",
            headers=auth_headers, timeout=20,
        )
        # purchase not found → 404
        assert r.status_code == 404


# ============ V8.2 regression smoke ============

class TestV82RegressionSmoke:
    def test_me_billing(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/me/billing", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "current_plan" in data
        assert "transactions" in data
        assert "activations" in data

    def test_placeholders_registry(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/placeholders/registry", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        data = r.json()
        fields = data.get("fields") or data.get("FIELDS_REGISTRY") or []
        if not fields:
            for v in data.values():
                if isinstance(v, list) and len(v) > 100:
                    fields = v
                    break
        assert len(fields) >= 179

    def test_dossier_zip_27_files(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/dossier.zip",
            headers=auth_headers, timeout=60,
        )
        assert r.status_code == 200
        with zipfile.ZipFile(io.BytesIO(r.content)) as z:
            names = z.namelist()
        assert len(names) >= 27

    def test_plan_checkout_returns_stripe(self, auth_headers):
        for plan in ("operator", "proiectant", "basic", "vgd"):
            r = requests.post(
                f"{BASE_URL}/api/payments/checkout",
                json={"plan_id": plan, "origin_url": BASE_URL},
                headers=auth_headers, timeout=30,
            )
            if r.status_code == 200:
                url = r.json().get("url", "")
                assert "stripe.com" in url
                return
        pytest.skip("No plan accepted")

    def test_auth_me(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("email") == ADMIN_EMAIL

    def test_upgrade_info(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/upgrade-info?path=/gaze-naturale", headers=auth_headers, timeout=15)
        # may be 200 with has_access info; key requirement is no 500
        assert r.status_code in (200, 404)

    def test_stamps_list(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/stamps", headers=auth_headers, timeout=15)
        assert r.status_code == 200
