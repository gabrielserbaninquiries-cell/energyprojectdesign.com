"""V8.7 — Real engineering tools (Renouard multi-tronson + sizing + materials auto-suggest)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
EMAIL = "dragosserban95@gmail.com"
PASSWORD = "Test12345"
PID = "gp_e79e2810cc64b5b4"


@pytest.fixture(scope="module")
def auth_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"Login failed: {r.status_code}")
    return r.json().get("token")


@pytest.fixture(scope="module")
def headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ---------------------------------------------------------------------------
# 1. POST /api/placeholders/tronsons-renouard
# ---------------------------------------------------------------------------
class TestTronsonsRenouard:
    def test_multi_tronson_basic(self, headers):
        body = {
            "tronsons": [
                {"id": "T1", "lungime_m": 32, "dn_mm": 26, "debit_mc_h": 4.0},
                {"id": "T2", "lungime_m": 15, "dn_mm": 26, "debit_mc_h": 3.0},
            ],
            "p_initial_bar": 0.025,
        }
        r = requests.post(f"{BASE_URL}/api/placeholders/tronsons-renouard", json=body, headers=headers, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "results" in data
        res = data["results"]
        assert len(res) == 2

        t1 = res[0]
        # Required fields
        for k in ("delta_p_mbar", "delta_p_bar", "p_intrare_bar", "p_finala_bar", "viteza_m_s", "verdict"):
            assert k in t1, f"missing key {k}"

        # Δp_mbar ≈ 1.4 mbar — accept 1.0..2.0 to account for rounding
        assert 1.0 <= t1["delta_p_mbar"] <= 2.0, f"delta_p_mbar={t1['delta_p_mbar']}"
        # bar == mbar/1000
        assert abs(t1["delta_p_bar"] - t1["delta_p_mbar"] / 1000.0) < 1e-3
        # velocity ~2.09 m/s
        assert 1.8 <= t1["viteza_m_s"] <= 2.3, f"viteza={t1['viteza_m_s']}"
        # p_intrare for T1 must equal p_initial
        assert abs(t1["p_intrare_bar"] - 0.025) < 1e-4
        # p_finala descending
        assert t1["p_finala_bar"] < t1["p_intrare_bar"]
        # T2 p_intrare == T1 p_finala (chained)
        t2 = res[1]
        assert abs(t2["p_intrare_bar"] - t1["p_finala_bar"]) < 1e-3
        assert t2["p_finala_bar"] < t2["p_intrare_bar"]
        # verdict must be string OK or REVIZUIRE...
        assert isinstance(t1["verdict"], str) and len(t1["verdict"]) > 0

    def test_empty_tronsons(self, headers):
        r = requests.post(f"{BASE_URL}/api/placeholders/tronsons-renouard",
                          json={"tronsons": [], "p_initial_bar": 0.025}, headers=headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["results"] == []


# ---------------------------------------------------------------------------
# 2. POST /api/placeholders/smart-sizing
# ---------------------------------------------------------------------------
class TestSmartSizing:
    def test_full_payload(self, headers):
        body = {"dn_size": 32, "debit_max_mc_h": 4.5, "presiune_intrare_bar": 2.0, "tip_presiune": "JP"}
        r = requests.post(f"{BASE_URL}/api/placeholders/smart-sizing", json=body, headers=headers, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()

        # latime_sant
        ls = d.get("latime_sant")
        assert ls is not None
        assert abs(ls["latime_recomandata_cm"] - 43.2) < 0.5
        assert ls["diametru_exterior_mm"] == 32

        # contor — debit 4.5 × 1.2 = 5.4 → first qmax >= 5.4 = G4 (qmax 6.0)
        c = d.get("contor")
        assert c is not None
        assert c["recomandat"]["model"] == "G4"
        assert c["recomandat"]["qmax"] == 6.0

        # regulator — JP, qmax_jp >= 5.175 AND p_intrare_max >= 2.0 → FE6-25 (qmax_jp=10)
        rg = d.get("regulator")
        assert rg is not None
        assert rg["recomandat"]["model"] == "FE6-25"
        assert rg["recomandat"]["qmax_jp"] == 10

        # catalogs counts
        cats = d.get("catalogs", {})
        assert cats.get("pe100_sdr11_count") == 14
        assert cats.get("contoare_count") == 15
        assert cats.get("regulatoare_count") == 7

    def test_partial_payload_no_debit(self, headers):
        body = {"dn_size": 63}
        r = requests.post(f"{BASE_URL}/api/placeholders/smart-sizing", json=body, headers=headers, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "latime_sant" in d
        assert "contor" not in d
        assert "regulator" not in d


# ---------------------------------------------------------------------------
# 3. POST /api/placeholders/materials/auto-suggest
# ---------------------------------------------------------------------------
class TestMaterialsAutoSuggest:
    def test_branchament_pe100_jp(self, headers):
        body = {
            "data": {
                "tipul_lucrarii": "Branșament gaze naturale (BR)",
                "sf_diametru_nominal_DN": "DN 32",
                "sf_material_conducta": "PE 100 SDR 11",
                "presiune_categorie": "JOASA PRESIUNE (<0.05 bar)",
            }
        }
        r = requests.post(f"{BASE_URL}/api/placeholders/materials/auto-suggest",
                          json=body, headers=headers, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("total_available") == 554, f"total={d.get('total_available')}"
        assert d.get("count_returned") <= 30
        assert d.get("count_returned") >= 1
        sug = d.get("suggestions", [])
        assert len(sug) == d["count_returned"]
        # Each item must have code+name OR denumire
        first = sug[0]
        has_code = any(k in first for k in ("code", "cod"))
        has_name = any(k in first for k in ("name", "denumire"))
        assert has_code or has_name, f"item keys: {list(first.keys())}"


# ---------------------------------------------------------------------------
# 4. Regression
# ---------------------------------------------------------------------------
class TestRegression:
    def test_registry_counts(self, headers):
        r = requests.get(f"{BASE_URL}/api/placeholders/registry", headers=headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        # Accept registry shape with categories/sections/fields
        # Count fields across categories
        assert len(d.get("categories", {})) == 8
        assert len(d.get("sections", {})) == 32
        assert len(d.get("fields", [])) == 221

    def test_dossier_zip(self, headers):
        r = requests.get(f"{BASE_URL}/api/gas-project/{PID}/dossier.zip", headers=headers, timeout=60)
        assert r.status_code == 200
        # Count files inside the zip
        import io, zipfile
        z = zipfile.ZipFile(io.BytesIO(r.content))
        names = z.namelist()
        assert len(names) == 34, f"got {len(names)} files: {names[:5]}"

    def test_smart_fill_validate(self, headers):
        body = {"data": {"sf_diametru_nominal_DN": "DN 32", "presiune_categorie": "JOASA PRESIUNE (<0.05 bar)"},
                "trigger": "presiune_categorie"}
        r = requests.post(f"{BASE_URL}/api/placeholders/smart-fill", json=body, headers=headers, timeout=15)
        assert r.status_code == 200
        assert "derived" in r.json()

        r2 = requests.post(f"{BASE_URL}/api/placeholders/validate", json={"data": {"sudor_cnp": "123"}},
                           headers=headers, timeout=15)
        assert r2.status_code == 200
        assert r2.json().get("valid") is False
