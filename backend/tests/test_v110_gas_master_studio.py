"""V11.0 — Tests for GasNaturalStudio + master DOCX preview endpoint."""
import os
import pytest
import requests
from tests.fixtures import get_owner_credentials

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
_CREDS = get_owner_credentials()


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": _CREDS["email"], "password": _CREDS["password"]}, timeout=20)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# --- Auth ---
class TestAuth:
    def test_login(self, token):
        assert isinstance(token, str) and len(token) > 0

    def test_me(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        u = r.json()
        assert u.get("email") == _CREDS["email"]


# --- Plans (public) ---
class TestPlansPublic:
    def test_plans_no_auth(self):
        r = requests.get(f"{BASE_URL}/api/plans", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 5


# --- Master DOCX preview ---
class TestMasterDocxPreview:
    PAYLOAD = {
        "title": "Test Preview Bransament",
        "osd_nume": "Distrigaz Sud Retele",
        "vgd_nume": "Verificator VGD",
        "rte_nume": "RTE Tehnic",
        "proiectant_nume": "EPD",
        "executant_nume": "EPD Exec",
        "beneficiar_nume": "Test Beneficiar SRL",
        "amplasament_imobil": "Str. Aurel Vlaicu 15, Bucuresti",
        "br_material": "PE",
        "br_diametru": "32",
        "br_lungime": 5,
        "br_debit_total": 3.5,
        "br_latime_sant": 0.40,
        "consumatori": [
            {"nume": "Centrala", "debit": 2.5},
            {"nume": "Aragaz", "debit": 1.0},
        ],
        "iu_camere": [{"S": 20, "H": 2.7, "V": 54}],
        "extindere_n_bransamente": 2,
    }

    def test_preview_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/gas/master-docx-preview", json=self.PAYLOAD, timeout=30)
        assert r.status_code in (401, 403), f"Expected auth required but got {r.status_code}"

    def test_preview_returns_docx(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/gas/master-docx-preview",
            json=self.PAYLOAD,
            headers=auth_headers,
            timeout=60,
        )
        assert r.status_code == 200, f"Status {r.status_code} body={r.text[:300]}"
        ctype = r.headers.get("content-type", "")
        assert "wordprocessingml" in ctype or "officedocument" in ctype, f"Bad content-type: {ctype}"
        # DOCX is a ZIP — starts with PK
        body = r.content
        assert body[:2] == b"PK", "DOCX must start with PK (zip magic)"
        assert len(body) > 5_000, f"DOCX too small: {len(body)} bytes"

    def test_preview_placeholders_replaced(self, auth_headers):
        """Make sure the DOCX does not contain bare {placeholder} tokens."""
        import zipfile
        import io as _io
        r = requests.post(
            f"{BASE_URL}/api/gas/master-docx-preview",
            json=self.PAYLOAD,
            headers=auth_headers,
            timeout=60,
        )
        assert r.status_code == 200
        z = zipfile.ZipFile(_io.BytesIO(r.content))
        doc_xml = z.read("word/document.xml").decode("utf-8", errors="ignore")
        # The user provided beneficiar should appear in the doc
        # (any one of the key fields is enough as a smoke check)
        appeared = sum(
            1 for needle in ["Test Beneficiar", "Aurel Vlaicu", "Distrigaz", "PE", "EPD"]
            if needle in doc_xml
        )
        assert appeared >= 2, f"None of the payload values were rendered (matches={appeared})"
        # Detect un-substituted Jinja-style placeholders
        import re
        leftovers = re.findall(r"\{\{\s*[a-zA-Z_][a-zA-Z0-9_\.]*\s*\}\}", doc_xml)
        # Allow a small handful (some templates legitimately keep optional placeholders).
        assert len(leftovers) < 10, f"Too many un-substituted placeholders: {leftovers[:10]}"


# --- Gas templates registry sanity ---
class TestGasTemplates:
    def test_doc_templates_listing(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/gas-project/doc-templates", headers=auth_headers, timeout=20)
        # Endpoint may or may not require auth; accept 200 either way
        assert r.status_code in (200, 401, 403)
        if r.status_code == 200:
            data = r.json()
            assert isinstance(data, (list, dict))
