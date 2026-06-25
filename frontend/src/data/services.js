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
  { id: 'hotel-chain',      label: 'Lanț hoteluri',            desc: 'Camere gratuite pentru oamenii străzii, prețuri de la 1$/noapte' },
  { id: 'epd-supermarket',  label: 'EPD Supermarket',          desc: 'Cel mai mare supermarket global — unește toate brand-urile' },
  { id: 'global-food',      label: 'Mâncare worldwide',        desc: 'Comenzi la preț, calitate, timp livrare cu door-to-door' },
  { id: 'global-jobs',      label: 'Locuri muncă globale',     desc: 'Joburi pe domenii, fără frontiere' },
  { id: 'auto-sales',       label: 'Vânzări auto',             desc: 'Mașini la prețuri reduse, specificații complete' },
  { id: 'real-estate-sales',label: 'Vânzări imobile',          desc: 'Case + terenuri cu catalog AI personalizat' },
  { id: 'auto-parts',       label: 'Piese auto globale',       desc: 'Brand, an, preț, stare — toate într-un singur catalog' },
  { id: 'auto-services',    label: 'Mecanici & service auto',  desc: 'Calcul preț servicii + plată online + tractare' },
  { id: 'payments',         label: 'Motor plăți online',       desc: 'Procesare plăți pentru toate serviciile EPD' },
  { id: 'epd-shop',         label: 'EPD Shop',                 desc: 'Search produse, retaileri afiliați, order online' },
  { id: 'global-tv',        label: 'TV online global',         desc: 'Streaming televiziune pe țări' },
  { id: 'global-radio',     label: 'Radio online global',      desc: 'Radio pe țări și genuri muzicale' },
  { id: 'tree-distribution',label: 'Distribuție copaci',       desc: 'Plantări mediu + reforestation worldwide' },
  { id: 'goods-distributor',label: 'Distribuitor marfuri',     desc: 'Aprovizionare magazine + supermarket worldwide' },
  { id: 'infrastructure',   label: 'Constructori-Finanțatori', desc: 'Lucrări publice, infrastructură, drumuri, reabilitări' },
  { id: 'fuel-ev',          label: 'Benzinării + EV',          desc: 'Stații compatibile cu rețeaua EPD' },
  { id: 'car-wash',         label: 'Spălătorii auto',          desc: 'Rezervare + plată online' },
  { id: 'restaurants',      label: 'Restaurante',              desc: 'Comenzi + livrare + rating EPD' },
  { id: 'energy-conn',      label: 'Racordări energetice',     desc: 'Clienții se racordează direct prin platformă' },
  { id: 'eu-funds',         label: 'Fonduri europene',         desc: 'Aplicare la finanțări nerambursabile' },
  { id: 'state-funds',      label: 'Fonduri de stat',          desc: 'Infrastructură + dezvoltare urbană direct de la minister' },
  { id: 'epd-mail',         label: 'EPD Mail',                 desc: 'Singurul serviciu de email global cu zero spam' },
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
