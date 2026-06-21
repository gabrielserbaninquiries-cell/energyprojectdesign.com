/**
 * Energy Project Design — BRAND IDENTITY (single source of truth)
 *
 * Source: pagina oficială Facebook EPD SRL + identitatea logo-ului uploadat
 * de Dragoș Șerban (2026, sesiune finalizare produs).
 *
 * Logo: cub isometric "EP" cu gradient diagonal violet → indigo → navy → black.
 * Tagline: "Redesigning projects."
 * Sub-tagline: "The Architects of Future Global Technology"
 */

// Official EPD logo files (uploaded by founder Dragoș Șerban)
// Acestea sunt URL-urile oficiale ale logo-ului din pagina Facebook EPD SRL.
// Folosim imaginea completă "EP" cu textul "ENERGY PROJECT DESIGN / Redesigning projects."
// pentru contexte mari (Landing hero, Login brand panel, About).
// Pentru contexte mici (header, sidebar, favicon) folosim doar cub-ul izolat.
export const BRAND_ASSETS = {
  // Logo curat — cub EP cu text dedesubt, fundal crem (versiunea principală)
  logoFull: 'https://customer-assets.emergentagent.com/job_github-push-test/artifacts/3x5homqi_722490090_122280146870059458_1686842917685227154_n.jpg',
  // Logo doar cub (pentru header / sidebar — preferăm imaginea crop)
  logoMark: 'https://customer-assets.emergentagent.com/job_github-push-test/artifacts/3x5homqi_722490090_122280146870059458_1686842917685227154_n.jpg',
  // Alias compatibil cu versiunea anterioară
  logoCleanWhite: 'https://customer-assets.emergentagent.com/job_github-push-test/artifacts/3x5homqi_722490090_122280146870059458_1686842917685227154_n.jpg',
  cover1Futurist: 'https://customer-assets.emergentagent.com/job_github-push-test/artifacts/6qg0the2_723491525_122280142184059458_1980364817366870376_n.jfif',
  cover2Smartcity: 'https://customer-assets.emergentagent.com/job_github-push-test/artifacts/0juohzrp_724811747_122280139406059458_936218039712510715_n.jpg',
  cover3Office: 'https://customer-assets.emergentagent.com/job_github-push-test/artifacts/j1pg0xlc_724061403_17971844154065237_5309602156807133894_n.jfif',
  cover4Architects: 'https://customer-assets.emergentagent.com/job_github-push-test/artifacts/8rnh1m0d_724858614_122280136286059458_8884292619112530420_n.jfif',
};

// Official EPD color palette (extracted from logo gradient)
export const BRAND_COLORS = {
  // Primary gradient — folosit pentru logo, CTA-uri majore, hero
  violet: '#7C3AED',        // violet-600 — top-left logo
  violetLight: '#A78BFA',   // violet-400 — hover state
  indigo: '#4F46E5',        // indigo-600 — middle gradient
  blue: '#2563EB',          // blue-600 — middle-bottom
  navy: '#1E3A8A',          // blue-900 — bottom logo
  slate900: '#0F172A',      // slate-900 — text + dark surfaces
  slate800: '#1E293B',      // slate-800
  slate700: '#334155',      // slate-700
  slate500: '#64748B',      // slate-500 — body text
  slate400: '#94A3B8',      // slate-400 — muted
  slate200: '#E2E8F0',      // slate-200 — borders
  slate100: '#F1F5F9',      // slate-100 — bg subtle
  slate50:  '#F8FAFC',      // slate-50  — bg main
  white:    '#FFFFFF',
  // Accent ocasional pentru highlights
  fuchsia: '#D946EF',
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger:  '#EF4444',
};

// Gradient strings (reusable)
export const BRAND_GRADIENTS = {
  // Diagonal logo gradient — folosit pentru logo, butoane primary, accent bars
  logo: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 25%, #4F46E5 55%, #1E3A8A 85%, #0F172A 100%)',
  hero: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #4F46E5 100%)',
  card: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(30,58,138,0.04) 100%)',
  accent: 'linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%)',
  text: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
};

export const BRAND = {
  legalName: 'Energy Project Design S.R.L.',
  shortName: 'Energy Project Design',
  acronym: 'EPD',
  cui: '43151074',
  regCom: 'J40/12982/2020',
  caen: '7112',
  tagline: 'Redesigning projects.',
  subTagline: 'The Architects of Future Global Technology',
  description:
    'Platformă globală de proiectare, documentație tehnică digitală certificată și management de proiect — gaze naturale, energie regenerabilă, instalații, construcții și infrastructură.',
  mission:
    'Reducem o firmă de proiectare-execuție de 20 de angajați la 1-2 oameni, oferind documentație tehnică legală digitală cu valoare juridică pentru toate industriile lumii.',
  address: 'Str. Lt. Alexandru Popescu 9B, Sector 3, București',
  domain: 'energyprojectdesign.com',
  contactEmail: 'office@energyprojectdesign.com',
  founded: 2020,
};
