"""PDF export for a project — generates a comprehensive A4 PDF report
with project data, technical data, calc results and verification status.

Uses reportlab (pure-Python, no system deps).
"""
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER


# Palette matching the Swiss / brutalist UI
COL_ACCENT = colors.HexColor("#FFB300")
COL_BLACK = colors.HexColor("#0A0A0A")
COL_GRAY = colors.HexColor("#4B5563")
COL_LIGHT = colors.HexColor("#F9FAFB")
COL_OK = colors.HexColor("#16A34A")
COL_WARN = colors.HexColor("#FFB300")
COL_MISSING = colors.HexColor("#DC2626")


def _styles():
    base = getSampleStyleSheet()
    s = {
        "h1": ParagraphStyle("h1", parent=base["Heading1"], fontSize=20, leading=24, textColor=COL_BLACK, spaceAfter=10),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], fontSize=13, leading=18, textColor=COL_BLACK, spaceBefore=14, spaceAfter=8, borderPadding=4),
        "label": ParagraphStyle("label", parent=base["Normal"], fontSize=8, leading=10, textColor=COL_GRAY, spaceBefore=2),
        "body": ParagraphStyle("body", parent=base["Normal"], fontSize=10, leading=14, textColor=COL_BLACK),
        "small": ParagraphStyle("small", parent=base["Normal"], fontSize=8, leading=10, textColor=COL_GRAY),
        "mono": ParagraphStyle("mono", parent=base["Normal"], fontName="Courier", fontSize=8, leading=10, textColor=COL_GRAY),
    }
    return s


def _header(canvas, doc, project_name):
    canvas.saveState()
    # Top bar
    canvas.setFillColor(COL_BLACK)
    canvas.rect(0, A4[1] - 1.6 * cm, A4[0], 1.6 * cm, fill=1, stroke=0)
    canvas.setFillColor(COL_ACCENT)
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawString(2 * cm, A4[1] - 1.0 * cm, "ENERGY PROJECT DESIGN")
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(2 * cm, A4[1] - 1.35 * cm, f"Raport proiect — {project_name[:80]}")
    canvas.setFillColor(COL_ACCENT)
    canvas.drawRightString(A4[0] - 2 * cm, A4[1] - 1.0 * cm, "v4.7")
    # Footer
    canvas.setFillColor(COL_GRAY)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(2 * cm, 1.0 * cm, f"Generat: {datetime.now().strftime('%d.%m.%Y %H:%M')}")
    canvas.drawRightString(A4[0] - 2 * cm, 1.0 * cm, f"Pagina {doc.page}")
    canvas.drawCentredString(A4[0] / 2, 1.0 * cm, "ENERGY PROJECT DESIGN SRL · CUI 43151074 · J40/12982/2020")
    canvas.restoreState()


def _kv_table(rows, col_widths=(5.5 * cm, 11 * cm)):
    """Build a simple 2-column key-value table."""
    data = [[k, v if v else "—"] for k, v in rows]
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (0, -1), COL_GRAY),
        ("TEXTCOLOR", (1, 0), (1, -1), COL_BLACK),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, COL_LIGHT]),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, colors.HexColor("#E5E7EB")),
    ]))
    return t


def _section_header(text, styles):
    p = Paragraph(f'<font color="#FFB300">▍</font> <b>{text}</b>', styles["h2"])
    return KeepTogether([Spacer(1, 0.1 * cm), p, Spacer(1, 0.15 * cm)])


def build_project_pdf(project: dict, calc_results: dict = None, verification: dict = None) -> bytes:
    """Render a project to a styled A4 PDF and return the bytes."""
    buf = io.BytesIO()
    project_name = project.get("name") or project.get("beneficiar") or "Proiect"
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2.5 * cm, bottomMargin=1.8 * cm,
        title=f"Raport proiect — {project_name}",
        author="ENERGY PROJECT DESIGN SRL",
    )
    styles = _styles()
    story = []

    # Title block
    story.append(Paragraph(project_name, styles["h1"]))
    story.append(Paragraph(
        f'<font color="#6B7280">{project.get("industry", "—")} / {project.get("subdomain", "—")} · '
        f'Completare: {project.get("completion", 0)}%</font>',
        styles["small"],
    ))
    story.append(Spacer(1, 0.4 * cm))

    # General data
    story.append(_section_header("Date generale proiect", styles))
    story.append(_kv_table([
        ("Beneficiar", project.get("beneficiar")),
        ("Adresa lucrare", project.get("adresa_lucrare")),
        ("Localitate", project.get("localitate")),
        ("Județ", project.get("judet")),
        ("Telefon", project.get("telefon")),
        ("Email", project.get("email")),
        ("OSD", project.get("osd")),
        ("Tip lucrare", project.get("tip_lucrare")),
        ("Număr contract", project.get("numar_contract")),
        ("Data contract", project.get("data_contract")),
    ]))

    # Team
    story.append(_section_header("Echipa autorizată", styles))
    story.append(_kv_table([
        ("Proiectant", project.get("proiectant")),
        ("Executant", project.get("executant")),
        ("Verificator VGD", project.get("verificator_vgd")),
        ("Atestat VGD", project.get("atestat_vgd")),
        ("Data verificare VGD", project.get("data_verificare_vgd")),
        ("Status VGD", project.get("status_vgd")),
        ("Responsabil RTE", project.get("responsabil_rte")),
        ("Autorizație RTE", project.get("autorizatie_rte")),
        ("Data verificare RTE", project.get("data_verificare_rte")),
        ("Status RTE", project.get("status_rte")),
    ]))

    # Technical
    td = project.get("technical_data") or {}
    if td:
        story.append(_section_header("Date tehnice", styles))
        rows = []
        for key in ("debit_instalat", "presiune_regim", "diametru_conducta", "material_conducta",
                    "lungime_bransament", "punct_racordare", "post_reglare", "contor",
                    "categorie_consumator", "traseu", "observatii_tehnice"):
            v = td.get(key)
            if v not in (None, "", 0):
                rows.append((key.replace("_", " ").title(), str(v)))
        if rows:
            story.append(_kv_table(rows))

    # Calc results
    calc = calc_results or project.get("calc_results") or {}
    if calc:
        story.append(_section_header("Calcul inteligent", styles))
        data = [["Mărime", "Valoare", "Status", "Formulă"]]
        labels = {
            "debit_calculat_mc_h": "Debit calculat (mc/h)",
            "debit_recomandat_mc_h": "Debit recomandat (mc/h)",
            "putere_instalata_kw": "Putere instalată (kW)",
            "risc_presiune": "Risc presiune",
            "estimare_cost": "Estimare cost (RON)",
            "contor_orientativ": "Contor recomandat",
        }
        for k, r in calc.items():
            data.append([
                labels.get(k, k),
                str(r.get("value", "—")),
                r.get("status", "—"),
                r.get("formula", "—")[:42],
            ])
        t = Table(data, colWidths=(4.5 * cm, 3.5 * cm, 2.5 * cm, 6 * cm))
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), COL_BLACK),
            ("TEXTCOLOR", (0, 0), (-1, 0), COL_ACCENT),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, COL_LIGHT]),
            ("FONTNAME", (3, 1), (3, -1), "Courier"),
        ]))
        story.append(t)

    # Verification (if provided)
    if verification:
        story.append(_section_header("Verificare documentație", styles))
        story.append(Paragraph(
            f'Scor total: <b>{verification.get("overall_score", 0)}%</b> · '
            f'OK: {verification.get("summary", {}).get("ok", 0)} · '
            f'Atenție: {verification.get("summary", {}).get("warning", 0)} · '
            f'Lipsă: {verification.get("summary", {}).get("missing", 0)}',
            styles["body"],
        ))
        story.append(Spacer(1, 0.2 * cm))
        data = [["Categorie", "Status", "Scor"]]
        for c in verification.get("checks", []):
            data.append([c.get("label"), c.get("status"), f'{c.get("score", 0)}%'])
        t = Table(data, colWidths=(9 * cm, 4 * cm, 3.5 * cm))
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), COL_BLACK),
            ("TEXTCOLOR", (0, 0), (-1, 0), COL_ACCENT),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, COL_LIGHT]),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t)

    # Notes
    if project.get("observatii"):
        story.append(_section_header("Observații generale", styles))
        story.append(Paragraph(project["observatii"], styles["body"]))

    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph(
        '<font color="#6B7280" size="7">Document generat automat de platforma Energy Project Design Services. '
        'Pentru orice clarificare contactați: <b>contact@energyprojectdesign.ro</b></font>',
        styles["small"],
    ))

    on_page = lambda c, d: _header(c, d, project_name)
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    return buf.getvalue()
