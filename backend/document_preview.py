"""Document Preview & Sign Engine — convert DOCX → PDF + auto-stamp + cert digital.

Flow:
1. Generate DOCX from template (via gas_doc_templates)
2. Convert DOCX → PDF (libreoffice headless OR docx2pdf)
3. Apply stamps (PNG overlays) at predefined coordinates
4. Apply digital signature (SHA-256 hash watermark + QR code)
5. Return PDF with stamp positions metadata for manual repositioning in UI

Conform `De imbunatatit la aplicatie.docx` (cerință literală):
- "previzualizare documentatie sectiune in format pdf finalizat semnat si certificat digital"
- "previzualizeaza in format word cu stampile adaugate manual pentru repozitionarea acestora"
- "certifica si stampileaza digital documente automat inainte de trimitere"
"""
from __future__ import annotations
import base64
import hashlib
import io
import os
import subprocess
import tempfile
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from auth import get_current_user
from db import db
import gas_doc_templates as doc_templates

router = APIRouter()


# ============================================================================
# Stamp Position Schema
# ============================================================================
class StampPosition(BaseModel):
    asset_aid: str  # ID-ul ștampilei (PNG/JPG) uploadate prin /api/assets/upload
    page: int = 1  # pagina pe care apare ștampila
    x_pt: float = 100.0  # poziție X în puncte (72 pt = 1 inch)
    y_pt: float = 100.0  # poziție Y în puncte
    width_pt: float = 120.0
    height_pt: float = 120.0
    rotation_deg: float = 0.0
    opacity: float = 1.0


class PreviewRequest(BaseModel):
    pid: str
    template_id: str
    section: Optional[str] = None  # proiectare | avize | executie | carte_tehnica | dispozitie_santier
    stamps: List[StampPosition] = []
    auto_certify: bool = False  # adaugă watermark cu hash SHA-256 + QR
    output_format: str = "pdf"  # pdf | docx


# ============================================================================
# DOCX → PDF Conversion
# ============================================================================
def _docx_to_pdf(docx_bytes: bytes) -> bytes:
    """Convertește DOCX → PDF folosind libreoffice (fallback: returnează DOCX dacă LO lipsă)."""
    with tempfile.TemporaryDirectory() as tmp:
        in_path = os.path.join(tmp, "doc.docx")
        with open(in_path, "wb") as f:
            f.write(docx_bytes)
        # Try libreoffice (binary may be 'libreoffice' or 'soffice')
        for bin_name in ("libreoffice", "soffice"):
            try:
                # Each conversion uses isolated profile dir to avoid lock contention
                profile_dir = os.path.join(tmp, "lo_profile")
                subprocess.run(
                    [bin_name, f"-env:UserInstallation=file://{profile_dir}",
                     "--headless", "--convert-to", "pdf", "--outdir", tmp, in_path],
                    capture_output=True, timeout=60, check=False,
                )
                pdf_path = os.path.join(tmp, "doc.pdf")
                if os.path.exists(pdf_path):
                    with open(pdf_path, "rb") as f:
                        return f.read()
            except (FileNotFoundError, subprocess.TimeoutExpired):
                continue
            except Exception:
                continue
        # Fallback: return DOCX bytes (UI can show as Word preview)
        return docx_bytes


# ============================================================================
# Stamp Overlay on PDF
# ============================================================================
def _apply_stamps_to_pdf(pdf_bytes: bytes, stamps: List[Dict[str, Any]], assets_b64: Dict[str, str]) -> bytes:
    """Adaugă ștampilele PNG/JPG pe paginile PDF la coordonatele specificate."""
    if not stamps:
        return pdf_bytes
    try:
        from pypdf import PdfReader, PdfWriter
        from pypdf.generic import RectangleObject
        from reportlab.pdfgen import canvas
        from reportlab.lib.utils import ImageReader

        reader = PdfReader(io.BytesIO(pdf_bytes))
        writer = PdfWriter()

        # Build overlay per page
        overlays_per_page: Dict[int, List[Dict[str, Any]]] = {}
        for s in stamps:
            page_idx = max(0, (s.get("page") or 1) - 1)
            overlays_per_page.setdefault(page_idx, []).append(s)

        for i, page in enumerate(reader.pages):
            if i in overlays_per_page:
                # Build a single overlay PDF page with all stamps
                page_w = float(page.mediabox.width)
                page_h = float(page.mediabox.height)
                ovr_buf = io.BytesIO()
                c = canvas.Canvas(ovr_buf, pagesize=(page_w, page_h))
                for s in overlays_per_page[i]:
                    aid = s.get("asset_aid")
                    b64 = assets_b64.get(aid)
                    if not b64:
                        continue
                    try:
                        img_data = base64.b64decode(b64)
                        img = ImageReader(io.BytesIO(img_data))
                        x = float(s.get("x_pt", 100))
                        y = page_h - float(s.get("y_pt", 100)) - float(s.get("height_pt", 120))
                        w = float(s.get("width_pt", 120))
                        h = float(s.get("height_pt", 120))
                        c.saveState()
                        c.setFillAlpha(float(s.get("opacity", 1.0)))
                        if s.get("rotation_deg"):
                            c.translate(x + w / 2, y + h / 2)
                            c.rotate(float(s["rotation_deg"]))
                            c.translate(-(x + w / 2), -(y + h / 2))
                        c.drawImage(img, x, y, width=w, height=h, mask="auto")
                        c.restoreState()
                    except Exception:
                        continue
                c.save()
                ovr_buf.seek(0)
                ovr_reader = PdfReader(ovr_buf)
                page.merge_page(ovr_reader.pages[0])
            writer.add_page(page)

        out_buf = io.BytesIO()
        writer.write(out_buf)
        return out_buf.getvalue()
    except ImportError:
        return pdf_bytes
    except Exception:
        return pdf_bytes


# ============================================================================
# Digital Certificate Watermark
# ============================================================================
def _apply_certificate_watermark(pdf_bytes: bytes, proj: Dict[str, Any], template_id: str) -> Tuple[bytes, str]:
    """Adaugă footer cu SHA-256 hash + QR code public pe fiecare pagină."""
    try:
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen import canvas
        import qrcode

        # Compute hash
        h = hashlib.sha256()
        h.update(pdf_bytes)
        h.update(template_id.encode())
        h.update((proj.get("pid", "") + proj.get("title", "")).encode())
        signature_hash = h.hexdigest()

        # Public verify URL
        base = os.environ.get("PUBLIC_VERIFY_BASE", "https://energyprojectdesign.com")
        verify_url = f"{base}/verify/gas-project/{proj.get('pid','')}?hash={signature_hash[:16]}"

        # Build QR
        qr = qrcode.QRCode(version=None, box_size=4, border=1)
        qr.add_data(verify_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_buf = io.BytesIO()
        qr_img.save(qr_buf, format="PNG")
        qr_buf.seek(0)

        reader = PdfReader(io.BytesIO(pdf_bytes))
        writer = PdfWriter()
        from reportlab.lib.utils import ImageReader
        qr_reader = ImageReader(qr_buf)

        for page in reader.pages:
            page_w = float(page.mediabox.width)
            page_h = float(page.mediabox.height)
            ovr = io.BytesIO()
            c = canvas.Canvas(ovr, pagesize=(page_w, page_h))
            # Footer hash
            c.setFont("Helvetica", 7)
            c.setFillGray(0.4)
            c.drawString(36, 24, f"SHA-256: {signature_hash} · Semnat: {datetime.now(timezone.utc).isoformat()[:19]}")
            c.drawString(36, 14, f"Verifică: {verify_url}")
            # QR code bottom-right
            c.drawImage(qr_reader, page_w - 60, 12, width=48, height=48, mask="auto")
            c.save()
            ovr.seek(0)
            ovr_reader = PdfReader(ovr)
            page.merge_page(ovr_reader.pages[0])
            writer.add_page(page)

        out = io.BytesIO()
        writer.write(out)
        return out.getvalue(), signature_hash
    except ImportError:
        return pdf_bytes, ""
    except Exception:
        return pdf_bytes, ""


# ============================================================================
# Main Preview Endpoint
# ============================================================================
@router.post("/preview")
async def preview_document(payload: PreviewRequest, user=Depends(get_current_user)):
    """Generează preview document (PDF sau DOCX) cu ștampile + certificare automată."""
    proj = await db.gas_projects.find_one(
        {"pid": payload.pid, "owner_id": user.user_id, "deleted": {"$ne": True}},
        {"_id": 0},
    )
    if not proj:
        raise HTTPException(404, "Proiect inexistent")

    # 1. Generate DOCX from template
    result = doc_templates.generate(payload.template_id, proj)
    if not result:
        raise HTTPException(400, f"Template necunoscut: {payload.template_id}")
    docx_bytes, fname = result

    if payload.output_format == "docx":
        # Return DOCX directly (UI shows it in Word-preview component)
        return StreamingResponse(
            io.BytesIO(docx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"inline; filename=preview_{payload.template_id}.docx"},
        )

    # 2. Convert to PDF
    pdf_bytes = _docx_to_pdf(docx_bytes)

    # 3. Load stamp assets if any
    assets_b64: Dict[str, str] = {}
    if payload.stamps:
        for s in payload.stamps:
            asset = await db.assets.find_one({"aid": s.asset_aid, "owner_id": user.user_id, "deleted": {"$ne": True}})
            if asset and asset.get("content_b64"):
                assets_b64[s.asset_aid] = asset["content_b64"]

    # 4. Apply stamps
    if payload.stamps and assets_b64:
        pdf_bytes = _apply_stamps_to_pdf(pdf_bytes, [s.model_dump() for s in payload.stamps], assets_b64)

    # 5. Auto-certify with watermark
    sig_hash = ""
    if payload.auto_certify:
        pdf_bytes, sig_hash = _apply_certificate_watermark(pdf_bytes, proj, payload.template_id)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=preview_{payload.template_id}.pdf",
            "X-Signature-Hash": sig_hash,
        },
    )


# ============================================================================
# Section Preview (multi-template)
# ============================================================================
SECTION_TEMPLATES = {
    "proiectare":         ["memoriu_tehnic", "caiet_sarcini", "borderou"],
    "avize":              ["cerere_cu", "cerere_atr", "cerere_aviz_apa", "cerere_aviz_electrica",
                           "cerere_aviz_drumuri", "cerere_aviz_politie", "cerere_aviz_mediu", "cerere_aviz_iscir"],
    "executie":           ["anunt_incepere", "predare_amplasament", "dispozitie_santier"],
    "carte_tehnica":      ["carte_tehnica", "pv_receptie"],
    "dispozitie_santier": ["dispozitie_santier"],
    "pif":                ["cerere_pif"],
}


@router.get("/sections")
async def list_sections():
    """Lista secțiunilor disponibile pentru preview consolidat."""
    return {
        "sections": [
            {"id": k, "label": k.replace("_", " ").title(), "templates": v}
            for k, v in SECTION_TEMPLATES.items()
        ]
    }


@router.post("/section/{section_id}/preview")
async def preview_section(section_id: str, payload: PreviewRequest, user=Depends(get_current_user)):
    """Generează un PDF cu TOATE template-urile dintr-o secțiune (combinat)."""
    if section_id not in SECTION_TEMPLATES:
        raise HTTPException(400, f"Secțiune necunoscută. Disponibile: {list(SECTION_TEMPLATES.keys())}")
    templates = SECTION_TEMPLATES[section_id]

    proj = await db.gas_projects.find_one(
        {"pid": payload.pid, "owner_id": user.user_id, "deleted": {"$ne": True}},
        {"_id": 0},
    )
    if not proj:
        raise HTTPException(404, "Proiect inexistent")

    # Generate ALL DOCX → PDF
    pdf_blobs: List[bytes] = []
    for tid in templates:
        result = doc_templates.generate(tid, proj)
        if result:
            docx_bytes, _ = result
            pdf_blobs.append(_docx_to_pdf(docx_bytes))

    if not pdf_blobs:
        raise HTTPException(500, "Nu s-au putut genera documentele")

    # Merge PDFs
    try:
        from pypdf import PdfReader, PdfWriter
        writer = PdfWriter()
        for blob in pdf_blobs:
            try:
                reader = PdfReader(io.BytesIO(blob))
                for page in reader.pages:
                    writer.add_page(page)
            except Exception:
                continue
        merged = io.BytesIO()
        writer.write(merged)
        merged_pdf = merged.getvalue()
    except ImportError:
        merged_pdf = pdf_blobs[0]  # fallback

    # Apply stamps + watermark
    sig_hash = ""
    if payload.stamps:
        assets_b64: Dict[str, str] = {}
        for s in payload.stamps:
            asset = await db.assets.find_one({"aid": s.asset_aid, "owner_id": user.user_id, "deleted": {"$ne": True}})
            if asset and asset.get("content_b64"):
                assets_b64[s.asset_aid] = asset["content_b64"]
        merged_pdf = _apply_stamps_to_pdf(merged_pdf, [s.model_dump() for s in payload.stamps], assets_b64)
    if payload.auto_certify:
        merged_pdf, sig_hash = _apply_certificate_watermark(merged_pdf, proj, f"section_{section_id}")

    return StreamingResponse(
        io.BytesIO(merged_pdf),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=section_{section_id}_{payload.pid}.pdf",
            "X-Signature-Hash": sig_hash,
            "X-Templates-Merged": ",".join(templates),
        },
    )
