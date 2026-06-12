"""V8.5 — NTPEE 2018 registry expansion + regression for V8.4 templates & V8.3 services."""
import os
import io
import zipfile
import pytest
import requests
from pathlib import Path

# Load REACT_APP_BACKEND_URL from frontend/.env if not already set
if not os.environ.get("REACT_APP_BACKEND_URL"):
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                os.environ["REACT_APP_BACKEND_URL"] = line.split("=", 1)[1].strip()
                break

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
EMAIL = "dragosserban95@gmail.com"
PASSWORD = "Test12345"
TEST_PID = "gp_e79e2810cc64b5b4"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"login failed: {r.status_code} {r.text[:200]}")
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth(api, token):
    api.headers.update({"Authorization": f"Bearer {token}"})
    return api


# ============== Registry — V8.5 critical assertions ==============
class TestRegistryV85:
    def test_registry_endpoint_ok(self, api):
        r = api.get(f"{BASE_URL}/api/placeholders/registry")
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert "fields" in d and "sections" in d and "categories" in d

    def test_registry_field_count_221(self, api):
        d = api.get(f"{BASE_URL}/api/placeholders/registry").json()
        assert len(d["fields"]) == 221, f"expected 221 fields, got {len(d['fields'])}"

    def test_registry_section_count_32(self, api):
        d = api.get(f"{BASE_URL}/api/placeholders/registry").json()
        assert len(d["sections"]) == 32, f"expected 32 sections, got {len(d['sections'])}"

    def test_registry_category_count_8(self, api):
        d = api.get(f"{BASE_URL}/api/placeholders/registry").json()
        assert len(d["categories"]) == 8, f"expected 8 categories, got {len(d['categories'])}"

    def test_ntpee_compliance_category(self, api):
        d = api.get(f"{BASE_URL}/api/placeholders/registry").json()
        cats = d["categories"]
        assert "ntpee_compliance" in cats, "missing category ntpee_compliance"
        c = cats["ntpee_compliance"]
        assert c["order"] == 8
        assert c["label"] == "NTPEE 2018 obligatorii"
        assert set(c["sections"]) == {"ntpee_general", "piese_desenate", "instalatie_interioara", "renouard"}
        assert c.get("icon") == "BookCheck"

    def test_ntpee_sections_present(self, api):
        d = api.get(f"{BASE_URL}/api/placeholders/registry").json()
        secs = d["sections"]
        for s in ["ntpee_general", "piese_desenate", "instalatie_interioara", "renouard"]:
            assert s in secs, f"missing section {s}"

    def test_new_ntpee_fields_present(self, api):
        d = api.get(f"{BASE_URL}/api/placeholders/registry").json()
        keys = {f["key"] for f in d["fields"]}
        expected = [
            "titular_investitie", "studiu_geotehnic_anexat",
            "masuri_antipatrundere_gaze", "schema_izometrica_atasata",
            "cote_nivel_conducte", "armaturi_lista",
            "volume_incaperi_m3", "suprafete_vitrate_m2",
            "detectoare_gaze_auto", "etansare_intrare_subsol",
            "tronson_id", "debit_tronson_mc_h",
            "p_intrare_tronson_bar", "p_iesire_min_tronson_bar",
            "coeficient_renouard", "pierderi_p_admise_bar",
        ]
        missing = [k for k in expected if k not in keys]
        assert not missing, f"missing NTPEE fields: {missing}"


# ============== Dossier ZIP — 33 DOCX + 1 manifest ==============
class TestDossierZip:
    def test_dossier_zip(self, auth):
        r = auth.get(f"{BASE_URL}/api/gas-project/{TEST_PID}/dossier.zip", timeout=120)
        assert r.status_code == 200, r.text[:300]
        z = zipfile.ZipFile(io.BytesIO(r.content))
        names = z.namelist()
        docx = [n for n in names if n.lower().endswith(".docx")]
        assert len(docx) == 33, f"expected 33 docx, got {len(docx)}: {docx}"
        assert any("manifest" in n.lower() for n in names), f"manifest missing: {names}"
        assert len(names) == 34, f"expected 34 total files, got {len(names)}"


# ============== V8.4 — 7 legal templates ==============
V84_TEMPLATES = [
    "declaratie_conformitate", "buletin_proba_rezistenta",
    "buletin_proba_etanseitate", "pv_receptie_finala",
    "pv_pif_semnat", "fisa_sudor", "plan_ssm",
]


@pytest.mark.parametrize("tid", V84_TEMPLATES)
def test_v84_template_generates(auth, tid):
    url = f"{BASE_URL}/api/gas-project/{TEST_PID}/doc/{tid}"
    r = auth.get(url, timeout=60)
    assert r.status_code == 200, f"{tid}: {r.status_code} {r.text[:200]}"
    assert r.headers.get("content-type", "").startswith(
        "application/vnd.openxmlformats-officedocument"
    ), f"{tid}: bad content-type {r.headers.get('content-type')}"
    assert len(r.content) > 1000, f"{tid}: tiny payload {len(r.content)}"


# ============== V8.3 — Services catalog + checkout ==============
class TestServicesV83:
    def test_services_catalog(self, auth):
        r = auth.get(f"{BASE_URL}/api/gas-project/{TEST_PID}/services")
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        services = d.get("catalog") or d.get("services") or d
        assert len(services) == 5, f"expected 5 services, got {len(services)}"
        ids = {s.get("id") or s.get("service_id") for s in services}
        assert "qes_signature" in ids, ids

    def test_qes_checkout(self, auth):
        r = auth.post(
            f"{BASE_URL}/api/gas-project/{TEST_PID}/service-checkout",
            json={"service_id": "qes_signature", "origin_url": f"{BASE_URL}/gaze-naturale/{TEST_PID}"},
            timeout=30,
        )
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert "url" in d and d["url"].startswith("https://"), d
        assert "session_id" in d
        assert float(d.get("amount", 0)) == 5.0, f"expected amount=5.0, got {d.get('amount')}"


# ============== Billing regression ==============
class TestBilling:
    def test_me_billing(self, auth):
        r = auth.get(f"{BASE_URL}/api/me/billing")
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        # must have keys consumed by /billing page
        assert isinstance(d, dict)
        assert "plan" in d or "current_plan" in d or "subscription" in d, f"no plan key in {list(d.keys())[:10]}"
