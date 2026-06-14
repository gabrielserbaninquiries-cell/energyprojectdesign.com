"""
qes_signature — Qualified Electronic Signature integration stubs.

Provides a unified interface for Romanian QES providers:
  - DigiSign (https://www.digisign.ro)
  - certSIGN (https://www.certsign.ro)
  - Trans Sped (https://www.transsped.ro)

Currently provides STUB implementation that hashes the document and tags it
with a fake-but-realistic certificate metadata structure. When the user
provides API contracts + credentials, the `sign_document_via_*` functions
are swapped to call the real REST APIs.

Endpoints exposed (under /api/qes/...):
  GET  /providers              → list of supported providers
  POST /sign                   → sign a docx by hash (returns certificate + signed bundle)
  POST /verify                 → verify a signature on uploaded bundle
"""
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from pydantic import BaseModel
import hashlib
import base64
import secrets

router = APIRouter(prefix="/api/qes-v2", tags=["qes-v2"])

# ============================================================================
# PROVIDER CATALOG — official Romanian QES providers (ANCOM accredited)
# ============================================================================
QES_PROVIDERS = {
    "digisign": {
        "id": "digisign",
        "name": "DigiSign S.A.",
        "url": "https://www.digisign.ro",
        "ancom_id": "5/2007",
        "supports": ["RSA", "ECDSA"],
        "format": "PAdES-LTA (PDF) + XAdES (XML)",
        "valid_until_eu_eidas": True,
        "api_endpoint_template": "https://api.digisign.ro/v3/sign",  # placeholder, real contract pendant
        "status": "STUB",  # stub | live
    },
    "certsign": {
        "id": "certsign",
        "name": "certSIGN S.A.",
        "url": "https://www.certsign.ro",
        "ancom_id": "1/2007",
        "supports": ["RSA", "ECDSA"],
        "format": "PAdES-LTA + XAdES + CAdES",
        "valid_until_eu_eidas": True,
        "api_endpoint_template": "https://api.certsign.ro/v2/sign",
        "status": "STUB",
    },
    "transsped": {
        "id": "transsped",
        "name": "Trans Sped S.R.L.",
        "url": "https://www.transsped.ro",
        "ancom_id": "8/2007",
        "supports": ["RSA"],
        "format": "PAdES-LTA + XAdES",
        "valid_until_eu_eidas": True,
        "api_endpoint_template": "https://api.transsped.ro/v1/sign",
        "status": "STUB",
    },
}


# ============================================================================
# REQUEST / RESPONSE MODELS
# ============================================================================
class SignRequest(BaseModel):
    provider: str  # digisign | certsign | transsped
    document_hash: str  # SHA-256 of document bytes
    document_filename: str
    signer_cnp: str  # 13-digit
    signer_name: str
    cert_pin: Optional[str] = None  # mock for now


class VerifyRequest(BaseModel):
    signature_bundle: str  # base64-encoded JSON
    document_hash: str


# ============================================================================
# STUB IMPLEMENTATIONS (replace with real API calls when user provides contract)
# ============================================================================
def _stub_sign(req: SignRequest, provider: Dict[str, Any]) -> Dict[str, Any]:
    """Mock signing — produces a deterministic but realistic-looking certificate."""
    serial = secrets.token_hex(8).upper()
    now = datetime.now(timezone.utc)
    cert_payload = {
        "format": provider["format"].split(" + ")[0],
        "issuer": f"CN={provider['name']}, O=Romania, OU=Qualified CA",
        "subject": f"CN={req.signer_name}, SERIALNUMBER=PNOROO-{req.signer_cnp}",
        "serial_number": f"0x{serial}",
        "valid_from": now.isoformat(),
        "valid_to": (now + timedelta(days=3 * 365)).isoformat(),
        "algorithm": "SHA256withRSA",
        "key_usage": ["digitalSignature", "nonRepudiation"],
        "extended_key_usage": ["clientAuth", "emailProtection", "1.3.6.1.4.1.311.10.3.12 (Document Signing)"],
        "policy_oid": "0.4.0.194112.1.2 (qcp-natural-qscd)",
        "is_qualified": True,
        "ancom_accredited": True,
    }
    # Compute signature value (mocked but deterministic)
    seed = f"{provider['id']}|{req.document_hash}|{req.signer_cnp}|{serial}".encode()
    signature_value = base64.b64encode(hashlib.sha256(seed).digest()).decode()
    # PAdES bundle structure (would be embedded into PDF in real flow)
    bundle = {
        "provider": provider["id"],
        "provider_name": provider["name"],
        "document_hash_sha256": req.document_hash,
        "document_filename": req.document_filename,
        "signature_value_base64": signature_value,
        "certificate": cert_payload,
        "signed_at": now.isoformat(),
        "timestamp_authority": "TSA-DigiSign / RFC 3161",
        "long_term_validation": True,
        "stub": True,  # IMPORTANT: switch to false when real API integrated
    }
    return bundle


def _stub_verify(req: VerifyRequest) -> Dict[str, Any]:
    """Mock verification."""
    try:
        bundle = base64.b64decode(req.signature_bundle).decode()
        import json as _json
        parsed = _json.loads(bundle)
        # Verify the document hash matches
        hash_match = parsed.get("document_hash_sha256") == req.document_hash
        return {
            "valid": hash_match and parsed.get("stub", True),
            "provider": parsed.get("provider"),
            "signer": parsed.get("certificate", {}).get("subject", ""),
            "signed_at": parsed.get("signed_at"),
            "is_qualified": parsed.get("certificate", {}).get("is_qualified", False),
            "long_term_validation": parsed.get("long_term_validation", False),
            "hash_match": hash_match,
            "stub_verification": True,
        }
    except Exception as e:
        return {"valid": False, "error": str(e)}


# ============================================================================
# ROUTES
# ============================================================================
@router.get("/providers")
async def list_providers():
    """List supported QES providers."""
    return {
        "providers": list(QES_PROVIDERS.values()),
        "note": "Toți cei 3 furnizori sunt acreditați ANCOM. Stub activ — integrare API reală pendingă pe contracte.",
    }


@router.post("/sign")
async def sign_document(body: SignRequest):
    """Sign a document hash via the chosen QES provider."""
    provider = QES_PROVIDERS.get(body.provider)
    if not provider:
        raise HTTPException(400, f"Provider inexistent. Disponibili: {list(QES_PROVIDERS.keys())}")
    if not body.document_hash or len(body.document_hash) != 64:
        raise HTTPException(400, "document_hash trebuie să fie SHA-256 hex (64 caractere)")
    if not body.signer_cnp or len(body.signer_cnp) != 13:
        raise HTTPException(400, "signer_cnp trebuie să aibă 13 cifre")

    bundle = _stub_sign(body, provider)
    bundle_b64 = base64.b64encode(__import__("json").dumps(bundle).encode()).decode()
    return {
        "bundle_base64": bundle_b64,
        "certificate_serial": bundle["certificate"]["serial_number"],
        "signed_at": bundle["signed_at"],
        "valid_to": bundle["certificate"]["valid_to"],
        "provider": provider["name"],
        "is_stub": True,
        "next_step": "When real API contracts are provided, _stub_sign() will be replaced with sign_document_via_{provider}() that calls the actual REST endpoint with cert_pin authentication.",
    }


@router.post("/verify")
async def verify_signature(body: VerifyRequest):
    """Verify a signature bundle against a document hash."""
    result = _stub_verify(body)
    return result


def register_into(app, db, get_current_user):
    """Mount the router into the main app."""
    app.include_router(router)
