"""V6.0 — Gas Documentation Studio E2E.

Validează flow-ul complet de generare documentație legală pentru gaze naturale:
- Create project + completare câmpuri
- Calc engine (simultaneitate, dimensionare, Renouard)
- Generare DOCX per template (8 template-uri)
- Generare ZIP dosar complet
- Semnătură SHA-256 + QR + verify public
- Validare CNP/CUI ANAF
"""
import io
import os
import zipfile

import requests

BACKEND = os.environ.get("BACKEND_URL", "http://localhost:8001")
API = f"{BACKEND}/api"
EMAIL = "dragosserban95@gmail.com"
PWD = "Test12345"


def _login():
    r = requests.post(f"{API}/auth/login", json={"email": EMAIL, "password": PWD}, timeout=10)
    assert r.status_code == 200, f"login failed: {r.text}"
    return r.json()["token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_v60_health_and_catalog():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    r = requests.get(f"{API}/gas-project/catalog/countries")
    assert r.status_code == 200
    data = r.json()
    assert "countries" in data
    assert any(c["code"] == "RO" and c["active"] for c in data["countries"])


def test_v60_validator_cnp_cui():
    """Validare ANAF — algoritmi pondere CNP/CUI."""
    # Valid CUI Energy Project Design SRL = 43151074
    r = requests.post(f"{API}/gas-project/validate", json={"cui": "43151074"})
    assert r.status_code == 200
    assert r.json()["cui"]["valid"] is True

    # Invalid CUI
    r = requests.post(f"{API}/gas-project/validate", json={"cui": "12345678"})
    assert r.json()["cui"]["valid"] is False

    # CNP invalid
    r = requests.post(f"{API}/gas-project/validate", json={"cnp": "1234567890123"})
    assert r.json()["cnp"]["valid"] is False


def test_v60_calc_engine():
    """Verifică formulele de inginerie reală."""
    # Simultaneitate 4 consumatori casnici → 0.7
    r = requests.post(f"{API}/gas-project/calc",
                      json={"calc": "debit_calculat",
                            "params": {"nr_consumers": 4, "debit_individual_mc_h": 3.5, "consumer_type": "casnic"}})
    assert r.status_code == 200
    d = r.json()
    assert d["ks"] == 0.7
    assert d["debit_calculat_mc_h"] == 9.8

    # Dimensionare PE 100 SDR 11, 50m, 12 m³/h, joasă presiune → DN 32
    r = requests.post(f"{API}/gas-project/calc",
                      json={"calc": "dimensionare_conducta",
                            "params": {"regime": "joasa", "length_m": 50, "debit_mc_h": 12.0, "material": "PE 100 SDR 11"}})
    assert r.status_code == 200
    rec = r.json()["recommended"]
    assert rec["DN"] in (32, 40, 50)  # depending on params

    # Validare adâncime pozare 0.9m sub trotuar
    r = requests.post(f"{API}/gas-project/calc",
                      json={"calc": "validare_adancime_pozare",
                            "params": {"adancime_m": 0.9, "zona": "trotuar"}})
    assert r.status_code == 200
    assert r.json()["verdict"] == "OK"


def test_v60_full_flow_gas_documentation():
    """E2E: create → calc → sign → QR → download 8 docs + ZIP."""
    token = _login()
    headers = _auth(token)

    # Create project with rich data
    payload = {
        "title": "Test V6.0 Branșament Casnic",
        "country": "RO",
        "subdomain": "bransament-casnic",
        "data": {
            "beneficiar_nume": "Ion Popescu Test",
            "beneficiar_cnp_cui": "1880101040026",
            "beneficiar_telefon": "0722123456",
            "beneficiar_email": "ion@example.ro",
            "beneficiar_adresa": "Str. Aurel Vlaicu 15, București",
            "loc_consum_adresa": "Str. Aurel Vlaicu 15",
            "loc_consum_judet": "București",
            "loc_consum_localitate": "București",
            "loc_consum_cadastru": "12345-67890",
            "scop_lucrare": "Branșament nou",
            "tip_consumator": "Casnic",
            "regim_functionare": "Permanent",
            "debit_instalat_mc_h": 4.5,
            "consum_anual_mc": 1200,
            "sf_solutie_tehnica": "Branșament PE 100 SDR 11, DN 32, lungime 25 m",
            "sf_lungime_conducta_m": 25,
            "sf_material_conducta": "PE 100 SDR 11",
            "sf_diametru_nominal_DN": "32",
            "sf_presiune_max_op_bar": 0.05,
            "cu_numar": "CU 123/2026",
            "cu_data_emitere": "2026-03-15",
            "atr_numar": "ATR 456/2026",
            "atr_osd": "Distrigaz Sud Rețele",
            "ac_numar": "AC 789/2026",
            "ac_data_emitere": "2026-04-20",
            "dtac_proiectant_specialitate": "Energy Project Design SRL",
            "dtac_atestat_proiectant": "PDD/2022/0001",
            "exec_firma": "Energy Project Design SRL",
            "exec_responsabil_tehnic": "Ing. Test RTE",
            "proba_rezultat": "Admis",
        }
    }
    r = requests.post(f"{API}/gas-project", json=payload, headers=headers)
    assert r.status_code == 200, r.text
    pid = r.json()["pid"]

    # Sign
    r = requests.post(f"{API}/gas-project/{pid}/sign", json={"note": "Test"}, headers=headers)
    assert r.status_code == 200
    assert len(r.json()["signature_hash"]) == 64  # SHA-256

    # QR
    r = requests.get(f"{API}/gas-project/{pid}/qr", headers=headers)
    assert r.status_code == 200
    assert r.json()["qr_png_b64"].startswith("data:image/png;base64,")

    # Public verify (no auth needed)
    r = requests.get(f"{API}/gas-project/{pid}/public")
    assert r.status_code == 200
    assert r.json()["status"] == "signed"

    # List templates
    r = requests.get(f"{API}/gas-project/doc-templates")
    assert r.status_code == 200
    templates = r.json()["templates"]
    assert len(templates) == 8

    # Download each individual DOCX
    for tpl in templates:
        r = requests.get(f"{API}/gas-project/{pid}/doc/{tpl['id']}", headers=headers)
        assert r.status_code == 200, f"Template {tpl['id']} failed: {r.text[:100]}"
        assert r.headers["content-type"].startswith("application/vnd.openxmlformats")
        assert len(r.content) > 10000, f"Template {tpl['id']} too small: {len(r.content)} bytes"

    # Download full ZIP dossier
    r = requests.get(f"{API}/gas-project/{pid}/dossier.zip", headers=headers)
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/zip"

    zf = zipfile.ZipFile(io.BytesIO(r.content))
    names = zf.namelist()
    assert len(names) == 9  # 8 DOCX + 1 manifest
    assert any("MANIFEST" in n for n in names)
    assert sum(1 for n in names if n.endswith(".docx")) == 8

    # Cleanup
    requests.delete(f"{API}/gas-project/{pid}", headers=headers)


def test_v60_full_flow_idempotent():
    """Re-running creates a new project each time."""
    token = _login()
    r = requests.post(f"{API}/gas-project",
                      json={"title": "Idempotent test", "country": "RO", "subdomain": "bransament-casnic"},
                      headers=_auth(token))
    assert r.status_code == 200
    pid = r.json()["pid"]
    assert pid.startswith("gp_")

    # Get back
    r = requests.get(f"{API}/gas-project/{pid}", headers=_auth(token))
    assert r.status_code == 200
    assert r.json()["status"] == "draft"

    # Cleanup
    requests.delete(f"{API}/gas-project/{pid}", headers=_auth(token))
