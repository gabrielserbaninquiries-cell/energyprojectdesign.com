"""Qualified Electronic Signature (QES) provider scaffold.

Defines an abstract interface plus a mock implementation that signs documents
using a local PKCS#12 — same as the user-uploaded certificate flow. This is a
placeholder ready to be swapped with real Romanian QES providers:

  - certSIGN (https://www.certsign.ro/) — Sign API
  - DigiSign (https://www.digisign.ro/) — eSign Cloud
  - Trans Sped (https://www.transsped.ro/) — Cloud Signing Service

Each real provider requires:
  - Paid contract + onboarding with the issuer
  - API credentials (client_id, client_secret, OAuth2 / OTP)
  - User KYC and certificate provisioning on the provider side

When you have credentials, implement a new subclass of `QESProvider` below and
register it in `PROVIDERS`. The rest of the app already routes through this
interface — no other code changes needed.
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Optional
import hashlib

from signing import sign_document as local_p12_sign


class QESProvider(ABC):
    """Abstract Qualified Electronic Signature provider."""

    id: str = "abstract"
    name: str = "Abstract QES Provider"
    requires_otp: bool = False

    @abstractmethod
    def info(self) -> Dict:
        """Return provider metadata (id, name, country, requires_otp, status)."""

    @abstractmethod
    def sign(self, document_bytes: bytes, credentials: Dict, otp: Optional[str] = None) -> Tuple[bytes, Dict]:
        """Produce a detached CMS signature and return (sig_bytes, info_dict)."""


# ---------- Mock provider (used during development) ----------
class MockQESProvider(QESProvider):
    id = "mock"
    name = "Mock QES (Dezvoltare — local .p12)"
    requires_otp = False

    def info(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "country": "RO",
            "requires_otp": False,
            "status": "active",
            "description": "Provider de testare. Folosește certificatul .p12 încărcat local.",
        }

    def sign(self, document_bytes: bytes, credentials: Dict, otp: Optional[str] = None) -> Tuple[bytes, Dict]:
        # credentials must contain 'p12_bytes' and 'password'
        p12 = credentials.get("p12_bytes")
        pwd = credentials.get("password", "")
        if not p12:
            raise ValueError("Mock provider requires a local .p12 certificate.")
        return local_p12_sign(document_bytes, p12, pwd)


# ---------- Real provider stubs (NOT IMPLEMENTED — see header) ----------
class CertSignProvider(QESProvider):
    id = "certsign"
    name = "certSIGN (România)"
    requires_otp = True

    def info(self) -> Dict:
        return {
            "id": self.id, "name": self.name, "country": "RO",
            "requires_otp": True, "status": "pending_activation",
            "description": "Necesită contract cu certSIGN + credențiale Sign API.",
            "setup_guide": [
                "1. Contactați certSIGN la sales@certsign.ro și activați Sign API.",
                "2. Obțineți: client_id, client_secret, endpoint URL.",
                "3. Adăugați-le în setări → QES → certSIGN.",
                "4. Asociați certificatul calificat alocat utilizatorului.",
            ],
        }

    def sign(self, document_bytes: bytes, credentials: Dict, otp: Optional[str] = None) -> Tuple[bytes, Dict]:
        raise NotImplementedError(
            "Integrarea certSIGN nu este activă. Adăugați credențialele API și implementați apelul către endpoint-ul oficial."
        )


class DigiSignProvider(QESProvider):
    id = "digisign"
    name = "DigiSign (România)"
    requires_otp = True

    def info(self) -> Dict:
        return {
            "id": self.id, "name": self.name, "country": "RO",
            "requires_otp": True, "status": "pending_activation",
            "description": "Necesită cont DigiSign eSign Cloud.",
            "setup_guide": [
                "1. Creați cont DigiSign eSign Cloud (https://www.digisign.ro).",
                "2. Activați API access și obțineți cheile OAuth2.",
                "3. Configurați callback URL în portalul DigiSign.",
                "4. Adăugați credențialele în setări → QES → DigiSign.",
            ],
        }

    def sign(self, document_bytes: bytes, credentials: Dict, otp: Optional[str] = None) -> Tuple[bytes, Dict]:
        raise NotImplementedError("Integrarea DigiSign nu este activă.")


class TransSpedProvider(QESProvider):
    id = "transsped"
    name = "Trans Sped (România)"
    requires_otp = True

    def info(self) -> Dict:
        return {
            "id": self.id, "name": self.name, "country": "RO",
            "requires_otp": True, "status": "pending_activation",
            "description": "Necesită cont Trans Sped Cloud Signing Service.",
            "setup_guide": [
                "1. Contactați Trans Sped pentru API access.",
                "2. Obțineți URL endpoint + credențiale.",
                "3. Adăugați-le în setări → QES → Trans Sped.",
            ],
        }

    def sign(self, document_bytes: bytes, credentials: Dict, otp: Optional[str] = None) -> Tuple[bytes, Dict]:
        raise NotImplementedError("Integrarea Trans Sped nu este activă.")


# ---------- Registry ----------
PROVIDERS: Dict[str, QESProvider] = {
    "mock": MockQESProvider(),
    "certsign": CertSignProvider(),
    "digisign": DigiSignProvider(),
    "transsped": TransSpedProvider(),
}


def list_providers() -> List[Dict]:
    return [p.info() for p in PROVIDERS.values()]


def get_provider(provider_id: str) -> QESProvider:
    if provider_id not in PROVIDERS:
        raise ValueError(f"Provider necunoscut: {provider_id}")
    return PROVIDERS[provider_id]
