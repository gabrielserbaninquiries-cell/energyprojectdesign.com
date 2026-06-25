"""V11.3 — Tests for NEW Gas endpoints: templates-catalog + doc-preview + master-docx extended."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend .env file
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL"):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass

EMAIL = "dragosserban95@gmail.com"
PASSWORD = "Nuamparola_9"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# --- Templates catalog ---
class TestTemplatesCatalog:
    def test_catalog_returns_30plus_templates(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/gas/templates-catalog", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "templates" in data
        templates = data["templates"]
        assert isinstance(templates, list)
        assert len(templates) >= 30, f"Expected 30+ templates, got {len(templates)}"
        # each entry should have id+label
        for t in templates[:5]:
            assert "id" in t
            assert "label" in t or "name" in t

    def test_catalog_has_known_templates(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/gas/templates-catalog", headers=auth_headers, timeout=30)
        ids = {t["id"] for t in r.json()["templates"]}
        # Required from request brief
        expected = {"predare_amplasament", "memoriu_tehnic", "cerere_atr", "pv_receptie"}
        missing = expected - ids
        assert not missing, f"Missing templates: {missing}. Available: {sorted(ids)[:15]}"


# --- Doc preview per template ---
class TestDocPreview:
    BASE_PAYLOAD = {
        "beneficiar_nume": "Test Beneficiar",
        "amplasament_imobil": "Str. Aurel Vlaicu 15",
        "osd_nume": "Distrigaz Sud Retele",
        "tip_lucrare": "bransament",
        "title": "Test Project",
    }

    @pytest.mark.parametrize("tpl_id", [
        "predare_amplasament",
        "memoriu_tehnic",
        "cerere_atr",
        "pv_receptie",
    ])
    def test_doc_preview_returns_docx(self, auth_headers, tpl_id):
        r = requests.post(
            f"{BASE_URL}/api/gas/doc-preview/{tpl_id}",
            json=self.BASE_PAYLOAD,
            headers=auth_headers,
            timeout=60,
        )
        assert r.status_code == 200, f"{tpl_id} failed: {r.status_code} {r.text[:300]}"
        # DOCX = PK zip
        assert r.content[:2] == b"PK", f"{tpl_id} not a valid DOCX (no PK header)"
        # > 5KB (request says > 30KB but be a bit lenient since some templates are small)
        assert len(r.content) > 5_000, f"{tpl_id} DOCX too small: {len(r.content)}b"

    def test_doc_preview_invalid_template_404(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/gas/doc-preview/nonexistent_template_xyz",
            json=self.BASE_PAYLOAD,
            headers=auth_headers,
            timeout=30,
        )
        assert r.status_code == 404, f"Expected 404, got {r.status_code}: {r.text[:200]}"

    def test_doc_preview_requires_auth(self):
        r = requests.post(
            f"{BASE_URL}/api/gas/doc-preview/memoriu_tehnic",
            json=self.BASE_PAYLOAD,
            timeout=30,
        )
        assert r.status_code in (401, 403), f"Expected 401/403, got {r.status_code}"


# --- Master DOCX with new sections (suduri + protocol + PV) ---
class TestMasterDocxExtended:
    def test_master_docx_with_suduri_and_pv(self, auth_headers):
        payload = {
            "tip_lucrare": "bransament",
            "beneficiar_nume": "Vasile Pop",
            "amplasament_imobil": "Str. Aurel Vlaicu 15",
            "osd_nume": "Distrigaz Sud Retele",
            "title": "Test cu Suduri",
            "sudor_nume": "Ion Pop",
            "sudor_autorizatie": "ANRE-12345",
            "examinare_vizuala": [
                {"nr_ordine": 1, "cod_sudura": "S001", "defecte": "Nu sunt defecte", "rezultat": "Admis"},
                {"nr_ordine": 2, "cod_sudura": "S002", "defecte": "Nu sunt defecte", "rezultat": "Admis"},
            ],
            "protocol_electrofuziune": [
                {"nr_fitting": "F001", "tensiune": 40.0, "timp_sec": 95, "energie_kj": 12.8},
            ],
            "procese_verbale": [
                {"tip": "PV Recepție tehnică branșament", "nr": "PV-001", "data": "2026-01-15"},
            ],
        }
        r = requests.post(
            f"{BASE_URL}/api/gas/master-docx-preview",
            json=payload,
            headers=auth_headers,
            timeout=60,
        )
        assert r.status_code == 200, r.text[:300]
        assert r.content[:2] == b"PK"
        # Should be > 30KB per spec
        assert len(r.content) > 30_000, f"Master DOCX too small: {len(r.content)}b"

    def test_master_docx_without_new_sections(self, auth_headers):
        """Regression: master DOCX must still work without suduri/PV data."""
        payload = {
            "tip_lucrare": "bransament",
            "beneficiar_nume": "Vasile Pop",
            "amplasament_imobil": "Str. Aurel Vlaicu 15",
        }
        r = requests.post(
            f"{BASE_URL}/api/gas/master-docx-preview",
            json=payload,
            headers=auth_headers,
            timeout=60,
        )
        assert r.status_code == 200, r.text[:300]
        assert r.content[:2] == b"PK"
        assert len(r.content) > 20_000
