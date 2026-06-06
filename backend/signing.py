"""PKI signing using PKCS#12 (.p12 / .pfx) certificates.

Creates a CMS detached signature (.p7s) over the document bytes.
Also computes SHA-256 hash for verification metadata.
"""
import hashlib
from typing import Tuple, Dict
from cryptography.hazmat.primitives.serialization import pkcs12, Encoding, PrivateFormat, NoEncryption
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography import x509

# endesive for CMS signature
try:
    from endesive import signer as endesive_signer
    HAS_ENDESIVE = True
except Exception:
    HAS_ENDESIVE = False


def parse_p12(p12_bytes: bytes, password: str) -> Dict:
    """Extract certificate info from a PKCS#12 file."""
    pwd = password.encode("utf-8") if password else None
    private_key, cert, additional = pkcs12.load_key_and_certificates(p12_bytes, pwd)
    if cert is None:
        raise ValueError("Invalid PKCS#12: no certificate found")

    subject = cert.subject.rfc4514_string()
    issuer = cert.issuer.rfc4514_string()
    return {
        "subject": subject,
        "issuer": issuer,
        "valid_from": cert.not_valid_before_utc.isoformat() if hasattr(cert, "not_valid_before_utc") else cert.not_valid_before.isoformat(),
        "valid_to": cert.not_valid_after_utc.isoformat() if hasattr(cert, "not_valid_after_utc") else cert.not_valid_after.isoformat(),
        "serial": str(cert.serial_number),
    }


def sign_document(doc_bytes: bytes, p12_bytes: bytes, password: str) -> Tuple[bytes, Dict]:
    """Produce a detached CMS signature (.p7s) over the document bytes.

    Returns: (signature_bytes, signature_info)
    """
    pwd = password.encode("utf-8") if password else None
    private_key, cert, additional = pkcs12.load_key_and_certificates(p12_bytes, pwd)
    if private_key is None or cert is None:
        raise ValueError("Invalid PKCS#12: missing key or certificate")

    sha = hashlib.sha256(doc_bytes).hexdigest()

    # Build detached CMS signature using endesive
    if HAS_ENDESIVE:
        # endesive expects PKCS#12 bytes directly
        # sign(datau, key, cert, othercerts, hashalgo, attrs=True, signed_value=None, hsm=None, pss=False, timestampurl=None)
        signature = endesive_signer.sign(
            doc_bytes,
            private_key,
            cert,
            additional or [],
            "sha256",
        )
    else:
        # Fallback: raw RSA signature over SHA-256 hash (not CMS)
        signature = private_key.sign(
            doc_bytes,
            padding.PKCS1v15(),
            hashes.SHA256(),
        )

    info = {
        "sha256": sha,
        "subject": cert.subject.rfc4514_string(),
        "issuer": cert.issuer.rfc4514_string(),
    }
    return signature, info
