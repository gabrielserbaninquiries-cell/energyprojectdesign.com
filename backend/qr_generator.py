"""QR code generator — folosit pentru a stampila pe documentele generate
(DOCX / PDF) un cod QR cu URL public spre `/verify/{hash}`.

Generează PNG bytes folosind biblioteca `qrcode` + Pillow.
"""
import io
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def get_frontend_base_url() -> str:
    """Determină URL-ul de bază al front-end-ului pentru link-uri publice.
    Prioritate:
      1. FRONTEND_BASE_URL (set explicit în .env)
      2. CORS_ORIGINS prima valoare
      3. Fallback Emergent preview
    """
    explicit = (os.environ.get("FRONTEND_BASE_URL") or "").strip()
    if explicit:
        return explicit.rstrip("/")
    cors = (os.environ.get("CORS_ORIGINS") or "").strip()
    if cors and cors != "*":
        first = cors.split(",")[0].strip()
        if first:
            return first.rstrip("/")
    # Last resort — Emergent production host (live deploy)
    return "https://design-energy.emergent.host"


def build_verify_url(cert_hash: str) -> str:
    base = get_frontend_base_url()
    return f"{base}/verify/{cert_hash}"


def generate_qr_png(data: str, size_px: int = 240, border: int = 2) -> Optional[bytes]:
    """Generează PNG bytes pentru un QR code cu datele furnizate.
    Întoarce `None` dacă biblioteca `qrcode` nu este disponibilă (fail-soft).
    """
    try:
        import qrcode  # type: ignore
    except ImportError:
        logger.warning("Biblioteca `qrcode` nu este instalată — QR omis.")
        return None
    try:
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=border,
        )
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        # Resize la dimensiunea cerută
        if size_px:
            img = img.resize((size_px, size_px))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()
    except Exception as e:
        logger.warning(f"Eroare generare QR: {e}")
        return None


def generate_verify_qr(cert_hash: str, size_px: int = 240) -> Optional[bytes]:
    """Helper: generează QR pentru un hash de certificare internă."""
    if not cert_hash or len(cert_hash) < 16:
        return None
    return generate_qr_png(build_verify_url(cert_hash), size_px=size_px)
