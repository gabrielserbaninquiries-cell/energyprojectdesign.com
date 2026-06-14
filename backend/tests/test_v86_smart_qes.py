"""V8.6 tests — smart-fill + validate + QES-v2 stub + V8.5 regression."""
import os
import hashlib
import json
import base64
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "dragosserban95@gmail.com"
ADMIN_PASSWORD = "Test12345"
TEST_PID = "gp_e79e2810cc64b5b4"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def token(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Login failed: {r.status_code} {r.text}")
    return r.json().get("token")


@pytest.fixture(scope="module")
def auth(session, token):
    session.headers.update({"Authorization": f"Bearer {token}"})
    return session


# ============================================================================
# Smart-fill
# ============================================================================
class TestSmartFill:
    def test_smart_fill_full_jp_payload(self, session):
        body = {
            "data": {
                "presiune_categorie": "JOASA PRESIUNE (<0.05 bar)",
                "sf_diametru_nominal_DN": "DN 32",
                "debit_instalat_mc_h": 4,
                "sf_lungime_conducta_m": 32,
                "tip_suprafata_pozare": "Trotuar",
            },
            "trigger": "presiune_categorie",
        }
        r = session.post(f"{BASE_URL}/api/placeholders/smart-fill", json=body)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "derived" in data and "count" in data
        derived = data["derived"]
        expected_keys = {
            "coeficient_renouard", "sf_material_conducta", "pierderi_p_admise_bar",
            "sf_presiune_max_op_bar", "pt_calcul_pierderi_presiune_bar",
            "pt_viteza_m_s", "la_sapatura_adancime_cm", "categorie_importanta_HG766",
        }
        missing = expected_keys - set(derived.keys())
        assert not missing, f"Missing derived keys: {missing}. Got: {list(derived.keys())}"
        assert data["count"] >= 8
        # Verify specific values
        assert "23200" in str(derived["coeficient_renouard"])
        assert derived["pierderi_p_admise_bar"] == 0.005
        assert derived["sf_presiune_max_op_bar"] == 10.0
        assert derived["la_sapatura_adancime_cm"] == 90  # Trotuar=0.9m

    def test_smart_fill_empty(self, session):
        r = session.post(f"{BASE_URL}/api/placeholders/smart-fill", json={"data": {}})
        assert r.status_code == 200
        # categorie_importanta_HG766 always defaults
        assert "derived" in r.json()


# ============================================================================
# Validate
# ============================================================================
class TestValidate:
    def test_validate_catches_3_errors(self, session):
        body = {
            "data": {
                "sudor_cnp": "123",
                "sf_presiune_max_op_bar": 15,
                "sf_diametru_nominal_DN": "DN 32",
                "pt_calcul_pierderi_presiune_bar": 0.05,
                "presiune_categorie": "JOASA PRESIUNE (<0.05 bar)",
            }
        }
        r = session.post(f"{BASE_URL}/api/placeholders/validate", json=body)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["valid"] is False
        assert data["error_count"] == 3
        errors = data["errors"]
        assert "sudor_cnp" in errors
        assert "sf_presiune_max_op_bar" in errors
        assert "pt_calcul_pierderi_presiune_bar" in errors
        # Specific error message for CNP
        assert any("13" in e for e in errors["sudor_cnp"])

    def test_validate_clean(self, session):
        body = {"data": {"sudor_cnp": "1880101040026"}}
        r = session.post(f"{BASE_URL}/api/placeholders/validate", json=body)
        assert r.status_code == 200
        assert r.json()["valid"] is True
        assert r.json()["error_count"] == 0


# ============================================================================
# QES-v2
# ============================================================================
class TestQesV2:
    def test_qes_providers_list(self, session):
        r = session.get(f"{BASE_URL}/api/qes-v2/providers")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "providers" in data
        assert "note" in data
        providers = data["providers"]
        assert len(providers) == 3
        ids = {p["id"] for p in providers}
        assert ids == {"digisign", "certsign", "transsped"}
        for p in providers:
            assert "format" in p
            assert "ancom_id" in p
            assert "supports" in p
            assert p["status"] == "STUB"
        # Check names
        by_id = {p["id"]: p for p in providers}
        assert "DigiSign" in by_id["digisign"]["name"]
        assert "certSIGN" in by_id["certsign"]["name"]
        assert "Trans Sped" in by_id["transsped"]["name"]

    def _valid_sign_body(self):
        doc_hash = hashlib.sha256(b"test document content").hexdigest()
        return {
            "provider": "digisign",
            "document_hash": doc_hash,
            "document_filename": "test.docx",
            "signer_cnp": "1880101040026",
            "signer_name": "Test User",
        }

    def test_qes_sign_valid(self, session):
        body = self._valid_sign_body()
        r = session.post(f"{BASE_URL}/api/qes-v2/sign", json=body)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["bundle_base64"]
        assert len(data["bundle_base64"]) > 50
        assert data["certificate_serial"].startswith("0x")
        assert data["signed_at"]
        assert "20" in data["signed_at"][:4]  # ISO date
        assert data["valid_to"]
        assert data["is_stub"] is True
        assert "DigiSign" in data["provider"]
        # Verify validity period ~3 years (>1000 days)
        from datetime import datetime
        s = datetime.fromisoformat(data["signed_at"])
        v = datetime.fromisoformat(data["valid_to"])
        delta_days = (v - s).days
        assert 1000 < delta_days < 1200, f"Expected ~3 years validity, got {delta_days} days"

    def test_qes_sign_invalid_cnp(self, session):
        body = self._valid_sign_body()
        body["signer_cnp"] = "12345"  # too short
        r = session.post(f"{BASE_URL}/api/qes-v2/sign", json=body)
        assert r.status_code == 400

    def test_qes_sign_invalid_hash(self, session):
        body = self._valid_sign_body()
        body["document_hash"] = "abc123"  # too short
        r = session.post(f"{BASE_URL}/api/qes-v2/sign", json=body)
        assert r.status_code == 400

    def test_qes_sign_invalid_provider(self, session):
        body = self._valid_sign_body()
        body["provider"] = "xyz"
        r = session.post(f"{BASE_URL}/api/qes-v2/sign", json=body)
        assert r.status_code == 400

    def test_qes_verify_roundtrip(self, session):
        body = self._valid_sign_body()
        sign_r = session.post(f"{BASE_URL}/api/qes-v2/sign", json=body)
        assert sign_r.status_code == 200
        bundle_b64 = sign_r.json()["bundle_base64"]
        verify_r = session.post(f"{BASE_URL}/api/qes-v2/verify", json={
            "signature_bundle": bundle_b64,
            "document_hash": body["document_hash"],
        })
        assert verify_r.status_code == 200, verify_r.text
        v = verify_r.json()
        assert v["valid"] is True
        assert v["provider"] == "digisign"
        assert v["signer"]
        assert v["is_qualified"] is True
        assert v["long_term_validation"] is True
        assert v["hash_match"] is True


# ============================================================================
# V8.5 regression
# ============================================================================
class TestV85Regression:
    def test_registry_counts(self, session):
        r = session.get(f"{BASE_URL}/api/placeholders/registry")
        assert r.status_code == 200
        data = r.json()
        assert len(data["fields"]) == 221, f"Expected 221 fields, got {len(data['fields'])}"
        assert len(data["sections"]) == 32
        assert len(data["categories"]) == 8

    def test_dossier_zip(self, auth):
        r = auth.get(f"{BASE_URL}/api/gas-project/{TEST_PID}/dossier.zip")
        assert r.status_code == 200, r.text
        import io, zipfile
        z = zipfile.ZipFile(io.BytesIO(r.content))
        assert len(z.namelist()) == 34, f"Expected 34 files, got {len(z.namelist())}: {z.namelist()}"

    def test_me_billing(self, auth):
        r = auth.get(f"{BASE_URL}/api/me/billing")
        assert r.status_code == 200
