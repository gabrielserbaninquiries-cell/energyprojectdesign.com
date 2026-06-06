"""Backend tests for V4.5 features: Projects, Technical/Calc, Certifications, AI, Verification, Audit, GDPR."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://template-stamp-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def session():
    return requests.Session()


@pytest.fixture(scope="module")
def user_creds():
    uniq = uuid.uuid4().hex[:8]
    return {
        "email": f"v45_{uniq}@example.com",
        "password": "TestPass123!",
        "name": "V45 User",
        "company": "EPD SRL",
        "gdpr_consent": True,
    }


@pytest.fixture(scope="module")
def auth(session, user_creds):
    r = session.post(f"{API}/auth/register", json=user_creds, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    session.headers.update({"Authorization": f"Bearer {data['token']}"})
    return data


# ---------- GDPR consent at register ----------
class TestRegisterGDPR:
    def test_register_without_consent_rejected(self, session):
        uniq = uuid.uuid4().hex[:8]
        r = requests.post(f"{API}/auth/register", json={
            "email": f"nogdpr_{uniq}@example.com",
            "password": "TestPass123!",
            "name": "N",
            "gdpr_consent": False,
        }, timeout=15)
        assert r.status_code == 400, r.text
        detail = r.json().get("detail", "")
        assert "GDPR" in detail or "Confidențialitate" in detail or "Politica" in detail

    def test_register_with_consent_ok(self, auth):
        u = auth["user"]
        assert u["plan"] == "basic"
        assert u.get("gdpr_consent") is True
        assert u.get("gdpr_consent_at")


# ---------- Projects ----------
class TestProject:
    def test_get_project_autocreates(self, session, auth):
        r = session.get(f"{API}/project", timeout=10)
        assert r.status_code == 200, r.text
        p = r.json()
        assert "_id" not in p
        # 14 required fields present and empty initially
        required = ["beneficiar", "adresa_lucrare", "localitate", "judet", "telefon", "email",
                    "osd", "tip_lucrare", "numar_contract", "data_contract", "proiectant",
                    "executant", "verificator_vgd", "responsabil_rte"]
        for f in required:
            assert f in p, f"missing field {f}"
            assert p[f] in ("", None)
        assert p.get("completion") == 0.0

    def test_update_project_full(self, session, auth):
        payload = {
            "beneficiar": "ENERGY PROJECT DESIGN SRL", "adresa_lucrare": "Str. Test 1",
            "localitate": "Bucuresti", "judet": "Ilfov", "telefon": "0700000000",
            "email": "x@y.ro", "osd": "Distrigaz", "tip_lucrare": "branșament nou",
            "numar_contract": "C/123", "data_contract": "2026-01-15",
            "proiectant": "Ing. Popescu", "executant": "Firma X SRL",
            "verificator_vgd": "VGD Y", "responsabil_rte": "RTE Z",
            "observatii": "test",
        }
        r = session.put(f"{API}/project", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        p = r.json()
        assert p["completion"] == 100.0
        assert p["beneficiar"] == payload["beneficiar"]
        assert "_id" not in p

    def test_update_project_partial(self, session, auth):
        # 7 of 14 → ~50% completion
        payload = {
            "beneficiar": "X", "adresa_lucrare": "Y", "localitate": "Z",
            "judet": "A", "telefon": "1", "email": "a@b.c", "osd": "D",
            "tip_lucrare": "", "numar_contract": "", "data_contract": "",
            "proiectant": "", "executant": "", "verificator_vgd": "", "responsabil_rte": "",
        }
        r = session.put(f"{API}/project", json=payload, timeout=15)
        assert r.status_code == 200
        p = r.json()
        assert 49.0 <= p["completion"] <= 51.0, f"completion={p['completion']}"


# ---------- Technical / Calc Engine ----------
class TestTechnical:
    def test_technical_normal(self, session, auth):
        payload = {
            "debit_instalat": 10, "presiune_regim": "JP",
            "lungime_bransament": 25, "diametru_conducta": "DN25",
            "material_conducta": "PE",
        }
        r = session.put(f"{API}/project/technical", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        calc = body["calc_results"]
        assert calc["debit_calculat_mc_h"]["value"] == 10
        assert calc["debit_recomandat_mc_h"]["value"] == 11.0
        assert calc["putere_instalata_kw"]["value"] == 106.0
        assert calc["risc_presiune"]["value"] == "normal"
        assert calc["estimare_cost"]["value"] == 3000.0
        assert calc["contor_orientativ"]["value"] == "G6"

    def test_technical_long_bransament_warning(self, session, auth):
        payload = {
            "debit_instalat": 10, "presiune_regim": "JP",
            "lungime_bransament": 50, "diametru_conducta": "DN25",
            "material_conducta": "PE",
        }
        r = session.put(f"{API}/project/technical", json=payload, timeout=15)
        assert r.status_code == 200
        calc = r.json()["calc_results"]
        assert calc["risc_presiune"]["value"] == "verificare presiune necesară"
        assert calc["risc_presiune"]["status"] == "warning"

    def test_technical_override(self, session, auth):
        payload = {
            "debit_instalat": 10, "presiune_regim": "JP",
            "lungime_bransament": 25, "diametru_conducta": "DN25",
            "material_conducta": "PE",
            "overrides": {"debit_calculat_mc_h": "15 custom"},
        }
        r = session.put(f"{API}/project/technical", json=payload, timeout=15)
        assert r.status_code == 200
        calc = r.json()["calc_results"]
        assert calc["debit_calculat_mc_h"]["status"] == "override"
        assert calc["debit_calculat_mc_h"]["value"] == "15 custom"

    def test_recalculate(self, session, auth):
        r = session.post(f"{API}/project/recalculate", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert "calc_results" in body
        assert body["calc_results"]["debit_recomandat_mc_h"]["value"] == 11.0

    def test_placeholders(self, session, auth):
        r = session.get(f"{API}/project/placeholders", timeout=10)
        assert r.status_code == 200
        ph = r.json()
        # Project fields
        for k in ["beneficiar", "adresa_lucrare", "observatii"]:
            assert k in ph
        # technical_data flat keys
        assert "debit_instalat" in ph
        # calc_results keys
        assert "debit_recomandat_mc_h" in ph
        # data_document is auto-set
        assert ph.get("data_document"), "data_document should be non-empty"


# ---------- Certifications ----------
class TestCertifications:
    def test_create_certification(self, session, auth):
        payload = {"role": "vgd", "signer_name": "Ion Popescu", "document_title": "Memoriu tehnic"}
        r = session.post(f"{API}/certifications", json=payload, timeout=10)
        assert r.status_code == 200, r.text
        c = r.json()
        assert c["role"] == "vgd"
        assert c["signer_name"] == "Ion Popescu"
        assert c["hash"] and len(c["hash"]) == 64  # sha256 hex
        assert c["cert_internal_id"].startswith("cert_")

    def test_invalid_role(self, session, auth):
        r = session.post(f"{API}/certifications", json={
            "role": "invalidrole", "signer_name": "X", "document_title": "T"
        }, timeout=10)
        assert r.status_code == 400

    def test_list_certifications(self, session, auth):
        r = session.get(f"{API}/certifications", timeout=10)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) >= 1
        assert any(c["role"] == "vgd" for c in arr)


# ---------- AI Assistant ----------
class TestAI:
    def test_parse_verify(self, session, auth):
        r = session.post(f"{API}/ai/parse", json={"message": "verifică documentația"}, timeout=10)
        assert r.status_code == 200
        p = r.json()
        assert p["intent"] == "verify_documentation"
        assert p["target_page"] == "/verifica"
        assert p["action"]
        assert p["confidence"] > 0

    def test_parse_unknown(self, session, auth):
        r = session.post(f"{API}/ai/parse", json={"message": "asdf nonsense xyz"}, timeout=10)
        assert r.status_code == 200
        p = r.json()
        assert p["intent"] is None
        assert "identificat" in p["preview"] or "necunoscut" in p["preview"].lower() or "intenț" in p["preview"]

    def test_parse_run_calc(self, session, auth):
        r = session.post(f"{API}/ai/parse", json={"message": "rulează calcul inteligent"}, timeout=10)
        assert r.status_code == 200
        p = r.json()
        assert p["target_page"] == "/calcul"


# ---------- Verification ----------
class TestVerification:
    def test_verification(self, session, auth):
        r = session.get(f"{API}/verification", timeout=15)
        assert r.status_code == 200, r.text
        v = r.json()
        assert isinstance(v["overall_score"], (int, float))
        assert 0 <= v["overall_score"] <= 100
        assert isinstance(v["checks"], list) and len(v["checks"]) >= 5
        keys = {c["key"] for c in v["checks"]}
        for required_key in ["project_data", "technical_data", "smart_calc", "templates", "documents", "stamps", "certifications", "plan"]:
            assert required_key in keys, f"missing check {required_key}"
        s = v["summary"]
        assert "ok" in s and "warning" in s and "missing" in s


# ---------- Audit ----------
class TestAudit:
    def test_audit(self, session, auth):
        r = session.get(f"{API}/audit", timeout=10)
        assert r.status_code == 200
        a = r.json()
        pages = a["pages"]
        assert isinstance(pages, list) and len(pages) >= 13
        for p in pages:
            assert p["implemented"] is True
            assert "plan_access" in p and isinstance(p["plan_access"], bool)
            assert "fields" in p
            assert "required_handlers" in p
        assert a["user"]["plan"] == "basic"
        assert "plan_features" in a and isinstance(a["plan_features"], list)


# ---------- GDPR ----------
class TestGDPR:
    def test_gdpr_export(self, session, auth):
        r = session.get(f"{API}/gdpr/export", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        u = d["user"]
        assert "password_hash" not in u
        assert "gmail_app_password" not in u
        for key in ["projects", "documents", "templates", "stamps", "certifications_internal", "action_logs"]:
            assert key in d, f"missing key {key}"

    def test_gdpr_delete_account(self, session, auth):
        r = session.delete(f"{API}/gdpr/account", timeout=15)
        assert r.status_code == 200
        assert r.json().get("deleted") is True
        # subsequent /auth/me should fail
        r2 = session.get(f"{API}/auth/me", timeout=10)
        assert r2.status_code == 401
