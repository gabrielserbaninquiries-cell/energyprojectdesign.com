/**
 * EPD — Catalog servicii & misiuni (V11.1)
 *
 * Extracție din Landing.jsx pentru:
 *   - keep components < 50 lines per section
 *   - reuse across pages (Landing, Dashboard, ServiciiPage)
 *   - i18n-ready (string-only constants)
 *
 * IDs sunt stabile (slug) — folosit ca React key (nu index).
 */

export const ACTIVE_SERVICES = [
  { id: 'gas',         label: 'Gaze naturale',      desc: 'Documentație tehnică 100% conformă NTPEE 2018', emoji: '🔥', route: '/gaze-naturale', live: true },
  { id: 'electric',    label: 'Electric',           desc: 'Branșamente, instalații, fotovoltaice', emoji: '⚡', route: '/electric', live: false },
  { id: 'water',       label: 'Apă-canal',          desc: 'Branșamente, racorduri, rețele', emoji: '💧', route: '/water', live: false },
  { id: 'civil',       label: 'Construcții civile', desc: 'DTAC, PTH, DALI, devize, situații lucrări', emoji: '🏗️', route: '/civil', live: false },
  { id: 'telecom',     label: 'Telecom',            desc: 'Fibre optice, antene, rețele de comunicații', emoji: '📡', route: '/telecom', live: false },
  { id: 'photovoltaic',label: 'Fotovoltaice',       desc: 'Studii, dimensionare, racordare la rețea', emoji: '☀️', route: '/photovoltaic', live: false },
];

// VIITOR — 22 servicii globale planificate (per master plan EPD)
export const FUTURE_SERVICES = [
  { id: 'hotel-chain',      label: 'Lanț hoteluri',            desc: 'Camere gratuite pentru oamenii străzii, prețuri de la 1$/noapte',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80&auto=format&fit=crop' },
  { id: 'epd-supermarket',  label: 'EPD Supermarket',          desc: 'Cel mai mare supermarket global — unește toate brand-urile',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80&auto=format&fit=crop' },
  { id: 'global-food',      label: 'Mâncare worldwide',        desc: 'Comenzi la preț, calitate, timp livrare cu door-to-door',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop' },
  { id: 'global-jobs',      label: 'Locuri muncă globale',     desc: 'Joburi pe domenii, fără frontiere',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80&auto=format&fit=crop' },
  { id: 'auto-sales',       label: 'Vânzări auto',             desc: 'Mașini la prețuri reduse, specificații complete',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80&auto=format&fit=crop' },
  { id: 'real-estate-sales',label: 'Vânzări imobile',          desc: 'Case + terenuri cu catalog AI personalizat',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80&auto=format&fit=crop' },
  { id: 'auto-parts',       label: 'Piese auto globale',       desc: 'Brand, an, preț, stare — toate într-un singur catalog',
    image: 'https://images.unsplash.com/photo-1637640125496-31852f042a60?w=600&q=80&auto=format&fit=crop' },
  { id: 'auto-services',    label: 'Mecanici & service auto',  desc: 'Calcul preț servicii + plată online + tractare',
    image: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=600&q=80&auto=format&fit=crop' },
  { id: 'payments',         label: 'Motor plăți online',       desc: 'Procesare plăți pentru toate serviciile EPD',
    image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600&q=80&auto=format&fit=crop' },
  { id: 'epd-shop',         label: 'EPD Shop',                 desc: 'Search produse, retaileri afiliați, order online',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80&auto=format&fit=crop' },
  { id: 'global-tv',        label: 'TV online global',         desc: 'Streaming televiziune pe țări',
    image: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=600&q=80&auto=format&fit=crop' },
  { id: 'global-radio',     label: 'Radio online global',      desc: 'Radio pe țări și genuri muzicale',
    image: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&q=80&auto=format&fit=crop' },
  { id: 'tree-distribution',label: 'Distribuție copaci',       desc: 'Plantări mediu + reforestation worldwide',
    image: 'https://images.unsplash.com/photo-1503435980610-a51f3ddfee50?w=600&q=80&auto=format&fit=crop' },
  { id: 'goods-distributor',label: 'Distribuitor marfuri',     desc: 'Aprovizionare magazine + supermarket worldwide',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80&auto=format&fit=crop' },
  { id: 'infrastructure',   label: 'Constructori-Finanțatori', desc: 'Lucrări publice, infrastructură, drumuri, reabilitări',
    image: 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=600&q=80&auto=format&fit=crop' },
  { id: 'fuel-ev',          label: 'Benzinării + EV',          desc: 'Stații compatibile cu rețeaua EPD',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80&auto=format&fit=crop' },
  { id: 'car-wash',         label: 'Spălătorii auto',          desc: 'Rezervare + plată online',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&q=80&auto=format&fit=crop' },
  { id: 'restaurants',      label: 'Restaurante',              desc: 'Comenzi + livrare + rating EPD',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80&auto=format&fit=crop' },
  { id: 'energy-conn',      label: 'Racordări energetice',     desc: 'Clienții se racordează direct prin platformă',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80&auto=format&fit=crop' },
  { id: 'eu-funds',         label: 'Fonduri europene',         desc: 'Aplicare la finanțări nerambursabile',
    image: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=600&q=80&auto=format&fit=crop' },
  { id: 'state-funds',      label: 'Fonduri de stat',          desc: 'Infrastructură + dezvoltare urbană direct de la minister',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop' },
  { id: 'epd-mail',         label: 'EPD Mail',                 desc: 'Singurul serviciu de email global cu zero spam',
    image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&q=80&auto=format&fit=crop' },
];

// V11.0 — VIZIUNI EPD NEXT-GEN (cerințe literale fondator, Feb 2026)
export const NEXT_GEN_MISSIONS = [
  { id: 'voturi-cnp',       icon: '🗳️', label: 'Voturi live electronice', desc: 'Vot cetățenesc digital pe baza CNP — alegeri, referendumuri și sondaje publice în timp real, cu trasabilitate criptografică', route: '/voturi-cnp' },
  { id: 'event-tickets',    icon: '🎫', label: 'Bilete evenimente',        desc: 'Marketplace global pentru concerte, festivaluri, conferințe — cu QR code și revânzare etică' },
  { id: 'flight-tickets',   icon: '✈️', label: 'Bilete avion',             desc: 'Cumpărare bilete cu cel mai mic preț din ecosistem EPD, alerte cădere preț, miles loyalty' },
  { id: 'charity',          icon: '💛', label: 'Cauze caritabile',         desc: 'Crowdfunding transparent pentru cauze umanitare — fiecare donație urmărită on-chain' },
  { id: 'works-mgmt',       icon: '🛠️', label: 'Gestiune lucrări interne', desc: 'Aplicație internă pentru echipe — task-uri, time-tracking, devize, calitate, foto-raportare' },
  { id: 'parking',          icon: '🅿️', label: 'Parcări urbane (constructor + locator + plătitor)', desc: 'Construire infrastructură + găsire loc + plată cu un singur tap — în orice oraș al lumii' },
  { id: 'sea-port',         icon: '⚓', label: 'Port popular global',      desc: 'Marketplace logistic maritim — cele mai bune rute, prețuri și operatori, vizibil pentru orice antreprenor' },
  { id: 'modular-houses',   icon: '🏠', label: 'Case modulare amplasabile', desc: 'Locuințe gata construite, livrate și amplasate la cheie — perfecte pentru sinistrați, locuințe rapide, vacanțe' },
  { id: 'auctions',         icon: '🔨', label: 'Motor licitații lucrări',  desc: '"Cel mai mic preț + cel mai rapid + cea mai bună calitate" — algoritm transparent care alege automat câștigătorul' },
  { id: 'taxi-global',      icon: '🚖', label: 'Taxi global EPD',          desc: 'Aplicație taxi globală — un singur cont, orice oraș, prețuri transparente, șoferi verificați' },
  { id: 'tropical-resort',  icon: '🌊', label: 'Renașterea litoralului',       desc: 'Modernizare reală a litoralului românesc — infrastructură contemporană, vegetație autohtonă rezistentă, autenticitate carpato-pontică',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop' },
  { id: 'riviera-ro',       icon: '🌊', label: '🏖️ Riviera Românească (MISIUNEA EPD)', desc: 'Modernizarea reală a litoralului românesc — infrastructură contemporană, vegetație autohtonă rezistentă, identitate carpato-pontică. NU copiem alte destinații — readucem turismul românesc acasă.', route: '/riviera-romaneasca', flagship: true },
];

// V12.5 — ECOSISTEM COMPLET (cerință literală user: „singura platformă din lume pentru toate serviciile")
// V12.6 — Fiecare serviciu are IMAGINE RELEVANTĂ (Unsplash CC0) — nu doar emoji.
export const EPD_ECOSYSTEM = [
  // === LOGISTICĂ & TRANSPORT ===
  { category: 'Logistică & Transport', id: 'curierat',           icon: '📦', label: 'Curierat rapid',            desc: 'Livrări door-to-door, tracking live',
    image: 'https://images.unsplash.com/photo-1614976523626-d598aafd4fda?w=600&q=80&auto=format&fit=crop' },
  { category: 'Logistică & Transport', id: 'logistica-depozite', icon: '🏭', label: 'Logistică & depozite',      desc: 'Fulfillment, stocare, cross-docking, WMS integrat',
    image: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=600&q=80&auto=format&fit=crop' },
  { category: 'Logistică & Transport', id: 'book-flight',        icon: '✈️', label: 'Book a Flight (real)',      desc: 'Bilete avion cu cel mai bun preț global — API Amadeus/Duffel',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80&auto=format&fit=crop' },
  { category: 'Logistică & Transport', id: 'transport-persoane', icon: '🚌', label: 'Transport persoane',        desc: 'Rutier + feroviar + naval + aerian — un singur ecosistem',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80&auto=format&fit=crop' },
  { category: 'Logistică & Transport', id: 'transport-ferovial', icon: '🚄', label: 'Transport feroviar',        desc: 'Bilete trenuri, rezervări worldwide',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80&auto=format&fit=crop' },
  { category: 'Logistică & Transport', id: 'transport-naval',    icon: '🚢', label: 'Transport naval',           desc: 'Feriboturi + croaziere + cargo pasager',
    image: 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=600&q=80&auto=format&fit=crop' },

  // === SERVICII CETĂȚENI ===
  { category: 'Servicii cetățeni', id: 'curatenie',       icon: '🧹', label: 'Servicii curățenie',           desc: 'Curățenie rezidențială, birouri, industrială',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80&auto=format&fit=crop' },
  { category: 'Servicii cetățeni', id: 'salubritate',     icon: '🚛', label: 'Salubritate urbană',           desc: 'Colectare deșeuri, reciclare, spații publice',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80&auto=format&fit=crop' },
  { category: 'Servicii cetățeni', id: 'inchiriere-personal', icon: '🤵', label: 'Închiriere personal',       desc: 'Ospătari, barmani, hostess, personal HORECA la eveniment',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80&auto=format&fit=crop' },
  { category: 'Servicii cetățeni', id: 'florarii',        icon: '🌹', label: 'Florării',                     desc: 'Livrare flori worldwide + aranjamente + cadouri',
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80&auto=format&fit=crop' },
  { category: 'Servicii cetățeni', id: 'servicii-funerare', icon: '⚰️', label: 'Servicii funerare',          desc: 'Domiciliu sau locație, cu demnitate',
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80&auto=format&fit=crop' },

  // === CONSTRUCȚII & AMENAJĂRI ===
  { category: 'Construcții & Amenajări', id: 'constructii-blocuri', icon: '🏢', label: 'Construcții blocuri',       desc: 'Rezidențial + comercial + industrial la cheie',
    image: 'https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=600&q=80&auto=format&fit=crop' },
  { category: 'Construcții & Amenajări', id: 'anunt-lucrari',       icon: '🔨', label: 'Anunțuri lucrări',           desc: 'Vopsit bloc, reabilitare, placare polistiren, tencuială',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80&auto=format&fit=crop' },
  { category: 'Construcții & Amenajări', id: 'amenajari-interioare', icon: '🛋️', label: 'Amenajări interioare',      desc: 'Design + execuție + materiale de la producători',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80&auto=format&fit=crop' },
  { category: 'Construcții & Amenajări', id: 'montaje-mobila',      icon: '🪑', label: 'Montaje / cărat / încărcat mobilă', desc: 'Mutări, montaj IKEA/personalizat, transport mobilă',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80&auto=format&fit=crop' },
  { category: 'Construcții & Amenajări', id: 'constructii-drumuri', icon: '🛣️', label: 'Drumuri publice / autostrăzi', desc: 'Infrastructură rutieră publică cu licitații publice',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80&auto=format&fit=crop' },
  { category: 'Construcții & Amenajări', id: 'intretinere-public',  icon: '🚧', label: 'Întreținere spațiu public',   desc: 'Iluminat, marcaje, verdeață, mobilier urban',
    image: 'https://images.unsplash.com/photo-1519802772250-a52a9af0eacb?w=600&q=80&auto=format&fit=crop' },

  // === COMERȚ & E-COMMERCE ===
  { category: 'Comerț & E-commerce', id: 'mall-online',       icon: '🏬', label: 'Mall online (virtual)',      desc: 'Mall global — magazine sub un singur brand',
    image: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80&auto=format&fit=crop' },
  { category: 'Comerț & E-commerce', id: 'aprovizionare',     icon: '📥', label: 'Aprovizionare mărfuri / magazine', desc: 'B2B supply chain pentru retaileri',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80&auto=format&fit=crop' },
  { category: 'Comerț & E-commerce', id: 'app-store-global',  icon: '📱', label: 'App Store Global',          desc: 'Distribuție aplicații mobile fără taxe abuzive',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80&auto=format&fit=crop' },
  { category: 'Comerț & E-commerce', id: 'librarie-online',   icon: '📚', label: 'Librărie online audio+digital', desc: 'Cărți, audiobook-uri, ebook-uri worldwide',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80&auto=format&fit=crop' },

  // === EDUCAȚIE & SĂNĂTATE ===
  { category: 'Educație & Sănătate', id: 'cursuri-online', icon: '🎓', label: 'Cursuri online școli + universități', desc: 'Platforme educaționale acreditate',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80&auto=format&fit=crop' },
  { category: 'Educație & Sănătate', id: 'educatie-sanatate', icon: '❤️‍🩹', label: 'Educație pentru sănătate', desc: 'Cursuri, articole, video pentru prevenție & wellbeing',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80&auto=format&fit=crop' },
  { category: 'Educație & Sănătate', id: 'spitale',         icon: '🏥', label: 'Spitale & servicii medicale', desc: 'Programări, telemedicine, dosar electronic pacient',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80&auto=format&fit=crop' },

  // === MEDIA & MARKETING ===
  { category: 'Media & Marketing', id: 'stiri-online',    icon: '📰', label: 'Știri online',              desc: 'Redacție globală multi-limbă cu verificare surse',
    image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&q=80&auto=format&fit=crop' },
  { category: 'Media & Marketing', id: 'reclame-online',  icon: '📢', label: 'Reclame online',            desc: 'Ad network EPD — targetare precisă, prețuri corecte',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&q=80&auto=format&fit=crop' },
  { category: 'Media & Marketing', id: 'pr-marketing',    icon: '📈', label: 'PR & marketing online',     desc: 'Servicii agency global — social media, SEO, content',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80&auto=format&fit=crop' },
  { category: 'Media & Marketing', id: 'marketing-global',icon: '🌐', label: 'Marketing global multi-produs', desc: 'Campanii pentru toate tipurile de produse din EPD',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&auto=format&fit=crop' },

  // === EVENIMENTE & DIVERTISMENT ===
  { category: 'Evenimente & Divertisment', id: 'intermediere-evenimente', icon: '🎉', label: 'Intermediere evenimente', desc: 'Nunți, botezuri, cununii, majorate, corporate, conferințe',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80&auto=format&fit=crop' },
  { category: 'Evenimente & Divertisment', id: 'booking-evenimente',      icon: '🎪', label: 'Booking evenimente worldwide', desc: 'Rezervări artiști, locații, echipamente',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80&auto=format&fit=crop' },
  { category: 'Evenimente & Divertisment', id: 'gamespace',                icon: '🎮', label: 'Gamespace Platform',      desc: 'Ecosistem gaming — turnee, streaming, achiziții in-game',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80&auto=format&fit=crop' },
  { category: 'Evenimente & Divertisment', id: 'sports-events',            icon: '🏆', label: 'Sports Events Platform',  desc: 'Turnee sportive amateur/pro + bilete + statistici',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80&auto=format&fit=crop' },
  { category: 'Evenimente & Divertisment', id: 'competition-platform',     icon: '⚔️', label: 'Competition Platform',    desc: 'Concursuri, hackathon-uri, tenders — cu leaderboard-uri',
    image: 'https://images.unsplash.com/photo-1552664688-cf412ec27db2?w=600&q=80&auto=format&fit=crop' },

  // === MUNCĂ & AFACERI ===
  { category: 'Muncă & Afaceri', id: 'anunt-servicii', icon: '🎵', label: 'Cereri servicii (music/DJ/foto/IT)', desc: 'Marketplace pentru DJ, fotografi, catering HORECA, developeri IT',
    image: 'https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=600&q=80&auto=format&fit=crop' },
  { category: 'Muncă & Afaceri', id: 'interviu-global',icon: '🎙️', label: 'Interviu online global',           desc: 'Aplicație dedicată — recruteri + candidați worldwide',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&auto=format&fit=crop' },
  { category: 'Muncă & Afaceri', id: 'business-locator',icon: '📍', label: 'Business Locator',                 desc: 'Găsește firma potrivită pentru orice serviciu, oriunde',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80&auto=format&fit=crop' },
  { category: 'Muncă & Afaceri', id: 'b2b-affiliations',icon: '🤝', label: 'Afilieri Business-to-Business',    desc: 'Rețea de parteneriate + comisioane transparente',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80&auto=format&fit=crop' },
  { category: 'Muncă & Afaceri', id: 'broker-db',       icon: '🗂️', label: 'Baze date pentru brokeraj',        desc: 'Companiile aleg liber să fie listate pentru produse/servicii',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format&fit=crop' },
  { category: 'Muncă & Afaceri', id: 'local-business',  icon: '🏪', label: 'Susținere afaceri locale',         desc: 'Program dedicat de vizibilitate pentru IMM-uri românești',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80&auto=format&fit=crop' },

  // === INDUSTRIE ===
  { category: 'Industrie', id: 'servicii-industriale', icon: '⚙️', label: 'Servicii industriale (hale, uzine)', desc: 'Proiectare + execuție + mentenanță fabrici',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80&auto=format&fit=crop' },
  { category: 'Industrie', id: 'servicii-miniere',     icon: '⛏️', label: 'Servicii miniere',              desc: 'Consultanță, echipamente, siguranță, mining tech',
    image: 'https://images.unsplash.com/photo-1518291344630-4857135fb581?w=600&q=80&auto=format&fit=crop' },
  { category: 'Industrie', id: 'reinnoire-parc-auto',  icon: '🚗', label: 'Reînnoire parc auto',           desc: 'Flotă corporate — cumpărare + rulaj + Rabla EPD',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80&auto=format&fit=crop' },
  { category: 'Industrie', id: 'dezvoltare-produse',   icon: '🧪', label: 'Dezvoltare produse globale',    desc: 'R&D partnering — laboratoare, testări, brevete',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80&auto=format&fit=crop' },

  // === TEHNOLOGIE VIITOR ===
  { category: 'Tehnologie viitor', id: 'vr-platform',      icon: '🥽', label: 'Virtual Reality Universe', desc: 'Metavers propriu EPD — meeting-uri, evenimente, tururi imobiliare',
    image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&q=80&auto=format&fit=crop' },
  { category: 'Tehnologie viitor', id: 'meeting-platform', icon: '💻', label: 'Meeting Platform',         desc: 'Alternativă Zoom/Meet — criptare end-to-end, fără reclame',
    image: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=600&q=80&auto=format&fit=crop' },
];
