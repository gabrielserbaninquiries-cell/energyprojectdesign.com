"""V5.8 backend regression: Rate limiting, Gas Project Studio, Subscribers B2B."""
import os
import pytest
import requests
import time

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://github-push-test.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "dragosserban95@gmail.com"
ADMIN_PASS = "Test12345"


@pytest.fixture(scope="module")
def auth():
    s = requests.Session()
    r = s.post(f"{BASE}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=30)
    assert r.status_code == 200, r.text
    token = r.json()["token"]
    s.headers.update({"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    return s


# --- Gas Project phases schema ---
def test_gas_phases():
    r = requests.get(f"{BASE}/api/gas-project/phases", timeout=20)
    assert r.status_code == 200
    phases = r.json()["phases"]
    ids = [p["id"] for p in phases]
    assert ids == ["tema", "sf", "cu", "dtac", "ac", "pt", "de", "executie", "probe", "receptie", "pif"]
    for p in phases:
        for k in ("id", "order", "name", "norm", "description", "deliverables", "fields"):
            assert k in p


# --- Gas Project CRUD + sign + QR + public ---
def test_gas_project_full_flow(auth):
    # Create
    r = auth.post(f"{BASE}/api/gas-project", json={"title": "TEST_v58 proiect gaze"})
    assert r.status_code == 200, r.text
    proj = r.json()
    pid = proj["pid"]
    assert proj["status"] == "draft" and proj["phase"] == "tema"
    assert proj["progress"]["overall_percent"] == 0

    # List
    r = auth.get(f"{BASE}/api/gas-project")
    assert r.status_code == 200
    assert any(p["pid"] == pid for p in r.json())

    # Get single
    r = auth.get(f"{BASE}/api/gas-project/{pid}")
    assert r.status_code == 200
    d = r.json()
    assert "phases_schema" in d and len(d["phases_schema"]) == 11
    assert "progress" in d

    # Patch: merge data + change phase
    fields = {
        "beneficiar_nume": "TEST SRL", "beneficiar_cnp_cui": "RO123", "loc_consum_adresa": "Str. Test 1",
        "loc_consum_judet": "Cluj", "loc_consum_localitate": "Cluj-Napoca", "scop_lucrare": "Branșament nou",
        "tip_consumator": "Casnic",
    }
    r = auth.patch(f"{BASE}/api/gas-project/{pid}", json={"data": fields, "phase": "sf"})
    assert r.status_code == 200, r.text
    upd = r.json()
    assert upd["phase"] == "sf"
    assert upd["data"]["beneficiar_nume"] == "TEST SRL"
    assert upd["progress"]["overall_percent"] > 0

    # Invalid phase rejection
    r = auth.patch(f"{BASE}/api/gas-project/{pid}", json={"phase": "nonsense"})
    assert r.status_code == 400

    # Invalid status rejection
    r = auth.patch(f"{BASE}/api/gas-project/{pid}", json={"status": "bogus"})
    assert r.status_code == 400

    # Sign
    r = auth.post(f"{BASE}/api/gas-project/{pid}/sign", json={"note": "test"})
    assert r.status_code == 200, r.text
    sig = r.json()
    assert "signature_hash" in sig and len(sig["signature_hash"]) == 64
    assert sig["signed_at"]
    # Verify status updated
    r = auth.get(f"{BASE}/api/gas-project/{pid}")
    assert r.json()["status"] == "signed"

    # QR
    r = auth.get(f"{BASE}/api/gas-project/{pid}/qr")
    assert r.status_code == 200
    q = r.json()
    assert q["qr_png_b64"].startswith("data:image/png;base64,")
    assert q["verify_url"]

    # Public (no auth)
    r = requests.get(f"{BASE}/api/gas-project/{pid}/public", timeout=20)
    assert r.status_code == 200
    pub = r.json()
    assert pub["pid"] == pid and pub["status"] == "signed"
    assert pub["beneficiar"] == "TEST SRL"
    assert "signature_hash" in pub

    # Soft delete
    r = auth.delete(f"{BASE}/api/gas-project/{pid}")
    assert r.status_code == 200 and r.json().get("ok") is True
    r = auth.get(f"{BASE}/api/gas-project/{pid}")
    assert r.status_code == 404


# --- Subscribers types + CRUD ---
def test_subscriber_types():
    r = requests.get(f"{BASE}/api/subscribers/types", timeout=20)
    assert r.status_code == 200
    types = r.json()["types"]
    ids = {t["id"] for t in types}
    assert ids == {"primarie", "asociatie_locatari", "utilitate_publica", "dezvoltator", "societate"}
    for t in types:
        for k in ("name", "icon", "description", "fields_required"):
            assert k in t


def test_subscriber_crud_and_filter(auth):
    # Create primarie
    r = auth.post(f"{BASE}/api/subscribers", json={"type": "primarie", "name": "TEST_Primaria X", "cui": "RO1"})
    assert r.status_code == 200, r.text
    sid = r.json()["sid"]
    # Create dezvoltator
    r = auth.post(f"{BASE}/api/subscribers", json={"type": "dezvoltator", "name": "TEST_Dev Y"})
    assert r.status_code == 200
    sid2 = r.json()["sid"]
    # Invalid type
    r = auth.post(f"{BASE}/api/subscribers", json={"type": "bogus", "name": "x"})
    assert r.status_code == 400
    # List all
    r = auth.get(f"{BASE}/api/subscribers")
    assert r.status_code == 200
    ids = {s["sid"] for s in r.json()}
    assert sid in ids and sid2 in ids
    # Filter
    r = auth.get(f"{BASE}/api/subscribers?type=primarie")
    assert r.status_code == 200
    items = r.json()
    assert all(s["type"] == "primarie" for s in items)
    assert any(s["sid"] == sid for s in items)
    # Patch
    r = auth.patch(f"{BASE}/api/subscribers/{sid}", json={"phone": "0700"})
    assert r.status_code == 200 and r.json()["phone"] == "0700"
    # Delete
    r = auth.delete(f"{BASE}/api/subscribers/{sid}")
    assert r.status_code == 200
    r = auth.get(f"{BASE}/api/subscribers/{sid}")
    assert r.status_code == 404
    # Cleanup second
    auth.delete(f"{BASE}/api/subscribers/{sid2}")


# --- Rate limit response shape ---
def test_ai_agent_rate_limit_shape(auth):
    """Admin/dev — single call should succeed and include rate_limit dict."""
    r = auth.post(f"{BASE}/api/ai/agents/producer", json={"message": "salut scurt"}, timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "rate_limit" in data
    rl = data["rate_limit"]
    for k in ("minute_used", "minute_limit", "day_used", "day_limit"):
        assert k in rl
    # Admin should be in priv tier (30/500)
    assert rl["minute_limit"] == 30 and rl["day_limit"] == 500
