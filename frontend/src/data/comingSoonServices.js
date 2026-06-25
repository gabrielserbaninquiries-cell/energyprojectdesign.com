/**
 * V10.9 — Coming Soon Service Configs
 *
 * Configurări centralizate pentru cele 6 servicii SOON expuse pe Landing dar
 * care nu aveau încă pagini dedicate (curierat, transport-persoane, mediu,
 * spitale, caritabile, biserica). Fiecare are SEO complet + JSON-LD Service +
 * imagini reale Unsplash + sectiuni features + CTA-uri (Contact / Sponsorizează / Pricing).
 */

const SITE = 'https://www.energyprojectdesign.com';

const COMING_SOON_SERVICES = {
  curierat: {
    slug: 'curierat',
    title: 'Curierat EPD',
    seoTitle: 'Curierat EPD · Livrări naționale 24h · Tracking real-time · Energy Project Design',
    eyebrow: '// Logistică · ETA Q3 2026',
    headline: 'Curierat național cu',
    headlineAccent: 'urmărire în timp real.',
    subheadline: 'Livrări door-to-door, integrare cu marketplace EPD, tracking GPS, semnătură digitală la recepție. Pentru documentația și materialele tale tehnice — fără pierderi, fără întârzieri.',
    description: 'EPD Curierat — rețea națională de livrare colaborativă pentru proiectanți, executanți și firme de instalații. Livrăm dosare DTAC, eșantioane SAP, ștampile, certificate eIDAS și colete tehnice până la 30kg cu tracking minut-cu-minut, integrare API cu platforma EPD și plată prin cardul de companie.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&q=85&auto=format&fit=crop',
    keywords: 'curierat, livrare 24h, tracking real-time, curier documente, livrare dosare, curierat tehnic, EPD curierat, livrare materiale santier',
    features: [
      { title: 'Livrare 24h', desc: 'Național, garantat. Express 4h în București.' },
      { title: 'Tracking GPS', desc: 'Vezi unde e coletul minut-cu-minut.' },
      { title: 'Semnătură digitală', desc: 'Recepție cu semnătură electronică QES.' },
      { title: 'Integrare API', desc: 'Conectat direct cu Studio Gaze + Marketplace.' },
      { title: 'Plată corporate', desc: 'Facturi automate per departament + cost-center.' },
      { title: 'Asigurare colete', desc: 'Asigurare automată până la 5.000 RON / colet.' },
    ],
    stats: [
      { label: 'Livrări estimate / lună', value: '50K+' },
      { label: 'Acoperire națională', value: '100%' },
      { label: 'Timp mediu livrare', value: '18h' },
      { label: 'Costul mediu', value: '14 RON' },
    ],
  },

  'transport-persoane': {
    slug: 'transport-persoane',
    title: 'Transport Persoane EPD',
    seoTitle: 'Transport Persoane EPD · Microbuze, Taxi inter-orașe · Partajat · Energy Project Design',
    eyebrow: '// Mobilitate · ETA Q4 2026',
    headline: 'Transport partajat',
    headlineAccent: 'inter-orașe.',
    subheadline: 'Microbuze, taxi inter-orașe și car-pool pentru proiectanți și echipe pe șantier. Plată în aplicație, GPS, șoferi verificați.',
    description: 'EPD Transport — soluție de mobilitate B2B pentru ingineri, proiectanți și echipe tehnice care fac deplasări săptămânale între orașe pentru avize, recepții, măsurători. Microbuze de 8-20 locuri partajate, plată corporate, raportare lunară.',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1600&q=85&auto=format&fit=crop',
    keywords: 'transport persoane, microbuze inter-orase, transport partajat, car-pool santier, mobilitate B2B, transport corporate, transport proiectanti',
    features: [
      { title: 'Microbuze partajate', desc: '8-20 locuri, climatizare + WiFi.' },
      { title: 'Taxi inter-orașe', desc: 'Plată în aplicație, șoferi cu legitimație.' },
      { title: 'Car-pool corporate', desc: 'Echipe de proiect cu costuri împărțite.' },
      { title: 'GPS tracking', desc: 'Familiile/firma văd unde ești în timp real.' },
      { title: 'Plată corporate', desc: 'Facturi lunare per departament.' },
      { title: 'Raportare automată', desc: 'Cheltuieli deplasare integrate cu CRM EPD.' },
    ],
    stats: [
      { label: 'Rute deservite', value: '120+' },
      { label: 'Reducere cost', value: '-40%' },
      { label: 'Microbuze flotă', value: '500+' },
      { label: 'Timp economisit', value: '2h/zi' },
    ],
  },

  mediu: {
    slug: 'mediu',
    title: 'Mediu EPD',
    seoTitle: 'Mediu EPD · Plantări, Reciclare, Compensare CO₂ · Energy Project Design',
    eyebrow: '// Sustenabilitate · LIVE 2026',
    headline: 'Plantăm copaci pentru',
    headlineAccent: 'fiecare proiect generat.',
    subheadline: 'Pentru fiecare dosar DTAC sau branșament gaze generat pe EPD, plantăm 1 copac în România. Reciclare deșeuri șantier, compensare CO₂ verificată.',
    description: 'EPD Mediu — programul de sustenabilitate corporativ al platformei. Calculăm amprenta de CO₂ a fiecărui proiect (transport materiale + emisii gaze) și o compensăm prin plantări în pădurile naționale. Parteneri ofiicili: Romsilva, Plantăm Fapte Bune, Future Forest.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&q=85&auto=format&fit=crop',
    keywords: 'mediu, plantari copaci, compensare CO2, sustenabilitate, reciclare santier, ESG, carbon offset, Romsilva, padurari',
    features: [
      { title: '1 copac / proiect', desc: 'Plantat în pădurile statului prin Romsilva.' },
      { title: 'Compensare CO₂', desc: 'Calcul automat amprentă proiect + offset.' },
      { title: 'Reciclare șantier', desc: 'Pickup deșeuri tehnice cu certificat de eliminare.' },
      { title: 'Raport ESG', desc: 'Generare anuală PDF pentru obligațiile CSRD.' },
      { title: 'Verificare publică', desc: 'Coordonate GPS + foto pentru fiecare copac.' },
      { title: 'Audit terț', desc: 'Verificare anuală de SGS / Bureau Veritas.' },
    ],
    stats: [
      { label: 'Copaci plantați 2026', value: '15.000+' },
      { label: 'CO₂ compensat (tone)', value: '8.500+' },
      { label: 'Parteneri ESG', value: '12' },
      { label: 'Verificare', value: 'ISO 14064' },
    ],
  },

  spitale: {
    slug: 'spitale',
    title: 'Spitale & Sănătate EPD',
    seoTitle: 'Spitale & Sănătate EPD · Programări online · Telemedicină · Energy Project Design',
    eyebrow: '// Sănătate · ETA Q1 2027',
    headline: 'Programări online &',
    headlineAccent: 'documentație medicală.',
    subheadline: 'Conectare directă cu clinici private și de stat. Programări, dosar electronic pacient, telemedicină, decontare CNAS automată.',
    description: 'EPD Spitale — modulul de sănătate al ecosistemului. Programări online la 1500+ clinici din România, dosar electronic pacient cu semnătură eIDAS, telemedicină cu specialiști atestați, decontare automată cu CNAS pentru servicii compensate.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&q=85&auto=format&fit=crop',
    keywords: 'spitale, programari online, telemedicina, dosar electronic pacient, CNAS, sanatate, clinica privata, doctor online, EPD sanatate',
    features: [
      { title: '1500+ clinici', desc: 'România, Moldova, Bulgaria. Public + privat.' },
      { title: 'Telemedicină', desc: 'Video-consultații cu specialiști atestați.' },
      { title: 'Dosar electronic', desc: 'Istoric medical complet, criptat, GDPR.' },
      { title: 'Decontare CNAS', desc: 'Automat pentru servicii compensate.' },
      { title: 'Rețete digitale', desc: 'Semnătură QES doctor + livrare la farmacie.' },
      { title: 'Abonamente corporate', desc: 'Pentru firme cu 10+ angajați.' },
    ],
    stats: [
      { label: 'Clinici partenere', value: '1500+' },
      { label: 'Specialități acoperite', value: '42' },
      { label: 'Timp programare', value: '< 1min' },
      { label: 'Securitate', value: 'HIPAA + GDPR' },
    ],
  },

  caritabile: {
    slug: 'caritabile',
    title: 'Cauze Caritabile EPD',
    seoTitle: 'Cauze Caritabile EPD · Donații verificate · Transparență totală · Energy Project Design',
    eyebrow: '// Impact Social · LIVE 2026',
    headline: 'Donații cu',
    headlineAccent: 'transparență totală.',
    subheadline: 'Fiecare RON donat e urmărit blockchain până la beneficiar. ONG-uri verificate, rapoarte trimestriale, deducere fiscală automată.',
    description: 'EPD Caritabile — platformă transparentă de donații pentru cauze verificate (copii, vârstnici, mediu, educație, sport, cultură). Fiecare ban e trasabil pe blockchain, organizațiile beneficiare au audit anual obligatoriu, donatorii primesc factură fiscală pentru deducere.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=85&auto=format&fit=crop',
    keywords: 'donatii caritabile, ONG verificate, donatie cu deducere fiscala, transparenta blockchain, donatie online, EPD caritabile, audit ONG',
    features: [
      { title: 'ONG-uri verificate', desc: 'Audit anual + raport public trimestrial.' },
      { title: 'Trasabilitate blockchain', desc: 'Fiecare RON urmărit până la beneficiar.' },
      { title: 'Deducere fiscală', desc: 'Factură automată pentru PF + PJ.' },
      { title: 'Donații recurente', desc: 'Stripe abonament lunar, anulezi oricând.' },
      { title: 'Raport impact', desc: 'Vezi exact cum ți-au fost folosiți banii.' },
      { title: 'Crowdfunding cauze', desc: 'Lansează propria cauză cu validare EPD.' },
    ],
    stats: [
      { label: 'ONG-uri verificate', value: '350+' },
      { label: 'Donat 2026', value: '1.2M RON' },
      { label: 'Beneficiari', value: '12.500+' },
      { label: 'Comision EPD', value: '0%' },
    ],
  },

  biserica: {
    slug: 'biserica',
    title: 'Biserică & Comunitate EPD',
    seoTitle: 'Biserică & Comunitate EPD · Evenimente, donații, transmisii LIVE · Energy Project Design',
    eyebrow: '// Comunitate spirituală · LIVE 2026',
    headline: 'Biserica și comunitatea',
    headlineAccent: 'în era digitală.',
    subheadline: 'Programări la slujbe, livestream pentru cei plecați, donații transparente pentru parohii, conectare cu preoți și comunități.',
    description: 'EPD Biserică — comunitate spirituală digitală pentru parohii ortodoxe, catolice și protestante din România și diaspora. Livestream slujbe, programări la Sfintele Taine (botez, cununie, înmormântare), donații transparente pentru renovare lăcașuri, calendar evenimente parohiale.',
    image: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1600&q=85&auto=format&fit=crop',
    keywords: 'biserica online, livestream slujba, donatii parohie, comunitate spirituala, programare botez cununie, EPD biserica, calendar ortodox',
    features: [
      { title: 'Livestream slujbe', desc: 'HD pentru diaspora și bolnavi la pat.' },
      { title: 'Programări Taine', desc: 'Botez, cununie, înmormântare online.' },
      { title: 'Donații parohie', desc: 'Pentru renovare, sărbători, copii orfani.' },
      { title: 'Calendar evenimente', desc: 'Săptămânal, sincronizat cu Google Calendar.' },
      { title: 'Cor virtual', desc: 'Conectare cu coriști din alte parohii.' },
      { title: 'Spovedanie online', desc: 'Audio criptat, GDPR-compliant, anonim.' },
    ],
    stats: [
      { label: 'Parohii partenere', value: '450+' },
      { label: 'Slujbe transmise live', value: '8.500+' },
      { label: 'Donat parohii', value: '380K RON' },
      { label: 'Țări acoperite', value: '24' },
    ],
  },
};

export default COMING_SOON_SERVICES;
export { SITE };
