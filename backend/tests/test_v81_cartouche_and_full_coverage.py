"""
V8.1 — 100% placeholder coverage + project CARTOUCHE + 3-col footer signature.

Verifies:
  - Caiet Sarcini: new section 4.1 Detalii tehnologice (Electrofuziune, Cupru, 2.5,
    PVC rigid Ø110, Wavin, 0.5) + 4.2 Repartiție traseu + 4.3 Conductă existentă.
  - Memoriu tehnic: CARTOUCHE block at the top (DTAC + PTH, REDUSA PRESIUNE,
    OL OSD 4567, denumire_lucrare_extinsa) + sections 4.1/4.2/4.3/4.4/6 still present.
  - Carte tehnica: CARTOUCHE + 3-col footer signature
    (Proiectant PDD/2022/0001, Executant EDD/2023/0145, Verificator VGD-LEG-7821).
  - Borderou: CARTOUCHE + materiale catalog codes
    (OSD-COD-23445 / OSD-COD-23446 / OSD-COD-87921).
  - pv_calitate: section 5 (Verdict probă presiune) + section 6 (Mențiuni speciale)
    appear when proba_admisa / mentiuni are populated; pv_calitate_nr accepted.
  - REGRESSION: all 26 templates render 200 OK + size > 5KB (the new 3-col
    footer must not break any existing template).
  - REGRESSION: POST /api/payments/checkout returns Stripe URL + session_id.
  - REGRESSION: GET /api/me/billing returns current_plan + transactions + activations.
"""
import io
import os
import zipfile

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"

ADMIN_EMAIL = "dragosserban95@gmail.com"
ADMIN_PASSWORD = "Test12345"
PID = "gp_e79e2810cc64b5b4"

# Full registry of doc keys (base 17 + extra 9 = 26)
ALL_TEMPLATES = [
    # base
    "cerere_cu", "cerere_atr", "cerere_aviz_apa", "cerere_aviz_electrica",
    "cerere_aviz_drumuri", "cerere_aviz_politie", "cerere_aviz_mediu",
    "cerere_aviz_iscir", "memoriu_tehnic", "caiet_sarcini", "borderou",
    "anunt_incepere", "predare_amplasament", "dispozitie_santier",
    "cerere_pif", "pv_receptie", "carte_tehnica",
    # extra
    "pv_lucrari_ascunse", "pv_faza_determinanta", "program_control_calitate",
    "referat_verificator", "notificare_isc", "as_built",
    "dtac_lista_avize", "pv_calitate", "program_faze_isc",
]


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
    """Extract all text/xml from a DOCX for assertion."""
    try:
        with zipfile.ZipFile(io.BytesIO(content_bytes)) as z:
            txt = []
            for n in z.namelist():
                if n.startswith("word/") and n.endswith(".xml"):
                    try:
                        txt.append(z.read(n).decode("utf-8", errors="ignore"))
                    except Exception:
                        pass
            return "\n".join(txt)
    except Exception as e:
        return f"<not a zip: {e}>"


def _fetch_docx(auth_headers, key: str):
    r = requests.get(
        f"{BASE_URL}/api/gas-project/{PID}/doc/{key}",
        headers=auth_headers,
        timeout=60,
    )
    return r


# ----------------------------- New caiet_sarcini coverage -----------------------------
class TestCaietSarciniExtended:
    def test_caiet_sarcini_new_sections(self, auth_headers):
        r = _fetch_docx(auth_headers, "caiet_sarcini")
        assert r.status_code == 200, f"status {r.status_code}: {r.text[:300]}"
        assert r.content[:2] == b"PK"
        assert len(r.content) > 5000, f"unexpectedly small: {len(r.content)}"
        text = _docx_text(r.content)

        # Section 4.1 Detalii tehnologice de pozare (12 fields)
        markers_41 = [
            "Electrofuziune",          # tip_sudura
            "Cupru",                   # fir_trasor_material
            "2.5",                     # fir_trasor_sectiune_mm2
            "PVC rigid",               # tub_protectie
            "Wavin",                   # manșoane Wavin
            "0.5",                     # pozare_distanta_limita
        ]
        present_41 = [m for m in markers_41 if m in text]
        assert len(present_41) >= 4, (
            f"caiet_sarcini 4.1 Detalii tehnologice missing markers; "
            f"present={present_41}, expected≥4 of {markers_41}"
        )

        # Section 4.2 Repartiție traseu (lungime_pe_drum_m, traseu_pe_drum)
        markers_42 = ["18", "Trotuar", "carosabil"]
        present_42 = [m for m in markers_42 if m in text]
        assert len(present_42) >= 1, (
            f"caiet_sarcini 4.2 Repartiție traseu missing markers; present={present_42}"
        )

        # Section 4.3 Conductă existentă
        markers_43 = ["Aurel Vlaicu", "PE 100", "DN 110", "SDR 11", "1.5 bar"]
        present_43 = [m for m in markers_43 if m in text]
        assert len(present_43) >= 2, (
            f"caiet_sarcini 4.3 Conductă existentă missing markers; present={present_43}"
        )

    def test_caiet_sarcini_cartouche_block(self, auth_headers):
        r = _fetch_docx(auth_headers, "caiet_sarcini")
        assert r.status_code == 200
        text = _docx_text(r.content)
        # Cartouche markers: faza_proiectare, presiune_categorie, ordin_lucru, ISC
        cartouche_markers = [
            "DTAC", "PTH",
            "REDUSA PRESIUNE", "0.05",
            "OL OSD 4567",
            "ISC-NOTIF",
        ]
        present = [m for m in cartouche_markers if m in text]
        assert len(present) >= 3, (
            f"caiet_sarcini CARTOUCHE missing markers; present={present}, "
            f"expected≥3 of {cartouche_markers}"
        )


# ----------------------------- Memoriu cartouche -----------------------------
class TestMemoriuCartouche:
    def test_memoriu_tehnic_cartouche_and_sections(self, auth_headers):
        r = _fetch_docx(auth_headers, "memoriu_tehnic")
        assert r.status_code == 200
        assert r.content[:2] == b"PK"
        text = _docx_text(r.content)

        # Cartouche markers
        cart = ["DTAC", "PTH", "REDUSA PRESIUNE", "OL OSD 4567", "ISC-NOTIF",
                "Branșament", "locuință"]
        cart_present = [m for m in cart if m in text]
        assert len(cart_present) >= 3, (
            f"memoriu CARTOUCHE missing; present={cart_present}, expected≥3"
        )

        # Existing sections still present
        prior = ["Vaillant", "0.30", "Categoria", "Exigențe"]
        prior_present = [m for m in prior if m in text]
        assert len(prior_present) >= 2, (
            f"memoriu prior section markers missing; present={prior_present}"
        )


# ----------------------------- Carte tehnică 3-col footer -----------------------------
class TestCarteTehnica3ColFooter:
    def test_carte_tehnica_3col_signature(self, auth_headers):
        r = _fetch_docx(auth_headers, "carte_tehnica")
        assert r.status_code == 200
        assert r.content[:2] == b"PK"
        text = _docx_text(r.content)
        # 3-col footer: Proiectant / Executant / Verificator
        roles = ["Proiectant", "Executant", "Verificator"]
        roles_present = [m for m in roles if m in text]
        assert len(roles_present) == 3, (
            f"carte_tehnica missing 3-col roles; present={roles_present}"
        )
        # ANRE authorization details
        anre = ["PDD/2022/0001", "EDD/2023/0145", "VGD-LEG-7821"]
        anre_present = [m for m in anre if m in text]
        assert len(anre_present) >= 2, (
            f"carte_tehnica missing ANRE details; present={anre_present}, "
            f"expected≥2 of {anre}"
        )


# ----------------------------- Borderou cartouche + materiale -----------------------------
class TestBorderouCartoucheAndMateriale:
    def test_borderou_cartouche_and_codes(self, auth_headers):
        r = _fetch_docx(auth_headers, "borderou")
        assert r.status_code == 200
        assert r.content[:2] == b"PK"
        text = _docx_text(r.content)
        # Cartouche
        cart = ["DTAC", "PTH", "REDUSA", "OL OSD", "ISC"]
        cart_present = [m for m in cart if m in text]
        assert len(cart_present) >= 2, (
            f"borderou cartouche missing; present={cart_present}"
        )
        # Materiale catalog codes
        codes = ["OSD-COD-23445", "OSD-COD-23446", "OSD-COD-87921"]
        codes_present = [c for c in codes if c in text]
        assert len(codes_present) >= 2, (
            f"borderou materiale catalog codes missing; present={codes_present}"
        )


# ----------------------------- pv_calitate new sections 5/6 -----------------------------
class TestPvCalitateSections5And6:
    def test_pv_calitate_sections_5_and_6(self, auth_headers):
        r = _fetch_docx(auth_headers, "pv_calitate")
        assert r.status_code == 200
        assert r.content[:2] == b"PK"
        text = _docx_text(r.content)
        # Section 5 (Verdict probă presiune) — proba_admisa populated
        # Section 6 (Mențiuni speciale) — mentiuni populated
        # And accepts pv_calitate_nr
        nr_markers = ["PV-CC-23/2026", "PV-CC", "Verdict", "probă presiune",
                      "Mențiuni", "speciale", "CORESPUNZ"]
        present = [m for m in nr_markers if m in text]
        assert len(present) >= 3, (
            f"pv_calitate sections 5+6 markers missing; present={present}"
        )


# ----------------------------- REGRESSION: all 26 templates render -----------------------------
class TestAllTemplatesRegression:
    """Critical: the new 3-col footer signature must not break any existing template."""

    @pytest.mark.parametrize("key", ALL_TEMPLATES)
    def test_template_renders_200_and_valid_docx(self, auth_headers, key):
        r = _fetch_docx(auth_headers, key)
        assert r.status_code == 200, (
            f"template {key} returned {r.status_code}: {r.text[:300]}"
        )
        assert r.content[:2] == b"PK", f"template {key} is not a valid DOCX (zip)"
        assert len(r.content) > 5000, (
            f"template {key} unexpectedly small: {len(r.content)} bytes"
        )

    def test_dossier_zip_still_complete(self, auth_headers):
        r = requests.get(
            f"{BASE_URL}/api/gas-project/{PID}/dossier.zip",
            headers=auth_headers,
            timeout=180,
        )
        assert r.status_code == 200
        assert r.content[:2] == b"PK"
        with zipfile.ZipFile(io.BytesIO(r.content)) as z:
            names = z.namelist()
        docx_files = [n for n in names if n.lower().endswith(".docx")]
        manifests = [n for n in names if "MANIFEST" in n.upper()]
        assert len(docx_files) >= 26, (
            f"expected ≥26 DOCX in dossier, got {len(docx_files)}"
        )
        assert len(manifests) >= 1, f"manifest missing, files: {names}"


# ----------------------------- REGRESSION: Stripe + billing -----------------------------
class TestPaymentsBillingRegression:
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
        assert data["url"].startswith("https://checkout.stripe.com/"), (
            f"bad url: {data['url']}"
        )
        assert isinstance(data["session_id"], str) and len(data["session_id"]) > 5

    def test_me_billing_shape(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/me/billing", headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"status {r.status_code}: {r.text[:300]}"
        data = r.json()
        for k in ("current_plan", "transactions", "activations"):
            assert k in data, f"missing {k}: {data}"
        cp = data["current_plan"]
        for k in ("plan_id", "name", "price_eur", "renews_at"):
            assert k in cp, f"current_plan missing {k}: {cp}"
        assert isinstance(data["transactions"], list)
        assert isinstance(data["activations"], list)
