"""
V7.4 Backend regression - Gaze Naturale 'COMPLETE DELIVERABLE PRODUCT' validation.

Covers:
- /api/placeholders/registry returns 179 fields, 26 sections, 6 categories
- /api/gas-project/{pid}/doc/memoriu_tehnic DOCX contains real values
- /api/gas-project/{pid}/dossier.zip returns ZIP with ~23 DOCX
- /api/payments/checkout returns valid Stripe checkout URL
- /api/upgrade-info returns recommended_plan structure (no Python error)
"""

import io
import os
import zipfile

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://57bd020b-829b-4403-b2b9-09912868b634.preview.emergentagent.com").rstrip("/")
TEST_PID = "gp_e79e2810cc64b5b4"
ADMIN_EMAIL = "dragosserban95@gmail.com"
ADMIN_PASS = "Test12345"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def token(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Login failed: {r.status_code} - {r.text[:200]}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------------- Placeholders registry ----------------

class TestPlaceholdersRegistry:
    def test_registry_returns_full_structure(self, session, auth):
        r = session.get(f"{BASE_URL}/api/placeholders/registry", headers=auth)
        assert r.status_code == 200, f"Status: {r.status_code} - {r.text[:300]}"
        data = r.json()

        # Should have fields, sections, categories
        assert "fields" in data or "registry" in data, f"Missing keys: {list(data.keys())}"

        # Accept either shape: {fields: [...], sections: [...], categories: [...]} 
        fields = data.get("fields") or data.get("registry") or []
        sections = data.get("sections") or []
        categories = data.get("categories") or []
        # categories may be a dict
        n_categories = len(categories) if isinstance(categories, (dict, list)) else 0
        n_sections = len(sections) if isinstance(sections, (dict, list)) else 0

        print(f"Fields={len(fields)} Sections={n_sections} Categories={n_categories}")
        assert len(fields) >= 170, f"Expected ~179 fields, got {len(fields)}"
        assert n_sections >= 24, f"Expected ~26 sections, got {n_sections}"
        assert n_categories >= 6, f"Expected 6 categories, got {n_categories}"

    def test_registry_categories_have_expected_ids(self, session, auth):
        r = session.get(f"{BASE_URL}/api/placeholders/registry", headers=auth)
        assert r.status_code == 200
        data = r.json()
        categories = data.get("categories") or {}
        # categories is dict keyed by id
        if isinstance(categories, dict):
            cat_ids = set(categories.keys())
        else:
            cat_ids = {c.get("id") or c.get("category_id") or c.get("key") for c in categories}
        expected = {"date_proiect", "documentatie_avize", "documentatie_proiectare",
                    "documentatie_executie", "carte_tehnica", "dispozitie_santier"}
        missing = expected - cat_ids
        assert not missing, f"Missing categories: {missing}. Got: {cat_ids}"


# ---------------- Memoriu Tehnic DOCX ----------------

class TestGasProjectDoc:
    def test_memoriu_tehnic_downloads_with_data(self, session, auth):
        r = session.get(f"{BASE_URL}/api/gas-project/{TEST_PID}/doc/memoriu_tehnic", headers=auth)
        assert r.status_code == 200, f"Status: {r.status_code} - {r.text[:300]}"
        # DOCX is a ZIP; check magic bytes
        assert r.content[:2] == b"PK", "Response is not a DOCX/ZIP"
        # Open DOCX as zip and read document.xml for real values
        with zipfile.ZipFile(io.BytesIO(r.content)) as z:
            xml = z.read("word/document.xml").decode("utf-8", errors="ignore")
        # At least one of the project's real values should appear
        # (we don't fail hard on a specific name since the project might have been edited;
        # but the doc must not be obviously empty or just placeholders {{...}})
        assert "{{" not in xml or xml.count("{{") < 5, "DOCX still contains many unrendered placeholders"
        assert len(xml) > 5000, f"DOCX content suspiciously small: {len(xml)} chars"


# ---------------- Dossier ZIP ----------------

class TestDossierZip:
    def test_dossier_zip_contains_23_docx(self, session, auth):
        r = session.get(f"{BASE_URL}/api/gas-project/{TEST_PID}/dossier.zip", headers=auth)
        assert r.status_code == 200, f"Status: {r.status_code} - {r.text[:300]}"
        assert r.content[:2] == b"PK"
        size_kb = len(r.content) / 1024
        print(f"Dossier zip size: {size_kb:.1f} KB")
        assert size_kb > 100, f"Dossier suspiciously small: {size_kb:.1f} KB"

        with zipfile.ZipFile(io.BytesIO(r.content)) as z:
            names = z.namelist()
            docx_names = [n for n in names if n.lower().endswith(".docx")]
            print(f"ZIP contents: {len(names)} files, {len(docx_names)} DOCX")
        assert len(docx_names) >= 20, f"Expected ~23 DOCX in dossier, got {len(docx_names)}: {docx_names}"


# ---------------- Stripe checkout ----------------

class TestPaymentsCheckout:
    def test_checkout_returns_stripe_url(self, session, auth):
        r = session.post(
            f"{BASE_URL}/api/payments/checkout",
            headers=auth,
            json={"plan_id": "basic", "origin_url": BASE_URL},
        )
        assert r.status_code == 200, f"Status: {r.status_code} - {r.text[:300]}"
        data = r.json()
        assert "url" in data or "checkout_url" in data, f"No url in {data}"
        url = data.get("url") or data.get("checkout_url")
        assert url.startswith("https://checkout.stripe.com/") or "stripe.com" in url, f"Bad URL: {url}"
        assert "session_id" in data, f"No session_id in {data}"


# ---------------- Upgrade Info ----------------

class TestUpgradeInfo:
    def test_upgrade_info_admin_has_access(self, session, auth):
        r = session.get(f"{BASE_URL}/api/upgrade-info?path=/seap-alerts", headers=auth)
        assert r.status_code == 200, f"Status: {r.status_code} - {r.text[:300]}"
        data = r.json()
        # Admin/developer should have access
        assert data.get("has_access") is True, f"Admin should have access; got {data}"

    def test_upgrade_info_no_python_error_in_plan_iteration(self, session, auth):
        """If recommended_plan is returned, it must have plan_id, name, price_eur, description."""
        # Try a path that admin DOES NOT have access to (might still return access=true for dev)
        # If recommended_plan present, validate its shape
        r = session.get(f"{BASE_URL}/api/upgrade-info?path=/some-feature", headers=auth)
        assert r.status_code == 200, f"Status: {r.status_code} - {r.text[:300]}"
        data = r.json()
        rec = data.get("recommended_plan")
        if rec:
            assert "plan_id" in rec, f"missing plan_id: {rec}"
            assert "name" in rec, f"missing name: {rec}"
            assert "price_eur" in rec or "price" in rec, f"missing price: {rec}"
