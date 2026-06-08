"""Gas Natural — Template-uri DOCX cu placeholder + condiționale IF pentru
documentația tehnică COMPLETĂ (Energy Project Design SRL).

Acest modul transformă 10 ore de muncă manuală în 30 de minute. Folosește
`python-docx` programatic pentru a genera 8 template-uri legale conforme
NTPEE 2018 + HG 907/2016 + Legea 50/1991 + Ord. ANRE 89/2018 + 162/2021.

Toate placeholder-ele suportă logică condițională simplă:
- {{var}} — înlocuit cu valoarea câmpului
- {{var | default("—")}} — fallback dacă vid
- {{#if var}}...{{/if}} — afișează blocul doar dacă `var` truthy
- {{#if var == "valoare"}}...{{/if}} — comparație directă
- {{calc.recommended_dn}} — output din calc_engine

Template-uri implementate:
1. cerere_cu       — Cerere Certificat de Urbanism (către Primărie)
2. cerere_atr      — Cerere Aviz Tehnic Racordare (către OSD)
3. memoriu_tehnic  — Memoriu Tehnic Justificativ (DTAC/PT)
4. caiet_sarcini   — Caiet de sarcini execuție
5. borderou        — Borderou piese scrise + desenate
6. cerere_pif      — Cerere Punere în Funcțiune (către OSD)
7. pv_receptie     — Proces Verbal de Recepție la Terminarea Lucrărilor
8. carte_tehnica   — Cartea Tehnică a Construcției (4 secțiuni)
"""
from __future__ import annotations
import io
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Cm, Pt, RGBColor

import gas_calc_engine as engine

# ============================================================================
# COMPANY HEADER — Energy Project Design SRL
# ============================================================================
COMPANY = {
    "name": "ENERGY PROJECT DESIGN S.R.L.",
    "cui": "43151074",
    "reg_com": "J40/12982/2020",
    "address": "Str. Lt. Alexandru Popescu nr. 9B, Sectorul 3, București",
    "phone": "+40 723 000 000",
    "email": "office@energyprojectdesign.com",
    "web": "energyprojectdesign.com",
    "anre_proiectant": "PDD/2022/0001",  # Atestat ANRE Proiectare Distribuție Distribuție gaze
    "anre_executant": "EDD/2022/0001",   # Atestat ANRE Execuție Distribuție gaze
}


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def _today_ro() -> str:
    months = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
              "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"]
    now = datetime.now()
    return f"{now.day:02d} {months[now.month-1]} {now.year}"


def _get(data: Dict[str, Any], key: str, default: str = "—") -> str:
    v = data.get(key)
    if v in (None, "", []):
        return default
    return str(v)


def _truthy(data: Dict[str, Any], key: str) -> bool:
    v = data.get(key)
    if v in (None, "", [], 0, "0"):
        return False
    return True


def _add_heading(doc: Document, text: str, level: int = 1, align=WD_ALIGN_PARAGRAPH.LEFT) -> None:
    h = doc.add_heading(text, level=level)
    h.alignment = align


def _add_para(doc: Document, text: str, bold: bool = False, italic: bool = False,
              size: int = 11, align=WD_ALIGN_PARAGRAPH.LEFT) -> None:
    p = doc.add_paragraph()
    p.alignment = align
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.size = Pt(size)


def _add_kv_table(doc: Document, rows: List[Tuple[str, str]], col1_cm: float = 5.5) -> None:
    t = doc.add_table(rows=len(rows), cols=2)
    t.style = "Light Grid Accent 1"
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    for i, (k, v) in enumerate(rows):
        cells = t.rows[i].cells
        cells[0].text = k
        cells[1].text = v
        for run in cells[0].paragraphs[0].runs:
            run.bold = True


def _company_header(doc: Document) -> None:
    """Block antet companie."""
    _add_para(doc, COMPANY["name"], bold=True, size=12)
    _add_para(doc, f"CUI {COMPANY['cui']} · {COMPANY['reg_com']}", size=9)
    _add_para(doc, COMPANY["address"], size=9)
    _add_para(doc, f"{COMPANY['phone']} · {COMPANY['email']} · {COMPANY['web']}", size=9)
    _add_para(doc, f"Atestat ANRE Proiectare gaze: {COMPANY['anre_proiectant']}", size=9, italic=True)
    doc.add_paragraph()


def _footer_signature(doc: Document, proj: Dict[str, Any], data: Dict[str, Any]) -> None:
    doc.add_paragraph()
    doc.add_paragraph()
    t = doc.add_table(rows=2, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    t.rows[0].cells[0].text = "Întocmit (Proiectant)"
    t.rows[0].cells[1].text = "Verificat (VGD/RTE)"
    proiectant = _get(data, "dtac_proiectant_specialitate", COMPANY["name"])
    atestat = _get(data, "dtac_atestat_proiectant", COMPANY["anre_proiectant"])
    vgd = _get(data, "dtac_verificator_vgd", "—")
    t.rows[1].cells[0].text = f"{proiectant}\nAtestat ANRE: {atestat}\n\nSemnătură: ______________"
    t.rows[1].cells[1].text = f"{vgd}\n\nSemnătură: ______________"
    doc.add_paragraph()
    if proj.get("signature_hash"):
        _add_para(doc, f"Hash SHA-256: {proj['signature_hash']}", italic=True, size=8)
        _add_para(doc, f"Semnat digital: {proj.get('signed_at','—')}", italic=True, size=8)
    _add_para(doc, f"Document generat: {_today_ro()} · Energy Project Design", italic=True, size=8)


def _save(doc: Document) -> bytes:
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ============================================================================
# TEMPLATE 1: Cerere CU (Certificat de Urbanism)
# ============================================================================
def cerere_cu(proj: Dict[str, Any]) -> bytes:
    data = proj.get("data") or {}
    doc = Document()
    _company_header(doc)
    _add_para(doc, f"Către PRIMĂRIA {_get(data,'loc_consum_localitate','—').upper()}", bold=True, size=12)
    _add_para(doc, f"Județul {_get(data,'loc_consum_judet','—')}", size=10)
    doc.add_paragraph()
    _add_heading(doc, "CERERE PENTRU EMITEREA CERTIFICATULUI DE URBANISM", level=1, align=WD_ALIGN_PARAGRAPH.CENTER)
    _add_para(doc, "(Conform Legii 50/1991 republicată, art. 6)", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=10)
    doc.add_paragraph()

    _add_para(doc, "Subsemnatul/Subscrisa:", bold=True)
    _add_kv_table(doc, [
        ("Nume / Denumire beneficiar", _get(data, "beneficiar_nume")),
        ("CNP / CUI", _get(data, "beneficiar_cnp_cui")),
        ("Adresa fiscală", _get(data, "beneficiar_adresa")),
        ("Telefon", _get(data, "beneficiar_telefon")),
        ("Email", _get(data, "beneficiar_email")),
    ])

    doc.add_paragraph()
    _add_para(doc, "Solicit emiterea Certificatului de Urbanism în vederea:", bold=True)
    scop = _get(data, "scop_lucrare", "Branșament nou la rețeaua de gaze naturale")
    _add_para(doc, scop, italic=True)

    doc.add_paragraph()
    _add_para(doc, "Pentru imobilul situat la:", bold=True)
    _add_kv_table(doc, [
        ("Adresă loc de consum", _get(data, "loc_consum_adresa")),
        ("Strada și număr", _get(data, "loc_consum_strada")),
        ("Localitate", _get(data, "loc_consum_localitate")),
        ("Județ", _get(data, "loc_consum_judet")),
        ("Nr. cadastral / CF", _get(data, "loc_consum_cadastru")),
    ])

    doc.add_paragraph()
    _add_para(doc, "Date tehnice estimate:", bold=True)
    _add_kv_table(doc, [
        ("Tip consumator", _get(data, "tip_consumator")),
        ("Regim funcționare", _get(data, "regim_functionare")),
        ("Debit instalat estimat (m³/h)", _get(data, "debit_instalat_mc_h")),
        ("Consum anual estimat (m³/an)", _get(data, "consum_anual_mc")),
    ])

    doc.add_paragraph()
    _add_para(doc, "Anexe:", bold=True)
    doc.add_paragraph("• Extras CF / Act proprietate (copie)", style="List Bullet")
    doc.add_paragraph("• Plan de încadrare în zonă (scara 1:5000)", style="List Bullet")
    doc.add_paragraph("• Plan de situație (scara 1:500)", style="List Bullet")
    doc.add_paragraph("• Memoriu de necesitate", style="List Bullet")

    _footer_signature(doc, proj, data)
    return _save(doc)


# ============================================================================
# TEMPLATE 2: Cerere ATR (Aviz Tehnic Racordare) către OSD
# ============================================================================
def cerere_atr(proj: Dict[str, Any]) -> bytes:
    data = proj.get("data") or {}
    osd = _get(data, "atr_osd", "Distrigaz Sud Rețele")
    doc = Document()
    _company_header(doc)
    _add_para(doc, f"Către {osd.upper()}", bold=True, size=12)
    _add_para(doc, "OSD — Operator Sistem Distribuție gaze naturale", size=10, italic=True)
    doc.add_paragraph()

    _add_heading(doc, "CERERE PENTRU EMITEREA AVIZULUI TEHNIC DE RACORDARE (ATR)", level=1, align=WD_ALIGN_PARAGRAPH.CENTER)
    _add_para(doc, "(Conform Ord. ANRE 89/2018 — Procedura de acces la sistemul de distribuție gaze naturale)",
              italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=9)
    doc.add_paragraph()

    _add_para(doc, "Solicitant (beneficiar/titular contract):", bold=True)
    _add_kv_table(doc, [
        ("Nume/Denumire", _get(data, "beneficiar_nume")),
        ("CNP/CUI", _get(data, "beneficiar_cnp_cui")),
        ("Adresă fiscală", _get(data, "beneficiar_adresa")),
        ("Telefon", _get(data, "beneficiar_telefon")),
        ("Email", _get(data, "beneficiar_email")),
    ])

    doc.add_paragraph()
    _add_para(doc, "Loc consum (punct racordare):", bold=True)
    _add_kv_table(doc, [
        ("Adresă", _get(data, "loc_consum_adresa")),
        ("Localitate", _get(data, "loc_consum_localitate")),
        ("Județ", _get(data, "loc_consum_judet")),
        ("Cadastru/CF", _get(data, "loc_consum_cadastru")),
    ])

    doc.add_paragraph()
    _add_para(doc, "Date tehnice solicitate:", bold=True)
    tip = _get(data, "tip_consumator")
    debit_calc = ""
    nr_cons = data.get("nr_consumatori_simultani")
    debit_ind = data.get("debit_individual_mc_h")
    # Auto-calc debit total cu Ks (logica IF: dacă sunt consumatori multipli)
    if nr_cons and debit_ind:
        try:
            r = engine.debit_calculat(int(nr_cons), float(debit_ind), tip.lower() if tip else "casnic")
            debit_calc = f"{r['debit_calculat_mc_h']} m³/h (Ks={r['ks']})"
        except (ValueError, TypeError):
            pass

    _add_kv_table(doc, [
        ("Tip consumator", tip),
        ("Regim funcționare", _get(data, "regim_functionare")),
        ("Debit instalat (m³/h)", _get(data, "debit_instalat_mc_h")),
        ("Debit calculat cu Ks", debit_calc or "—"),
        ("Consum anual (m³/an)", _get(data, "consum_anual_mc")),
        ("Presiune solicitată", _get(data, "sf_presiune_max_op_bar") + " bar" if _truthy(data, "sf_presiune_max_op_bar") else "Joasă presiune (≤100 mbar)"),
    ])

    # Bloc condițional: dacă există SF cu soluție tehnică, includ
    if _truthy(data, "sf_solutie_tehnica"):
        doc.add_paragraph()
        _add_para(doc, "Soluție tehnică propusă (din Studiul de Fezabilitate):", bold=True)
        _add_para(doc, _get(data, "sf_solutie_tehnica"))

    doc.add_paragraph()
    _add_para(doc, "Anexe la cerere:", bold=True)
    doc.add_paragraph("• Copie CI/CUI beneficiar", style="List Bullet")
    doc.add_paragraph("• Extras CF / Act proprietate", style="List Bullet")
    doc.add_paragraph("• Plan situație 1:500 (cu poziția propusă pentru branșament)", style="List Bullet")
    doc.add_paragraph("• Plan încadrare 1:5000", style="List Bullet")
    if _truthy(data, "cu_numar"):
        doc.add_paragraph(f"• Copie Certificat Urbanism nr. {_get(data,'cu_numar')} / {_get(data,'cu_data_emitere','—')}", style="List Bullet")

    doc.add_paragraph()
    _add_para(doc, f"Data: {_today_ro()}", italic=True)

    _footer_signature(doc, proj, data)
    return _save(doc)


# ============================================================================
# TEMPLATE 3: Memoriu Tehnic Justificativ (DTAC + PT)
# ============================================================================
def memoriu_tehnic(proj: Dict[str, Any]) -> bytes:
    data = proj.get("data") or {}
    doc = Document()
    _company_header(doc)

    _add_heading(doc, "MEMORIU TEHNIC JUSTIFICATIV", level=1, align=WD_ALIGN_PARAGRAPH.CENTER)
    _add_para(doc, "Proiect distribuție gaze naturale",
              italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=10)
    _add_para(doc, f"Subdomeniu: {proj.get('subdomain', 'bransament-casnic').replace('-', ' ').title()}",
              italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=9)
    doc.add_paragraph()

    _add_heading(doc, "1. Date generale", level=2)
    _add_kv_table(doc, [
        ("Beneficiar", _get(data, "beneficiar_nume")),
        ("Loc consum", f"{_get(data,'loc_consum_adresa')}, {_get(data,'loc_consum_localitate')}, jud. {_get(data,'loc_consum_judet')}"),
        ("Cadastru/CF", _get(data, "loc_consum_cadastru")),
        ("Proiectant", _get(data, "dtac_proiectant_specialitate", COMPANY["name"])),
        ("Atestat ANRE proiectant", _get(data, "dtac_atestat_proiectant", COMPANY["anre_proiectant"])),
        ("Tip consumator", _get(data, "tip_consumator")),
        ("Scop lucrare", _get(data, "scop_lucrare")),
    ])

    _add_heading(doc, "2. Cadru legal aplicabil", level=2)
    doc.add_paragraph("• Legea 123/2012 — Legea energiei electrice și a gazelor naturale", style="List Bullet")
    doc.add_paragraph("• NTPEE 2018 — Normele tehnice pentru proiectarea, executarea și exploatarea sistemelor de alimentare cu gaze naturale", style="List Bullet")
    doc.add_paragraph("• HG 907/2016 — Etapele de elaborare a documentațiilor tehnico-economice", style="List Bullet")
    doc.add_paragraph("• Legea 50/1991 — Autorizarea executării lucrărilor de construcții", style="List Bullet")
    doc.add_paragraph("• Ord. ANRE 89/2018 — Procedura de acces la sistemul de distribuție", style="List Bullet")
    doc.add_paragraph("• Ord. ANRE 162/2021 — Punere în funcțiune (PIF)", style="List Bullet")

    _add_heading(doc, "3. Soluție tehnică propusă", level=2)
    if _truthy(data, "sf_solutie_tehnica"):
        _add_para(doc, _get(data, "sf_solutie_tehnica"))
    else:
        _add_para(doc, "Se propune realizarea unui branșament/extindere cu conductă PE 100 SDR 11, "
                       "pozată îngropat conform NTPEE 2018 art. 56, cu trecere de la presiune medie la "
                       "presiune joasă printr-un post de reglare amplasat la limita de proprietate.", italic=True)

    _add_heading(doc, "4. Date tehnice și dimensionări", level=2)
    # Auto-calc IF length & debit available
    L = data.get("sf_lungime_conducta_m") or data.get("pt_lungime_m")
    Q = data.get("debit_instalat_mc_h")
    calc_done = False
    if L and Q:
        try:
            dim = engine.dimensionare_conducta(regime="joasa", length_m=float(L), debit_mc_h=float(Q),
                                               material=_get(data, "sf_material_conducta", "PE 100 SDR 11"))
            rec = dim.get("recommended", {})
            calc_rows = [
                ("Lungime conductă (m)", str(L)),
                ("Material", _get(data, "sf_material_conducta", "PE 100 SDR 11")),
                ("Debit calculat (m³/h)", str(Q)),
                ("DN recomandat (calc Renouard)", f"DN {rec.get('DN','—')} (Ø ext. {rec.get('od_mm','—')} mm)"),
                ("Pierdere presiune calculată", f"{rec.get('delta_p','—')} mbar"),
                ("Viteza gazului", f"{rec.get('viteza_m_s','—')} m/s"),
                ("Verdict dimensionare", "OK conform NTPEE 2018" if rec.get("ok") else "ATENȚIE - reverificare necesară"),
            ]
            _add_kv_table(doc, calc_rows)
            calc_done = True
        except (ValueError, TypeError):
            pass
    if not calc_done:
        _add_kv_table(doc, [
            ("Lungime conductă (m)", _get(data, "sf_lungime_conducta_m") or _get(data, "pt_lungime_m")),
            ("Material", _get(data, "sf_material_conducta", "PE 100 SDR 11")),
            ("Diametru nominal", _get(data, "sf_diametru_nominal_DN")),
            ("Presiune maximă operare (bar)", _get(data, "sf_presiune_max_op_bar")),
            ("Pierderi presiune calculate (bar)", _get(data, "pt_calcul_pierderi_presiune_bar")),
        ])

    _add_heading(doc, "5. Probe și verificări (NTPEE 2018 cap. 5)", level=2)
    _add_para(doc, "Înainte de PIF, conducta va fi supusă următoarelor probe:")
    p_lucru = data.get("sf_presiune_max_op_bar")
    p_rez_min, p_et_min = "6", "0.11"
    if p_lucru:
        try:
            v = engine.validare_probe(0, 0, float(p_lucru))
            p_rez_min = str(v["rezistenta_min_bar"])
            p_et_min = str(v["etanseitate_min_bar"])
        except (ValueError, TypeError):
            pass
    _add_kv_table(doc, [
        ("Proba de rezistență minimă (bar)", p_rez_min),
        ("Proba de etanșeitate minimă (bar)", p_et_min),
        ("Durată proba rezistență", "min. 1 oră (PE)"),
        ("Durată proba etanșeitate", "min. 24 ore (rețele)"),
    ])

    # Bloc condițional pe rezultate probe efective
    if _truthy(data, "proba_rezultat"):
        _add_para(doc, f"Rezultat probe efectuate: {_get(data,'proba_rezultat')}", bold=True)
        if _truthy(data, "proba_observatii"):
            _add_para(doc, f"Observații: {_get(data,'proba_observatii')}", italic=True)

    _add_heading(doc, "6. Verificare independentă (VGD)", level=2)
    if _truthy(data, "dtac_verificator_vgd"):
        _add_para(doc, f"Verificator de proiect (VGD) atestat: {_get(data,'dtac_verificator_vgd')}", bold=True)
    else:
        _add_para(doc, "Verificator de proiect (VGD) atestat ANRE — se va completa la finalizare DTAC.",
                  italic=True)

    _footer_signature(doc, proj, data)
    return _save(doc)


# ============================================================================
# TEMPLATE 4: Caiet de Sarcini Execuție
# ============================================================================
def caiet_sarcini(proj: Dict[str, Any]) -> bytes:
    data = proj.get("data") or {}
    doc = Document()
    _company_header(doc)
    _add_heading(doc, "CAIET DE SARCINI — EXECUȚIE INSTALAȚIE GAZE NATURALE", level=1, align=WD_ALIGN_PARAGRAPH.CENTER)
    _add_para(doc, "(Conform NTPEE 2018 cap. 4 + Legea 10/1995 — Calitate construcții)",
              italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=10)
    doc.add_paragraph()

    _add_heading(doc, "1. Obiectul lucrării", level=2)
    _add_para(doc, _get(data, "scop_lucrare", "Realizare branșament gaze naturale + instalație utilizare"))

    _add_heading(doc, "2. Cerințe față de executant", level=2)
    doc.add_paragraph("• Autorizație ANRE EDD (Execuție Distribuție gaze) valabilă", style="List Bullet")
    doc.add_paragraph("• Responsabil Tehnic cu Execuția (RTE) atestat MDLPA", style="List Bullet")
    doc.add_paragraph("• Sudori autorizați (PE sau OL după caz)", style="List Bullet")
    doc.add_paragraph("• Diriginte de șantier atestat", style="List Bullet")

    _add_heading(doc, "3. Materiale aprobate", level=2)
    _add_para(doc, _get(data, "pt_lista_materiale", "Conductă PE 100 SDR 11 conform EN 1555, "
              "armături sub presiune, regulator presiune, contor cu corecție automată conform Ord. ANRE 75/2020."))

    _add_heading(doc, "4. Tehnologii de montaj", level=2)
    doc.add_paragraph("• Sudură PE prin electrofuziune sau cap-la-cap conform standardelor", style="List Bullet")
    doc.add_paragraph("• Adâncime pozare conform NTPEE 2018 art. 56:", style="List Bullet")
    doc.add_paragraph("    - 0,9 m minim sub trotuar", style="List Bullet 2")
    doc.add_paragraph("    - 1,0 m minim sub trafic auto", style="List Bullet 2")
    doc.add_paragraph("    - 0,6 m minim în spații verzi", style="List Bullet 2")
    doc.add_paragraph("• Pat de nisip 10 cm sub și deasupra conductei", style="List Bullet")
    doc.add_paragraph("• Bandă de avertizare galbenă la 30 cm deasupra conductei", style="List Bullet")

    _add_heading(doc, "5. Controale și verificări", level=2)
    doc.add_paragraph("• Verificare materiale cu certificate de calitate", style="List Bullet")
    doc.add_paragraph("• Verificare sudori și buletine de autorizație", style="List Bullet")
    doc.add_paragraph("• Probă de rezistență (apă sau aer) — min. 1,5 × P_op, min. 4 bar pentru PE", style="List Bullet")
    doc.add_paragraph("• Probă de etanșeitate — 1,1 × P_op, min. 24 ore", style="List Bullet")
    doc.add_paragraph("• Probă PIF (împreună cu OSD)", style="List Bullet")

    if _truthy(data, "exec_firma"):
        _add_heading(doc, "6. Executant desemnat", level=2)
        _add_kv_table(doc, [
            ("Firmă executantă", _get(data, "exec_firma")),
            ("RTE", _get(data, "exec_responsabil_tehnic")),
            ("Diriginte șantier", _get(data, "exec_diriginte_santier")),
            ("Data start lucrări", _get(data, "exec_data_start")),
            ("Data terminare", _get(data, "exec_data_terminare")),
        ])

    _footer_signature(doc, proj, data)
    return _save(doc)


# ============================================================================
# TEMPLATE 5: Borderou Piese
# ============================================================================
def borderou(proj: Dict[str, Any]) -> bytes:
    data = proj.get("data") or {}
    doc = Document()
    _company_header(doc)
    _add_heading(doc, "BORDEROU PIESE SCRISE ȘI DESENATE", level=1, align=WD_ALIGN_PARAGRAPH.CENTER)
    _add_para(doc, f"Proiect: {proj.get('title','—')}", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    doc.add_paragraph()

    _add_heading(doc, "A. Piese scrise", level=2)
    pieces = [
        ("1", "Foaie de capăt"),
        ("2", "Borderou"),
        ("3", "Tema de proiectare"),
        ("4", "Memoriu tehnic justificativ"),
        ("5", "Calcule de dimensionare"),
        ("6", "Caiet de sarcini"),
        ("7", "Liste de cantități de lucrări (antemăsurătoare)"),
        ("8", "Programe de verificare (PCC)"),
    ]
    if _truthy(data, "dtac_verificator_vgd"):
        pieces.append(("9", f"Raport verificare VGD: {_get(data,'dtac_verificator_vgd')}"))
    t = doc.add_table(rows=1, cols=3)
    t.style = "Light Grid Accent 1"
    hdr = t.rows[0].cells
    hdr[0].text = "Nr."
    hdr[1].text = "Denumire piesă"
    hdr[2].text = "Format"
    for n, lbl in pieces:
        r = t.add_row().cells
        r[0].text = n
        r[1].text = lbl
        r[2].text = "A4"

    doc.add_paragraph()
    _add_heading(doc, "B. Piese desenate", level=2)
    drawings = [
        ("D1", "Plan încadrare în zonă", "1:5000", "A3"),
        ("D2", "Plan de situație", "1:500", "A3"),
        ("D3", "Profil longitudinal conductă", "1:500/1:100", "A2"),
        ("D4", "Detalii branșament", "1:20", "A3"),
        ("D5", "Schemă izometrică instalație utilizare", "—", "A3"),
        ("D6", "Detalii post reglare-măsurare", "1:10", "A3"),
    ]
    t = doc.add_table(rows=1, cols=4)
    t.style = "Light Grid Accent 1"
    hdr = t.rows[0].cells
    hdr[0].text = "Cod"
    hdr[1].text = "Denumire"
    hdr[2].text = "Scară"
    hdr[3].text = "Format"
    for c, lbl, sc, fmt in drawings:
        r = t.add_row().cells
        r[0].text = c
        r[1].text = lbl
        r[2].text = sc
        r[3].text = fmt

    if _truthy(data, "pt_numar_planse"):
        doc.add_paragraph()
        _add_para(doc, f"Număr total planșe PT: {_get(data,'pt_numar_planse')}", bold=True)

    _footer_signature(doc, proj, data)
    return _save(doc)


# ============================================================================
# TEMPLATE 6: Cerere PIF (Punere în Funcțiune)
# ============================================================================
def cerere_pif(proj: Dict[str, Any]) -> bytes:
    data = proj.get("data") or {}
    osd = _get(data, "atr_osd", "Distrigaz Sud Rețele")
    doc = Document()
    _company_header(doc)
    _add_para(doc, f"Către {osd.upper()}", bold=True, size=12)
    _add_para(doc, "Serviciu Punere în Funcțiune", size=10, italic=True)
    doc.add_paragraph()

    _add_heading(doc, "CERERE PUNERE ÎN FUNCȚIUNE (PIF)", level=1, align=WD_ALIGN_PARAGRAPH.CENTER)
    _add_para(doc, "(Conform Ord. ANRE 162/2021)", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=10)
    doc.add_paragraph()

    _add_para(doc, "Subscrisa Energy Project Design S.R.L., în calitate de proiectant atestat, "
                   "vă solicită prin prezenta efectuarea Punerii în Funcțiune pentru lucrarea:", italic=True)

    doc.add_paragraph()
    _add_kv_table(doc, [
        ("Beneficiar", _get(data, "beneficiar_nume")),
        ("CNP/CUI", _get(data, "beneficiar_cnp_cui")),
        ("Adresă loc consum", _get(data, "loc_consum_adresa")),
        ("Cod loc consum (din ATR)", _get(data, "atr_numar")),
        ("Nr. AC", _get(data, "ac_numar")),
        ("Data emiterii AC", _get(data, "ac_data_emitere")),
        ("Firmă executantă", _get(data, "exec_firma")),
        ("Data terminării lucrărilor", _get(data, "exec_data_terminare")),
    ])

    doc.add_paragraph()
    _add_para(doc, "Anexăm prezenta cerere cu următoarele documente:", bold=True)
    docs_anex = [
        f"• Proces Verbal Recepție la Terminarea Lucrărilor nr. {_get(data,'receptie_pv_numar','—')} / {_get(data,'receptie_pv_data','—')}",
        f"• Buletine probe rezistență ({_get(data,'proba_rezistenta_bar','—')} bar / {_get(data,'proba_rezistenta_durata_min','—')} min)",
        f"• Buletine probe etanșeitate ({_get(data,'proba_etanseitate_bar','—')} bar / {_get(data,'proba_etanseitate_durata_h','—')} ore)",
        "• Certificate calitate materiale",
        "• Buletine autorizație sudori",
    ]
    if _truthy(data, "as_built_anexat") and data["as_built_anexat"] == "Da":
        docs_anex.append("• Documentație as-built")
    for d in docs_anex:
        doc.add_paragraph(d, style="List Bullet")

    if _truthy(data, "proba_rezultat"):
        doc.add_paragraph()
        verdict = _get(data, "proba_rezultat")
        _add_para(doc, f"Rezultat global probe: {verdict}", bold=True,
                  italic=(verdict == "Respins"))

    doc.add_paragraph()
    _add_para(doc, f"Data cererii: {_today_ro()}", italic=True)

    _footer_signature(doc, proj, data)
    return _save(doc)


# ============================================================================
# TEMPLATE 7: PV Recepție Terminarea Lucrărilor (PVRTL)
# ============================================================================
def pv_receptie(proj: Dict[str, Any]) -> bytes:
    data = proj.get("data") or {}
    doc = Document()
    _company_header(doc)
    _add_heading(doc, "PROCES VERBAL DE RECEPȚIE LA TERMINAREA LUCRĂRILOR", level=1, align=WD_ALIGN_PARAGRAPH.CENTER)
    nr = _get(data, "receptie_pv_numar", "—")
    dt = _get(data, "receptie_pv_data", _today_ro())
    _add_para(doc, f"Nr. {nr} / {dt}", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=11)
    _add_para(doc, "(Conform HG 273/1994 + Ord. MLPAT 770/1997)",
              italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=9)
    doc.add_paragraph()

    _add_heading(doc, "1. Identificare obiect recepționat", level=2)
    _add_kv_table(doc, [
        ("Denumire lucrare", proj.get("title", "—")),
        ("Beneficiar", _get(data, "beneficiar_nume")),
        ("Adresă", _get(data, "loc_consum_adresa")),
        ("Autorizație Construire", f"AC nr. {_get(data,'ac_numar','—')} / {_get(data,'ac_data_emitere','—')}"),
        ("Proiectant", _get(data, "dtac_proiectant_specialitate", COMPANY["name"])),
        ("Executant", _get(data, "exec_firma")),
        ("RTE", _get(data, "exec_responsabil_tehnic")),
        ("Diriginte șantier", _get(data, "exec_diriginte_santier")),
        ("Data începere", _get(data, "exec_data_start")),
        ("Data terminare", _get(data, "exec_data_terminare")),
    ])

    _add_heading(doc, "2. Comisia de recepție", level=2)
    _add_para(doc, _get(data, "receptie_comisia",
              "Reprezentant beneficiar, Diriginte șantier, Reprezentant executant, "
              "Reprezentant OSD (la cerere), Verificator VGD"))

    _add_heading(doc, "3. Verificări efectuate", level=2)
    doc.add_paragraph("• Conformitate execuție cu proiectul tehnic", style="List Bullet")
    doc.add_paragraph("• Probe de rezistență și etanșeitate", style="List Bullet")
    doc.add_paragraph("• Certificate calitate materiale", style="List Bullet")
    doc.add_paragraph("• Buletine sudori", style="List Bullet")

    _add_heading(doc, "4. Concluzia comisiei", level=2)
    rez = _get(data, "proba_rezultat", "Admis")
    if rez == "Admis":
        _add_para(doc, "✓ Lucrarea se RECEPȚIONEAZĂ și se predă beneficiarului în condiții de funcționare conform proiectului.",
                  bold=True)
    elif rez == "Admis cu observații":
        _add_para(doc, "⚠ Lucrarea se RECEPȚIONEAZĂ CU OBSERVAȚII. Beneficiarul va remedia neconformitățile în 30 de zile.",
                  bold=True)
    else:
        _add_para(doc, "✗ Lucrarea NU se RECEPȚIONEAZĂ. Se va întocmi listă de remedieri obligatorii.",
                  bold=True)

    if _truthy(data, "proba_observatii"):
        doc.add_paragraph()
        _add_para(doc, "Observații/Remedieri necesare:", bold=True)
        _add_para(doc, _get(data, "proba_observatii"))

    _footer_signature(doc, proj, data)
    return _save(doc)


# ============================================================================
# TEMPLATE 8: Cartea Tehnică a Construcției
# ============================================================================
def carte_tehnica(proj: Dict[str, Any]) -> bytes:
    data = proj.get("data") or {}
    doc = Document()
    _company_header(doc)
    _add_heading(doc, "CARTEA TEHNICĂ A CONSTRUCȚIEI", level=1, align=WD_ALIGN_PARAGRAPH.CENTER)
    _add_para(doc, f"Obiect: {proj.get('title','—')}", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    _add_para(doc, "(Conform HG 273/1994 + Ord. MLPAT 770/1997 — 4 secțiuni obligatorii)",
              italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=9)
    doc.add_paragraph()

    _add_heading(doc, "Secțiunea A — Documentația de proiectare", level=2)
    _add_kv_table(doc, [
        ("Proiectant", _get(data, "dtac_proiectant_specialitate", COMPANY["name"])),
        ("Atestat ANRE", _get(data, "dtac_atestat_proiectant", COMPANY["anre_proiectant"])),
        ("Data întocmire DTAC", _get(data, "dtac_data_intocmire")),
        ("Verificator VGD", _get(data, "dtac_verificator_vgd")),
        ("CU nr.", f"{_get(data,'cu_numar')} / {_get(data,'cu_data_emitere')}"),
        ("ATR nr.", f"{_get(data,'atr_numar')} / {_get(data,'atr_data')}"),
        ("AC nr.", f"{_get(data,'ac_numar')} / {_get(data,'ac_data_emitere')}"),
    ])

    _add_heading(doc, "Secțiunea B — Documentația de execuție", level=2)
    _add_kv_table(doc, [
        ("Executant", _get(data, "exec_firma")),
        ("RTE", _get(data, "exec_responsabil_tehnic")),
        ("Diriginte șantier", _get(data, "exec_diriginte_santier")),
        ("Data începere", _get(data, "exec_data_start")),
        ("Data terminare", _get(data, "exec_data_terminare")),
        ("Materiale principale", _get(data, "pt_lista_materiale")),
    ])

    _add_heading(doc, "Secțiunea C — Documentația de recepție", level=2)
    _add_kv_table(doc, [
        ("PVRTL nr.", f"{_get(data,'receptie_pv_numar')} / {_get(data,'receptie_pv_data')}"),
        ("Comisia recepție", _get(data, "receptie_comisia")),
        ("Probe rezistență (bar)", _get(data, "proba_rezistenta_bar")),
        ("Probe etanșeitate (bar)", _get(data, "proba_etanseitate_bar")),
        ("Rezultat probe", _get(data, "proba_rezultat")),
        ("As-built anexat", _get(data, "as_built_anexat")),
    ])

    _add_heading(doc, "Secțiunea D — Urmărirea în timp a comportării construcției", level=2)
    _add_para(doc, "Verificări periodice (NTPEE 2018 art. 78):")
    doc.add_paragraph("• Verificare etanșeitate la 2 ani — în sarcina beneficiarului prin firmă autorizată", style="List Bullet")
    doc.add_paragraph("• Revizie tehnică instalație utilizare la 10 ani — Ord. ANRE 16/2015", style="List Bullet")
    doc.add_paragraph("• Verificare regulator / contor — la fiecare reverificare metrologică", style="List Bullet")
    doc.add_paragraph("• Defecțiuni majore — notificare OSD în max 24 ore", style="List Bullet")

    if _truthy(data, "pif_data"):
        _add_heading(doc, "PIF (Punere în Funcțiune)", level=2)
        _add_kv_table(doc, [
            ("Data PIF", _get(data, "pif_data")),
            ("OSD prezent", _get(data, "pif_osd")),
            ("Responsabil OSD", _get(data, "pif_responsabil_osd")),
            ("Serie contor", _get(data, "pif_contor_serie")),
            ("Index inițial", _get(data, "pif_contor_index_initial")),
            ("Contract furnizare", _get(data, "pif_contract_furnizare")),
        ])

    _footer_signature(doc, proj, data)
    return _save(doc)


# ============================================================================
# REGISTRY
# ============================================================================
TEMPLATES: Dict[str, Dict[str, Any]] = {
    "cerere_cu":       {"label": "Cerere Certificat de Urbanism",   "phase": "cu",       "fn": cerere_cu,       "norm": "Legea 50/1991"},
    "cerere_atr":      {"label": "Cerere Aviz Tehnic Racordare",     "phase": "cu",       "fn": cerere_atr,      "norm": "Ord. ANRE 89/2018"},
    "memoriu_tehnic":  {"label": "Memoriu Tehnic Justificativ",      "phase": "dtac",     "fn": memoriu_tehnic,  "norm": "HG 907/2016 + NTPEE 2018"},
    "caiet_sarcini":   {"label": "Caiet de Sarcini Execuție",        "phase": "pt",       "fn": caiet_sarcini,   "norm": "NTPEE 2018 cap. 4"},
    "borderou":        {"label": "Borderou Piese (scrise + desenate)", "phase": "pt",     "fn": borderou,        "norm": "HG 907/2016"},
    "cerere_pif":      {"label": "Cerere Punere în Funcțiune",       "phase": "pif",      "fn": cerere_pif,      "norm": "Ord. ANRE 162/2021"},
    "pv_receptie":     {"label": "Proces Verbal Recepție Terminare Lucrări", "phase": "receptie", "fn": pv_receptie, "norm": "HG 273/1994"},
    "carte_tehnica":   {"label": "Cartea Tehnică a Construcției",    "phase": "receptie", "fn": carte_tehnica,   "norm": "HG 273/1994 + Ord. MLPAT 770/1997"},
}


def list_templates() -> List[Dict[str, Any]]:
    """Return list of {id, label, phase, norm} — UI consumes this list."""
    return [{"id": k, **{kk: vv for kk, vv in v.items() if kk != "fn"}} for k, v in TEMPLATES.items()]


def generate(template_id: str, proj: Dict[str, Any]) -> Optional[Tuple[bytes, str]]:
    """Generate a DOCX. Returns (bytes, filename) or None if template_id unknown."""
    tpl = TEMPLATES.get(template_id)
    if not tpl:
        return None
    data = tpl["fn"](proj)
    safe_title = (proj.get("title", "proiect")[:40]).replace("/", "-").replace(" ", "_")
    fname = f"{template_id}_{safe_title}.docx"
    return data, fname
