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
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80&auto=format&fit=crop' },
  { id: 'auto-sales',       label: 'Vânzări auto',             desc: 'Mașini la prețuri reduse, specificații complete',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80&auto=format&fit=crop' },
  { id: 'real-estate-sales',label: 'Vânzări imobile',          desc: 'Case + terenuri cu catalog AI personalizat',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80&auto=format&fit=crop' },
  { id: 'auto-parts',       label: 'Piese auto globale',       desc: 'Brand, an, preț, stare — toate într-un singur catalog',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80&auto=format&fit=crop' },
  { id: 'auto-services',    label: 'Mecanici & service auto',  desc: 'Calcul preț servicii + plată online + tractare',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80&auto=format&fit=crop' },
  { id: 'payments',         label: 'Motor plăți online',       desc: 'Procesare plăți pentru toate serviciile EPD',
    image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600&q=80&auto=format&fit=crop' },
  { id: 'epd-shop',         label: 'EPD Shop',                 desc: 'Search produse, retaileri afiliați, order online',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80&auto=format&fit=crop' },
  { id: 'global-tv',        label: 'TV online global',         desc: 'Streaming televiziune pe țări',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80&auto=format&fit=crop' },
  { id: 'global-radio',     label: 'Radio online global',      desc: 'Radio pe țări și genuri muzicale',
    image: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&q=80&auto=format&fit=crop' },
  { id: 'tree-distribution',label: 'Distribuție copaci',       desc: 'Plantări mediu + reforestation worldwide',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80&auto=format&fit=crop' },
  { id: 'goods-distributor',label: 'Distribuitor marfuri',     desc: 'Aprovizionare magazine + supermarket worldwide',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80&auto=format&fit=crop' },
  { id: 'infrastructure',   label: 'Constructori-Finanțatori', desc: 'Lucrări publice, infrastructură, drumuri, reabilitări',
    image: 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=600&q=80&auto=format&fit=crop' },
  { id: 'fuel-ev',          label: 'Benzinării + EV',          desc: 'Stații compatibile cu rețeaua EPD',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80&auto=format&fit=crop' },
  { id: 'car-wash',         label: 'Spălătorii auto',          desc: 'Rezervare + plată online',
    image: 'https://images.unsplash.com/photo-1605618826115-fb9e0c93a6cb?w=600&q=80&auto=format&fit=crop' },
  { id: 'restaurants',      label: 'Restaurante',              desc: 'Comenzi + livrare + rating EPD',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80&auto=format&fit=crop' },
  { id: 'energy-conn',      label: 'Racordări energetice',     desc: 'Clienții se racordează direct prin platformă',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80&auto=format&fit=crop' },
  { id: 'eu-funds',         label: 'Fonduri europene',         desc: 'Aplicare la finanțări nerambursabile',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&auto=format&fit=crop' },
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
  { id: 'tropical-resort',  icon: '🌴', label: 'Stațiune tropicală',       desc: 'Mini-Grecia în România — plantări palmieri, ambianță mediteraneană, prețuri populare' },
  { id: 'riviera-ro',       icon: '🌊', label: '🏖️ Riviera Românească (MISIUNEA EPD)', desc: 'Construirea întregului litoral românesc în cea mai extinsă plajă turistică națională — destinație globală cu tradiție, prețuri accesibile și amintiri de neuitat', route: '/riviera-romaneasca', flagship: true },
];
