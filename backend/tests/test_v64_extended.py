"""V6.4 — Smoke tests for new modules (uses live backend via requests)."""
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


def test_v64_placeholders_extended():
    r = requests.get(f"{API}/placeholders/registry")
    assert r.status_code == 200
    d = r.json()
    assert len(d["fields"]) >= 100, f"expected >=100 fields, got {len(d['fields'])}"
    sections = set(d["sections"].keys())
    for new_sec in ("faze_det", "lucrari_ascunse", "exigente", "materiale", "rvt",
                     "as_built", "isc", "carte_tehnica_sec", "comisia"):
        assert new_sec in sections, f"V6.4 section {new_sec} missing"


def test_v64_gas_templates_extra():
    r = requests.get(f"{API}/gas-project/doc-templates")
    assert r.status_code == 200
    ids = {t["id"] for t in r.json()["templates"]}
    for new_tpl in ("pv_lucrari_ascunse", "pv_faza_determinanta", "program_control_calitate",
                     "referat_verificator", "notificare_isc", "as_built"):
        assert new_tpl in ids, f"V6.4 template {new_tpl} missing"
    assert len(ids) >= 23


def test_v64_industry_templates():
    h = _auth(_login())
    for ind, min_count in (("gaze", 23), ("electric", 6), ("apa_canal", 5)):
        r = requests.get(f"{API}/industry/{ind}/templates", headers=h)
        assert r.status_code == 200, f"{ind}: {r.text}"
        assert r.json()["count"] >= min_count


def test_v64_document_packs():
    r = requests.get(f"{API}/document/packs")
    assert r.status_code == 200
    packs = {p["id"] for p in r.json()["packs"]}
    for expected in ("pachet_cu_atr", "pachet_dtac", "pachet_executie", "pachet_receptie_pif",
                      "pachet_carte_tehnica", "pachet_avize_complet"):
        assert expected in packs


def test_v64_admin_essentials_status():
    h = _auth(_login())
    r = requests.get(f"{API}/admin/essentials/status", headers=h)
    assert r.status_code == 200
    d = r.json()
    for k in ("cert_sign", "digisign", "trans_sped", "osd_distrigaz", "osd_delgaz",
              "osd_premier", "anaf_efactura", "seap", "openbanking", "isc"):
        assert k in d, f"essential {k} missing"


def test_v64_admin_essentials_save_and_redact():
    h = _auth(_login())
    r = requests.put(f"{API}/admin/config", headers=h, json={
        "cert_sign_api_url": "https://api.certsign.test",
        "cert_sign_api_key": "SECRET_KEY_NOT_RETURNED",
    })
    assert r.status_code == 200
    d = r.json()
    assert d.get("cert_sign_api_key") is None  # redacted
    assert d.get("cert_sign_api_key_set") is True
    assert d.get("cert_sign_api_url") == "https://api.certsign.test"


def test_v64_ocr_known_patterns():
    h = _auth(_login())
    r = requests.get(f"{API}/ocr/known-patterns", headers=h)
    assert r.status_code == 200
    d = r.json()
    assert len(d["patterns"]) >= 10
    assert ".docx" in d["supported_formats"]


def test_v64_ocr_extract_from_docx():
    h = _auth(_login())
    r = requests.get(f"{API}/gas-project/gp_54135e822f25f7d7/doc/referat_verificator", headers=h)
    assert r.status_code == 200
    blob = r.content
    files = {"file": ("rvt.docx", blob, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    r2 = requests.post(f"{API}/ocr/extract-fields", headers=h, files=files)
    assert r2.status_code == 200
    d = r2.json()
    assert d["field_count"] >= 2  # CUI + email + telefon din antet
    assert d["confidence"] in ("low", "medium", "high")


def test_v64_preflight_existing_project():
    h = _auth(_login())
    r = requests.post(f"{API}/document/preflight", headers=h, json={
        "pid": "gp_54135e822f25f7d7",
        "template_ids": ["cerere_cu", "memoriu_tehnic", "carte_tehnica"],
    })
    assert r.status_code == 200, r.text
    d = r.json()
    assert "overall_ready" in d
    assert all(k in d["per_template"] for k in ["cerere_cu", "memoriu_tehnic", "carte_tehnica"])


def test_v64_pack_executie_zip():
    h = _auth(_login())
    r = requests.post(f"{API}/document/packs/pachet_executie/generate", headers=h, json={
        "pid": "gp_54135e822f25f7d7"
    })
    assert r.status_code == 200, r.text
    assert r.headers["content-type"].startswith("application/zip")
    assert len(r.content) > 50_000
    # Verify contains expected 4 DOCX + manifest
    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        names = zf.namelist()
        assert any("anunt_incepere" in n for n in names)
        assert any("predare_amplasament" in n for n in names)
        assert any("program_control_calitate" in n for n in names)
        assert any("notificare_isc" in n for n in names)
        assert "MANIFEST.md" in names


def test_v64_gas_extras_dossier_includes_new_templates():
    """Verifică că dossier.zip include cele 6 template-uri V6.4."""
    h = _auth(_login())
    r = requests.get(f"{API}/gas-project/gp_54135e822f25f7d7/dossier.zip", headers=h)
    assert r.status_code == 200
    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        names = " ".join(zf.namelist())
        for new_tpl in ("pv_lucrari_ascunse", "pv_faza_determinanta", "program_control_calitate",
                         "referat_verificator", "notificare_isc", "as_built"):
            assert new_tpl in names, f"V6.4 template {new_tpl} missing from dossier"
