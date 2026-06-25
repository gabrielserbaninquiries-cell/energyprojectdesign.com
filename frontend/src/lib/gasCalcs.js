/**
 * Gas Natural — Live calculation engine (frontend)
 *
 * All formulas conform to:
 *  - Ord. ANRE 89/2018 (NTPEE 2018)
 *  - Specificațiile EPD "Camuri de introdus in pagina gaze naturale.docx"
 *
 * Functions are PURE — no side-effects, no API calls. Used for instant UI feedback.
 * Backend `gas_calc_engine.py` is the authoritative source for DOCX generation.
 */

// =============================================================================
//  CATALOG DIAMETRE
// =============================================================================

export const PE_DIAMETERS = [
  { dn: 25, od_mm: 25, id_mm: 19.0, wall_mm: 3.0 },
  { dn: 32, od_mm: 32, id_mm: 26.0, wall_mm: 3.0 },
  { dn: 40, od_mm: 40, id_mm: 32.6, wall_mm: 3.7 },
  { dn: 50, od_mm: 50, id_mm: 40.8, wall_mm: 4.6 },
  { dn: 63, od_mm: 63, id_mm: 51.4, wall_mm: 5.8 },
  { dn: 75, od_mm: 75, id_mm: 61.4, wall_mm: 6.8 },
  { dn: 90, od_mm: 90, id_mm: 73.6, wall_mm: 8.2 },
  { dn: 110, od_mm: 110, id_mm: 90.0, wall_mm: 10.0 },
  { dn: 125, od_mm: 125, id_mm: 102.2, wall_mm: 11.4 },
  { dn: 160, od_mm: 160, id_mm: 130.8, wall_mm: 14.6 },
  { dn: 180, od_mm: 180, id_mm: 147.2, wall_mm: 16.4 },
  { dn: 200, od_mm: 200, id_mm: 163.6, wall_mm: 18.2 },
  { dn: 225, od_mm: 225, id_mm: 184.0, wall_mm: 20.5 },
  { dn: 250, od_mm: 250, id_mm: 204.6, wall_mm: 22.7 },
  { dn: 315, od_mm: 315, id_mm: 257.8, wall_mm: 28.6 },
  { dn: 355, od_mm: 355, id_mm: 290.6, wall_mm: 32.2 },
  { dn: 400, od_mm: 400, id_mm: 327.4, wall_mm: 36.3 },
];

export const OL_DIAMETERS = [
  { dn: '1/2"', dn_metric: 15, id_mm: 16.0, od_mm: 21.3 },
  { dn: '3/4"', dn_metric: 20, id_mm: 21.6, od_mm: 26.9 },
  { dn: '1"', dn_metric: 25, id_mm: 27.2, od_mm: 33.7 },
  { dn: '1 1/4"', dn_metric: 32, id_mm: 35.9, od_mm: 42.4 },
  { dn: '1 1/2"', dn_metric: 40, id_mm: 41.8, od_mm: 48.3 },
  { dn: '2"', dn_metric: 50, id_mm: 53.0, od_mm: 60.3 },
  { dn: '2 1/2"', dn_metric: 65, id_mm: 68.8, od_mm: 76.1 },
  { dn: '3"', dn_metric: 80, id_mm: 80.8, od_mm: 88.9 },
  { dn: '4"', dn_metric: 100, id_mm: 105.3, od_mm: 114.3 },
  { dn: '6"', dn_metric: 150, id_mm: 154.0, od_mm: 168.3 },
  { dn: '8"', dn_metric: 200, id_mm: 202.7, od_mm: 219.1 },
  { dn: '10"', dn_metric: 250, id_mm: 254.5, od_mm: 273.0 },
  { dn: '12"', dn_metric: 300, id_mm: 303.2, od_mm: 323.9 },
  { dn: '14"', dn_metric: 350, id_mm: 333.3, od_mm: 355.6 },
  { dn: '16"', dn_metric: 400, id_mm: 381.0, od_mm: 406.4 },
  { dn: '20"', dn_metric: 500, id_mm: 477.8, od_mm: 508.0 },
  { dn: '24"', dn_metric: 600, id_mm: 574.6, od_mm: 609.6 },
  { dn: '28"', dn_metric: 700, id_mm: 666.4, od_mm: 711.2 },
  { dn: '32"', dn_metric: 800, id_mm: 762.0, od_mm: 812.8 },
];

// Catalog contoare (NTPEE Anexa 6)
export const GAS_METERS = [
  { code: 'G1.6', qmax_m3h: 2.5 },
  { code: 'G2.5', qmax_m3h: 4 },
  { code: 'G4', qmax_m3h: 6 },
  { code: 'G6', qmax_m3h: 10 },
  { code: 'G10', qmax_m3h: 16 },
  { code: 'G16', qmax_m3h: 25 },
  { code: 'G25', qmax_m3h: 40 },
  { code: 'G40', qmax_m3h: 65 },
  { code: 'G65', qmax_m3h: 100 },
  { code: 'G100', qmax_m3h: 160 },
  { code: 'G160', qmax_m3h: 250 },
  { code: 'G250', qmax_m3h: 400 },
  { code: 'G400', qmax_m3h: 650 },
  { code: 'G650', qmax_m3h: 1000 },
  { code: 'G1000', qmax_m3h: 1600 },
];

export const REGULATOR_FLOWS = [6, 10, 25, 35, 50, 75, 100, 140, 160, 250, 400, 650, 1000];

// Echivalențe diametru robinet branșament OL ↔ PE
const VALVE_EQUIV = {
  '1/2"': ['PE 20', 'PE 25'],
  '3/4"': ['PE 25', 'PE 32'],
  '1"': ['PE 32', 'PE 40'],
  '1 1/4"': ['PE 40', 'PE 50'],
  '1 1/2"': ['PE 50'],
  '2"': ['PE 63'],
};

// =============================================================================
//  CONSTANTE
// =============================================================================
const DELTA_REL = 0.554; // densitate relativă CH4 vs aer
const LAMBDA = 0.025; // coeficient pierdere liniară (valoare medie pentru gaz natural)
const T_K = 288.15; // K

// =============================================================================
//  CALCULE PURE
// =============================================================================

/**
 * Lățime șanț (m) — Dn în mm
 *   Dn < 100 mm → 0.40 m
 *   Dn ≥ 100 mm → 0.40 + Dn/1000 m
 */
export function calcLatimeSant(dnMm) {
  const dn = Number(dnMm) || 0;
  if (dn < 100) return 0.40;
  return Math.round((0.40 + dn / 1000) * 100) / 100;
}

/**
 * Suprafață pat cărămizi (mp)
 */
export function calcPatCaramizi(latimeSant, lungimeM) {
  const l = Number(latimeSant) || 0;
  const L = Number(lungimeM) || 0;
  return Math.round(l * 0.40 * L * 100) / 100;
}

/**
 * Diametru tub de protecție (mm)
 *   distribuție PE  → De + 100
 *   distribuție OL  → De_izolat + 75
 *   racord PE        → De + 50
 *   racord OL        → De_izolat + 50
 */
export function calcDiametruTub({ tipLucrare = 'racord', material = 'PE', deMm = 0 }) {
  const de = Number(deMm) || 0;
  const isDistributie = tipLucrare === 'distributie' || tipLucrare === 'distribuție';
  if (material === 'PE') return de + (isDistributie ? 100 : 50);
  // OL — diametrul izolat e aprox De + 4 mm pentru izolație
  const deIzolat = de + 4;
  return deIzolat + (isDistributie ? 75 : 50);
}

/**
 * Viteză gaz în conductă (m/s)
 *   w = 4 × Q / (3600 × π × D²)
 *   Q [m³/h], D [m]
 */
export function calcVitezaGaz(qM3h, dInteriorMm) {
  const q = Number(qM3h) || 0;
  const d_m = (Number(dInteriorMm) || 0) / 1000;
  if (d_m === 0) return 0;
  const w = (4 * q) / (3600 * Math.PI * d_m * d_m);
  return Math.round(w * 100) / 100;
}

/**
 * Check viteză conform NTPEE art. 57
 */
export function checkVitezaConform(w, traseu = 'subteran') {
  const wn = Number(w) || 0;
  const limits = {
    suprateran: 20,
    subteran: 40,
    amonte_regulator: 30,
    aval_regulator: 20,
    contor: 20,
  };
  const limit = limits[traseu] || 40;
  return {
    ok: wn <= limit,
    limit,
    margin: limit - wn,
    msg: wn <= limit
      ? `OK — w = ${wn} m/s < ${limit} m/s (${traseu})`
      : `⚠️ DEPĂȘIT — w = ${wn} m/s > ${limit} m/s. Mărește diametrul.`,
  };
}

/**
 * Diametru recomandat (mm) pentru presiune joasă
 *   D[cm] = 0.49 × [(Q² × T × L × δ × λ) / ΔP] ^ 0.2
 *   D[cm] → mm
 *   Q [m³/h], T [K], L [m], δ = 0.554, ΔP [mbar]
 */
export function calcDiametruJoasa({ qM3h, lengthM, deltaPMbar }) {
  const Q = Number(qM3h) || 0;
  const L = Number(lengthM) || 0;
  const dP = Number(deltaPMbar) || 0.005 * 1000; // default 5 mbar
  if (Q === 0 || L === 0 || dP === 0) return 0;
  const inner = (Q * Q * T_K * L * DELTA_REL * LAMBDA) / dP;
  const dCm = 0.49 * Math.pow(inner, 0.2);
  return Math.round(dCm * 10 * 100) / 100; // mm
}

/**
 * Diametru recomandat (mm) pentru presiune redusă / medie (art. 50)
 *   D[cm] = 0.56 × [(Qcs² × T × L × δ × λ) / (P1² − P2²)] ^ 0.2
 *   Q [m³/h CS], T [K], L [km], P1/P2 [bar absolut]
 */
export function calcDiametruMedie({ qM3h, lengthKm, p1Bar, p2Bar }) {
  const Q = Number(qM3h) || 0;
  const L = Number(lengthKm) || 0;
  const P1 = Number(p1Bar) || 0;
  const P2 = Number(p2Bar) || 0;
  const denom = P1 * P1 - P2 * P2;
  if (Q === 0 || L === 0 || denom <= 0) return 0;
  const inner = (Q * Q * T_K * L * DELTA_REL * LAMBDA) / denom;
  const dCm = 0.56 * Math.pow(inner, 0.2);
  return Math.round(dCm * 10 * 100) / 100;
}

/**
 * Alege diametrul comercial PE imediat superior valorii calculate (mm)
 */
export function pickNextPE(dRecMm) {
  const d = Number(dRecMm) || 0;
  for (const p of PE_DIAMETERS) {
    if (p.od_mm >= d) return p;
  }
  return PE_DIAMETERS[PE_DIAMETERS.length - 1];
}

/**
 * Alege diametrul comercial OL imediat superior (în mm metric)
 */
export function pickNextOL(dRecMm) {
  const d = Number(dRecMm) || 0;
  for (const ol of OL_DIAMETERS) {
    if (ol.od_mm >= d) return ol;
  }
  return OL_DIAMETERS[OL_DIAMETERS.length - 1];
}

/**
 * Alege contor (G…) în funcție de debitul max necesar (m³/h)
 */
export function pickGasMeter(qDebitMaxM3h) {
  const q = Number(qDebitMaxM3h) || 0;
  for (const m of GAS_METERS) {
    if (m.qmax_m3h >= q) return m;
  }
  return GAS_METERS[GAS_METERS.length - 1];
}

/**
 * Alege regulator în funcție de debitul max necesar (m³/h)
 */
export function pickRegulator(qDebitMaxM3h) {
  const q = Number(qDebitMaxM3h) || 0;
  for (const r of REGULATOR_FLOWS) {
    if (r >= q) return r;
  }
  return REGULATOR_FLOWS[REGULATOR_FLOWS.length - 1];
}

/**
 * Robinet branșament — corespondență OL ↔ PE
 *   input "PE 32" → "OL 1/2" (sau "1\"")
 */
export function pickRobinet(brMaterial, brDn) {
  if (brMaterial === 'OL') {
    return { material: 'OL', dn: brDn, equivalent: VALVE_EQUIV[brDn] || [] };
  }
  // PE → găsim OL echivalent
  const pe = `PE ${String(brDn).replace('PE ', '').replace(/\D/g, '')}`;
  for (const [ol, peList] of Object.entries(VALVE_EQUIV)) {
    if (peList.includes(pe)) return { material: 'OL', dn: ol, equivalent: peList };
  }
  return { material: 'OL', dn: '2"', equivalent: ['PE 63'] };
}

/**
 * Sumă debit consumatori
 */
export function sumDebit(consumatori = []) {
  return consumatori.reduce((acc, c) => acc + (Number(c.debit_nmc) || 0), 0);
}

/**
 * Generează listă materiale automată pentru branșament
 */
export function generateBransamentMaterials(br) {
  if (!br || !br.material) return [];
  const dn = br.diametru_dn || 'PE 32';
  const lungime = Number(br.lungime_m) || 0;
  const items = [];

  // Țeavă
  items.push({
    nr: 1,
    denumire: br.material === 'PE' ? `Țeavă PE100 SDR11 ${dn}` : `Țeavă OL ${dn}`,
    cantitate: lungime,
    um: 'ml',
    categorie: 'tubulatură',
  });

  // Mufe (2 buc, capete)
  if (br.material === 'PE') {
    items.push({
      nr: 2,
      denumire: `Mufă PE100 SDR11 ${dn}`,
      cantitate: 2,
      um: 'buc',
      categorie: 'fitting',
    });
  }

  // Teu / șa branșament
  const dnCond = br.conducta_principala_dn || 'PE 110';
  items.push({
    nr: items.length + 1,
    denumire: `Teu/Șa branșament PE100 SDR11 ${dnCond} × ${dn}`,
    cantitate: 1,
    um: 'buc',
    categorie: 'fitting',
  });

  // Robinet
  const rob = pickRobinet(br.material, dn);
  items.push({
    nr: items.length + 1,
    denumire: `Robinet branșament ${rob.material} ${rob.dn}`,
    cantitate: 1,
    um: 'buc',
    categorie: 'armătură',
  });

  // Tub protecție
  if (br.tub_protectie) {
    const tubMm = calcDiametruTub({ tipLucrare: 'racord', material: br.material, deMm: Number(br.de_mm) || 0 });
    items.push({
      nr: items.length + 1,
      denumire: `Tub protecție Dn ≥ ${tubMm} mm`,
      cantitate: Number(br.tub_lungime_m) || lungime,
      um: 'ml',
      categorie: 'protecție',
    });
  }

  // Fir trasor cupru
  items.push({
    nr: items.length + 1,
    denumire: 'Fir trasor cupru 1.5 mm²',
    cantitate: lungime,
    um: 'ml',
    categorie: 'semnalizare',
  });

  // Bandă avertizare
  items.push({
    nr: items.length + 1,
    denumire: 'Bandă avertizare gaz (galbenă)',
    cantitate: lungime,
    um: 'ml',
    categorie: 'semnalizare',
  });

  // Regulator
  const qTotal = Number(br.debit_total_nmc) || 0;
  if (qTotal > 0) {
    const reg = pickRegulator(qTotal);
    items.push({
      nr: items.length + 1,
      denumire: `Regulator gaz natural Q ≥ ${reg} m³/h`,
      cantitate: 1,
      um: 'buc',
      categorie: 'reglare',
    });

    // Contor
    const meter = pickGasMeter(qTotal);
    items.push({
      nr: items.length + 1,
      denumire: `Contor gaz ${meter.code} (Qmax ${meter.qmax_m3h} m³/h)`,
      cantitate: 1,
      um: 'buc',
      categorie: 'măsurare',
    });
  }

  // Firidă
  if (br.firida_tip) {
    items.push({
      nr: items.length + 1,
      denumire: `Firidă ${br.firida_tip} ${br.firida_model || ''}`,
      cantitate: 1,
      um: 'buc',
      categorie: 'firidă',
    });
  }

  // Cărămizi pat
  const latime = calcLatimeSant(Number(br.de_mm) || 32);
  const pat = calcPatCaramizi(latime, lungime);
  if (pat > 0) {
    items.push({
      nr: items.length + 1,
      denumire: 'Cărămizi pentru pat de protecție',
      cantitate: Math.round(pat * 50),
      um: 'buc',
      categorie: 'protecție',
    });
  }

  return items;
}

/**
 * Calcul V/Q pentru cameră aparate (NTPEE art. 89)
 *   V = S × H  →  V/Q < 30 condiție obligatorie
 */
export function calcVQRoom({ suprafataMp, inaltimeM, debitTotalCameraNmc }) {
  const S = Number(suprafataMp) || 0;
  const H = Number(inaltimeM) || 0;
  const Q = Number(debitTotalCameraNmc) || 0;
  const V = S * H;
  if (Q === 0) return { V, ratio: 0, ok: true, msg: 'Fără aparat flacără deschisă' };
  const ratio = Math.round((V / Q) * 100) / 100;
  return {
    V,
    ratio,
    ok: ratio >= 30,
    msg: ratio >= 30
      ? `OK — V/Q = ${ratio} ≥ 30`
      : `⚠️ INSUFICIENT — V/Q = ${ratio} < 30. Necesar V minim = ${(Q * 30).toFixed(2)} m³`,
  };
}

/**
 * Suprafață vitrată necesară (SVN) = V × 0.02
 */
export function calcSVN(volumM3) {
  const V = Number(volumM3) || 0;
  return Math.round(V * 0.02 * 100) / 100;
}

/**
 * Priză aer S [m²] = 0.0025 × Qi (doar pentru flacără deschisă)
 */
export function calcPrizaAer(qInstalNmc) {
  const Q = Number(qInstalNmc) || 0;
  return Math.round(0.0025 * Q * 10000) / 10000;
}

/**
 * Lista OSD-uri (35+ companii Romania)
 */
export const OSD_LIST = [
  'Distrigaz Sud Rețele S.R.L.',
  'Delgaz Grid S.A.',
  'Premier Energy S.R.L.',
  'Premier Energy Distribution Gaz Est S.A.',
  'Gaz Sud S.A.',
  'Distrigaz Vest S.A.',
  'Gaz Vest S.A.',
  'Amarad Distribuție S.R.L.',
  'B.E.R.G. Sistem Gaz S.A.',
  'B.E.R.G. Sistem Gaz S.R.L.',
  'Cordun Gaz S.A.',
  'CPL Concordia Filiala Cluj România S.R.L.',
  'Gaz Nord Est S.A.',
  'Gazmir Iași S.R.L.',
  'Hargaz Harghita Gaz S.A.',
  'Intergaz Est S.R.L.',
  'Măcin Gaz S.R.L.',
  'M.M. Data S.R.L.',
  'Mehedinți Gaz S.A.',
  'Mehedinți Gaz S.R.L.',
  'Megaconstruct S.A.',
  'Megaconstruct S.R.L.',
  'Nova Power & Gas S.R.L.',
  'Nord Gaz S.R.L.',
  'Prisma Serv Company S.R.L.',
  'Progaz P&D S.A.',
  'Romgaz S.A.',
  'Salgaz S.A.',
  'Tulcea Gaz S.A.',
  'Vega 93 S.R.L.',
  'Tehnologica Radion S.R.L.',
  'Design Proiect S.R.L.',
  'Dornacor Invest S.R.L.',
  'Euro Seven Industry S.R.L.',
  'Instant Construct Company S.A.',
  'Instant Construct Company S.R.L.',
  'Oligopol S.R.L.',
  'Coni S.R.L.',
  'Mihoc Oil S.R.L.',
];

/**
 * Catalog avize comune România
 */
export const AVIZ_CATALOG = [
  'Aviz Apa Nova / Apa Vital',
  'Aviz E-Distribuție / Enel',
  'Aviz Telekom',
  'Aviz Orange / RCS-RDS',
  'Aviz Netcity',
  'Aviz Brigada Rutieră / Poliția Rutieră',
  'Aviz ISU (Inspectoratul Situații Urgență)',
  'Aviz Mediu (Garda Mediu / APM)',
  'Aviz ISCIR',
  'Aviz Direcția Sănătate Publică',
  'Aviz Drumuri Naționale / CNAIR',
  'Aviz Drumuri Județene / CJ',
  'Aviz Primărie (Acord administrator drum)',
  'Certificat Urbanism (CU)',
  'Autorizație de Construire (AC)',
  'Aviz Direcția Cultură / Patrimoniu',
  'Aviz STS (Servicii Telecomunicații Speciale)',
  'Aviz MApN / MAI',
  'Aviz CFR (cale ferată)',
  'Aviz Hidroelectrica',
  'Aviz Transelectrica',
  'Aviz Transgaz',
  'Aviz Conpet',
  'Aviz Luxten (iluminat public)',
  'Aviz Termoenergetica (rețele termice)',
  'Aviz RADET',
  'Aviz Administrația Domeniului Public (ADP)',
  'Aviz Salubrizare',
];

/**
 * Tipuri lucrare — toate variantele acceptate
 */
export const TIPURI_LUCRARE = [
  { value: 'bransament', label: 'Branșament gaze naturale' },
  { value: 'extindere', label: 'Extindere conductă de distribuție' },
  { value: 'extindere_cu_bransamente', label: 'Extindere conductă + branșamente' },
  { value: 'instalatie_utilizare', label: 'Instalație utilizare gaze naturale (IUGN)' },
  { value: 'deviere', label: 'Deviere conductă' },
  { value: 'reabilitare', label: 'Reabilitare conductă existentă' },
  { value: 'inlocuire', label: 'Înlocuire conductă (PE pe oțel sau invers)' },
  { value: 'studiu_fezabilitate', label: 'Studiu de fezabilitate' },
];

export const LEGITIMATIE_PROIECTANT_TIPURI = ['PGD', 'PGT', 'PGIU', 'PGL', 'PGLT'];
export const LEGITIMATIE_EXECUTANT_TIPURI = ['EGD', 'EGT', 'EGIU', 'EGL', 'EGLT'];

export const FIRIDA_TIPURI = [
  'Post Reglare (PR)',
  'Post Măsurare (PM)',
  'Post Reglare-Măsurare (PRM/FPRM)',
  'Firidă echipată',
  'Firidă neechipată',
];

export const TIP_INSTALATIE_UTILIZARE = [
  'modificare',
  'separare',
  'îndepărtare',
  'refacere documentație',
  'IUGN nouă',
  'suplimentare debit',
  'renominalizare',
];

export const IMOBIL_TIPURI = [
  'apartament la bloc',
  'casă la curte',
  'vilă la curte',
  'apartament la vilă',
  'spațiu comercial',
  'restaurant',
  'birou',
  'depozit',
  'hală industrială',
  'alt tip',
];
