"""
V8.0 — Three NEW gas DOCX templates + Stripe idempotency + /me/billing endpoint.

Templates exercised:
  - dtac_lista_avize       (consumes ~11 avize_* groups → 11 rows)
  - pv_calitate            (PV-CC, proiectant, executant, diriginte, lucrari, concluzii)
  - program_faze_isc       (ISC județ + 7 faze determinante FD-01..FD-07)

Plus:
  - dossier.zip count must be 26 DOCX + 1 manifest = 27 files
  - GET /me/billing shape
  - Stripe webhook code review (idempotency markers checked in source)
"""
import io
import os
import zipfile

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "dragosserban95@gmail.com"
ADMIN_PASSWORD = "Test12345"
PID = "gp_e79e2810cc64b5b4"


# ----------------------------- fixtures -----------------------------
@pytest.fixture(scope="module")
def token():
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text[:300]}"
    tok = r.json().get("token")
    assert tok and isinstance(tok, str)
    return tok


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def _docx_text(content_bytes: bytes) -> str:
    """Extract all text from a DOCX (word/document.xml only) for assertion."""
    try:
        with zipfile.ZipFile(io.BytesIO(content_bytes)) as z:
            names = z.namelist()
            # collect main doc + tables
            txt = []
            for n in names:
                if n.startswith("word/") and n.endswith(".xml"):
                    try:
                        txt.append(z.read(n).decode("utf-8", errors="ignore"))
                    except Exception:
                        pass
            return "\n".join(txt)
    except Exception as e:
        return f"<not a zip: {e}>"


# ----------------------------- DOCX templates -----------------------------
class TestNewGasTemplates:
    """Verify the 3 new DOCX endpoints return valid DOCX with seeded data."""

    def test_dtac_lista_avize_docx(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/doc/dtac_lista_avize",
            headers=auth_headers,
            timeout=60,
        )
        assert r.status_code == 200, f"status {r.status_code}: {r.text[:300]}"
        assert r.headers.get("content-type", "").startswith(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ), f"unexpected content-type: {r.headers.get('content-type')}"
        # Must be a real .docx (zip starts PK)
        assert r.content[:2] == b"PK", "response is not a DOCX (zip) file"
        text = _docx_text(r.content)
        # Check key tokens from the 11 expected avize rows
        # Use loose token matching (numbers/letters present in seed data)
        expected_tokens = ["EDS", "1234", "TKM", "ANB", "STB", "NCT", "LXT", "Obținut"]
        present = [t for t in expected_tokens if t in text]
        assert len(present) >= 5, f"expected at least 5/8 markers present, got {present}"

    def test_pv_calitate_docx(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/doc/pv_calitate",
            headers=auth_headers,
            timeout=60,
        )
        assert r.status_code == 200, f"status {r.status_code}: {r.text[:300]}"
        assert r.content[:2] == b"PK", "response is not a DOCX"
        text = _docx_text(r.content)
        expected_tokens = ["PV-CC-23/2026", "Dragoș", "Aurel Vlaicu", "Maria Stoica", "Trasaj", "CORESPUNZ"]
        present = [t for t in expected_tokens if t in text]
        assert len(present) >= 3, f"expected ≥3 seed markers in PV Calitate, got {present}"

    def test_program_faze_isc_docx(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/doc/program_faze_isc",
            headers=auth_headers,
            timeout=60,
        )
        assert r.status_code == 200, f"status {r.status_code}: {r.text[:300]}"
        assert r.content[:2] == b"PK", "response is not a DOCX"
        text = _docx_text(r.content)
        expected_tokens = ["ISC", "FD-01", "FD-02", "FD-03", "FD-04", "FD-05", "FD-06", "FD-07",
                           "Predare", "trasaj", "etanșeitate", "PVRTL"]
        present = [t for t in expected_tokens if t in text]
        assert len(present) >= 6, f"expected ≥6 ISC markers, got {present}"


# ----------------------------- Dossier ZIP -----------------------------
class TestDossierZip:
    def test_dossier_zip_contains_27_files(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/dossier.zip",
            headers=auth_headers,
            timeout=120,
        )
        assert r.status_code == 200, f"status {r.status_code}: {r.text[:300]}"
        assert r.content[:2] == b"PK"
        with zipfile.ZipFile(io.BytesIO(r.content)) as z:
            names = z.namelist()
        docx_files = [n for n in names if n.lower().endswith(".docx")]
        manifests = [n for n in names if "MANIFEST" in n.upper()]
        total = len(names)
        # Per request: 26 DOCX + 1 manifest = 27 files total
        assert len(docx_files) == 26, f"expected 26 DOCX, got {len(docx_files)}: {docx_files}"
        assert len(manifests) >= 1, f"manifest missing, files: {names}"
        assert total >= 27, f"expected ≥27 files, got {total}: {names}"


# ----------------------------- /me/billing -----------------------------
class TestMeBilling:
    def test_me_billing_shape(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/me/billing", headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"status {r.status_code}: {r.text[:300]}"
        data = r.json()
        # Shape
        assert "current_plan" in data, f"missing current_plan: {data}"
        assert "transactions" in data, f"missing transactions: {data}"
        assert "activations" in data, f"missing activations: {data}"
        cp = data["current_plan"]
        for k in ("plan_id", "name", "price_eur", "renews_at"):
            assert k in cp, f"current_plan missing key {k}: {cp}"
        # Admin should be on 'developer' plan
        assert cp["plan_id"] == "developer", f"expected developer plan, got {cp['plan_id']}"
        assert isinstance(data["transactions"], list)
        assert isinstance(data["activations"], list)
        # Last 10 cap
        assert len(data["transactions"]) <= 10
        assert len(data["activations"]) <= 10


# ----------------------------- Stripe checkout still works -----------------------------
class TestStripeCheckout:
    def test_payments_checkout_basic_plan(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/payments/checkout",
            headers=auth_headers,
            json={"plan_id": "basic", "origin_url": BASE_URL},
            timeout=60,
        )
        assert r.status_code == 200, f"status {r.status_code}: {r.text[:300]}"
        data = r.json()
        assert "url" in data and "session_id" in data, f"missing keys: {data}"
        assert data["url"].startswith("https://checkout.stripe.com/"), f"bad url: {data['url']}"
        assert isinstance(data["session_id"], str) and len(data["session_id"]) > 5


# ----------------------------- Code review: webhook idempotency -----------------------------
class TestWebhookCodeStructure:
    """Static check that idempotency + audit log markers exist in server.py.

    Cannot e2e the webhook without a real Stripe signature, so we verify
    the code structure as requested.
    """

    def test_idempotency_markers_in_server_py(self):
        with open("/app/backend/server.py", "r", encoding="utf-8") as f:
            src = f.read()
        # idempotency
        assert "already_paid" in src, "missing already_paid idempotency variable"
        assert "and not already_paid" in src, "plan activation isn't gated by already_paid"
        # audit log
        assert "plan_activation_log" in src, "missing plan_activation_log collection"
        assert "log_id" in src, "missing log_id field on plan_activation_log insert"
        # webhook handler
        assert '@api.post("/webhook/stripe")' in src, "webhook route missing"


# ----------------------------- Regression: prior 7/7 still pass -----------------------------
class TestRegressionFromIter5:
    def test_placeholders_registry_179_fields(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/placeholders/registry", headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"{r.status_code} {r.text[:200]}"
        data = r.json()
        fields = data.get("fields") or []
        assert len(fields) >= 179, f"expected ≥179 fields, got {len(fields)}"

    def test_memoriu_tehnic_renders(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/doc/memoriu_tehnic",
            headers=auth_headers, timeout=60,
        )
        assert r.status_code == 200
        assert r.content[:2] == b"PK"
        text = _docx_text(r.content)
        # New sections (Vaillant, 0.30g, Categoria importanță, Exigențe)
        markers = ["Vaillant", "0.30", "Categoria", "Exigențe"]
        present = [m for m in markers if m in text]
        assert len(present) >= 2, f"expected ≥2 markers, got {present}"

    def test_carte_tehnica_renders(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/doc/carte_tehnica",
            headers=auth_headers, timeout=60,
        )
        assert r.status_code == 200
        assert r.content[:2] == b"PK"

    def test_borderou_renders(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/doc/borderou",
            headers=auth_headers, timeout=60,
        )
        assert r.status_code == 200
        assert r.content[:2] == b"PK"
        text = _docx_text(r.content)
        markers = ["Wavin", "Pietro", "EN 1555", "Aviz"]
        present = [m for m in markers if m in text]
        assert len(present) >= 1, f"expected ≥1 marker in borderou, got {present}"
