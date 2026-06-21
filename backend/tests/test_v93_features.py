"""V9.3 backend regression tests:
- Demo plan 'free' eliminated from public /api/plans
- .doc legacy upload to /api/ocr/extract-fields
- Template placeholder detection /api/ocr/template-placeholders
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
EMAIL = "dragosserban95@gmail.com"
PASSWORD = "Test12345"
DOC_PATH = "/tmp/epd/memoriu.doc"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# --- Plans / Demo elimination ---
class TestPlansV93:
    def test_plans_no_free_demo(self):
        r = requests.get(f"{BASE_URL}/api/plans", timeout=30)
        assert r.status_code == 200
        data = r.json()
        plans = data.get("plans") if isinstance(data, dict) else data
        assert plans, "plans empty"
        ids = [p["id"] for p in plans]
        assert "free" not in ids, f"free plan must be hidden. ids={ids}"
        # Expected V9.3 11 plans
        expected = {"trial", "basic", "operator", "contabilitate", "avize", "ofertare",
                    "executant", "proiectant", "rte", "vgd", "societate"}
        assert expected.issubset(set(ids)), f"missing plans: {expected - set(ids)}"

    def test_plans_prices_v93(self):
        r = requests.get(f"{BASE_URL}/api/plans", timeout=30)
        plans = r.json().get("plans") if isinstance(r.json(), dict) else r.json()
        prices = {p["id"]: p.get("price_eur") for p in plans}
        expected_prices = {
            "trial": 0, "basic": 29, "operator": 59, "contabilitate": 49,
            "avize": 69, "ofertare": 79, "executant": 99, "proiectant": 129,
            "rte": 149, "vgd": 169, "societate": 399,
        }
        for pid, expected_p in expected_prices.items():
            assert prices.get(pid) == expected_p, f"{pid} expected {expected_p}, got {prices.get(pid)}"


# --- OCR .doc legacy upload ---
class TestOcrDocLegacy:
    def test_extract_fields_doc(self, auth_headers):
        assert os.path.exists(DOC_PATH), f"{DOC_PATH} not present"
        with open(DOC_PATH, "rb") as fh:
            files = {"file": ("memoriu.doc", fh, "application/msword")}
            r = requests.post(f"{BASE_URL}/api/ocr/extract-fields",
                              headers=auth_headers, files=files, timeout=90)
        assert r.status_code == 200, f"status {r.status_code} body={r.text[:500]}"
        body = r.json()
        df = body.get("detected_fields") or body.get("fields") or {}
        assert df, f"detected_fields empty. body keys: {list(body.keys())}"
        conf = body.get("confidence") or body.get("overall_confidence")
        # Accept medium / high
        if conf:
            assert str(conf).lower() in ("medium", "high"), f"unexpected confidence: {conf}"

    def test_template_placeholders_doc(self, auth_headers):
        assert os.path.exists(DOC_PATH)
        with open(DOC_PATH, "rb") as fh:
            files = {"file": ("memoriu.doc", fh, "application/msword")}
            r = requests.post(f"{BASE_URL}/api/ocr/template-placeholders",
                              headers=auth_headers, files=files, timeout=90)
        assert r.status_code == 200, f"status {r.status_code} body={r.text[:500]}"
        body = r.json()
        placeholders = body.get("placeholders") or []
        assert isinstance(placeholders, list)
        assert len(placeholders) >= 20, f"expected >=20 placeholders, got {len(placeholders)}"
        structure = body.get("structure") or {}
        sections = structure.get("sections_detected") or []
        assert isinstance(sections, list) and len(sections) > 0, f"sections_detected must be non-empty: {sections}"


# --- SEO / index.html ---
class TestSeoV93:
    def test_index_html_seo(self):
        # Frontend served from REACT_APP_BACKEND_URL root
        r = requests.get(f"{BASE_URL}/", timeout=30)
        assert r.status_code == 200
        html = r.text
        # Should NOT contain github-push-test in og/twitter/canonical meta
        # Limit check: ensure NOT in og:url / twitter:url / canonical
        import re
        for pattern in [
            r'property="og:url"\s+content="[^"]*github-push-test',
            r'property="twitter:url"\s+content="[^"]*github-push-test',
            r'rel="canonical"\s+href="[^"]*github-push-test',
        ]:
            assert not re.search(pattern, html), f"github-push-test must not appear in {pattern}"
        # Should contain energyprojectdesign.com in canonical
        assert "www.energyprojectdesign.com" in html, "energyprojectdesign.com missing in index.html"
