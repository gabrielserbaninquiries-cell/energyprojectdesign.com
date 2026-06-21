"""V9.2 backend tests:
- new placeholder engineering endpoints (groapa-sudare, tub-protectie, probe-presiune, consumatori-debit)
- updated plans pricing + VGD verificator features + profile_config
- backend up with new Stripe live key (no crash)
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- backend boot / Stripe key load ---
class TestBackendBoot:
    def test_plans_endpoint_loads(self, api):
        r = api.get(f"{BASE_URL}/api/plans", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# --- /api/plans V9.2 ---
EXPECTED_PRICES = {
    "free": 0, "trial": 0, "basic": 29, "operator": 59,
    "contabilitate": 49, "avize": 69, "ofertare": 79,
    "executant": 99, "proiectant": 129, "rte": 149,
    "vgd": 169, "societate": 399,
}


class TestPlansV92:
    def test_plan_count_and_prices(self, api):
        r = api.get(f"{BASE_URL}/api/plans")
        assert r.status_code == 200
        plans = {p["id"]: p for p in r.json()}
        assert len(plans) == 12, f"Expected 12 plans, got {len(plans)}"
        for pid, expected in EXPECTED_PRICES.items():
            assert pid in plans, f"Missing plan {pid}"
            assert plans[pid]["price_eur"] == expected, (
                f"{pid}: expected {expected}, got {plans[pid]['price_eur']}"
            )

    def test_vgd_value_props_verificator(self, api):
        plans = {p["id"]: p for p in api.get(f"{BASE_URL}/api/plans").json()}
        vgd_props = " | ".join(plans["vgd"]["value_props"])
        # The 4 verificator phrases required by V9.2
        for needle in [
            "Verificare proiecte tehnice primite electronic",
            "Ștampilare și autorizare digitală",
            "Retransmitere electronică",
            "Evidență proiecte pe societăți",
        ]:
            assert needle in vgd_props, f"Missing VGD prop: {needle}"

    def test_profile_config_on_pro_plans(self, api):
        plans = {p["id"]: p for p in api.get(f"{BASE_URL}/api/plans").json()}
        required = ["basic", "operator", "proiectant", "executant",
                    "avize", "ofertare", "contabilitate", "vgd", "rte", "societate"]
        for pid in required:
            pc = plans[pid].get("profile_config")
            assert pc is not None, f"{pid} missing profile_config"
            # spec: society + project_preferences
            assert "society" in pc, f"{pid}.profile_config missing 'society'"
            assert "project_preferences" in pc, f"{pid}.profile_config missing 'project_preferences'"


# --- NEW V9.2 placeholder engineering endpoints ---
class TestGasEngineeringPlaceholders:
    def test_groapa_sudare_dn63(self, api):
        r = api.post(f"{BASE_URL}/api/placeholders/groapa-sudare", json={"dn_mm": 63})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["groapa_lungime_m"] == 1.2
        assert d["groapa_latime_m"] == 1.0
        assert d["groapa_adancime_m"] == 0.6
        assert d["groapa_volum_mc"] == 0.72
        assert "NTPEE 2018" in d["norma"]

    def test_tub_protectie_dn63(self, api):
        r = api.post(f"{BASE_URL}/api/placeholders/tub-protectie", json={"dn_mm": 63})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["tub_recomandat_dn_mm"] == 125
        assert "PE 100 SDR26" in d["material_tub"] or "PE100 SDR26" in d["material_tub"]
        assert d["necesita_tub_protectie"] is False  # "nu necesar"

    def test_probe_presiune_medie(self, api):
        r = api.post(f"{BASE_URL}/api/placeholders/probe-presiune",
                     json={"regim_presiune": "medie"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["proba_rezistenta_bar"] == 9.0
        assert d["rezistenta_durata_min"] == 60
        assert d["etanseitate_bar"] == 6.0
        assert d["etanseitate_durata_h"] == 24

    def test_consumatori_debit(self, api):
        body = {"consumatori": [
            {"tip": "masina gatit", "debit_unitar_mc_h": 2.4, "numar_buc": 4},
            {"tip": "centrala", "debit_unitar_mc_h": 10, "numar_buc": 1},
        ]}
        r = api.post(f"{BASE_URL}/api/placeholders/consumatori-debit", json=body)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["debit_total_mc_h"] == 19.6
        assert 200 <= d["putere_termica_instalata_kw"] <= 215  # ~208 kW
        assert d["coeficient_simultaneitate_Ks"] == 0.75


# --- Auth still works under new Stripe key ---
class TestAuthWithLiveKey:
    def test_login_developer(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"email": "dragosserban95@gmail.com", "password": "Test12345"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data
        assert isinstance(data["token"], str) and len(data["token"]) > 10
