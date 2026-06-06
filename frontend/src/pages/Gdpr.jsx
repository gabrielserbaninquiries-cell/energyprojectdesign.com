import LegalLayout from './LegalLayout';
import { Shield, FileX, FileSearch, Mail } from 'lucide-react';

const Section = ({ n, title, children }) => (
  <section>
    <h2 className="text-xl font-semibold tracking-tight mb-3"><span className="mono text-[#FFB300] mr-2">{n}.</span>{title}</h2>
    <div className="text-gray-700 space-y-3 text-[15px]">{children}</div>
  </section>
);

export default function Gdpr() {
  const rights = [
    { icon: FileSearch, t: 'Dreptul de acces', d: 'Puteți cere o copie a datelor pe care le deținem despre dvs.' },
    { icon: Shield, t: 'Dreptul de rectificare', d: 'Puteți cere corectarea datelor incorecte sau actualizarea celor incomplete.' },
    { icon: FileX, t: 'Dreptul de ștergere', d: '"Dreptul de a fi uitat" — ștergerea contului și a tuturor datelor asociate.' },
    { icon: Mail, t: 'Dreptul de opoziție', d: 'Vă puteți opune prelucrării datelor în scop de marketing direct.' },
  ];

  return (
    <LegalLayout title="GDPR — Protecția Datelor" eyebrow="// Regulamentul (UE) 2016/679">
      <p>
        StampDoc.ro respectă Regulamentul General privind Protecția Datelor (GDPR). Această pagină vă explică drepturile dvs. și cum le puteți exercita.
      </p>

      <div className="grid md:grid-cols-2 gap-px bg-gray-200 border border-gray-200 not-prose my-8">
        {rights.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.t} className="bg-white p-6">
              <Icon className="w-6 h-6 mb-3 text-[#FFB300]" />
              <h3 className="font-semibold mb-1">{r.t}</h3>
              <p className="text-sm text-gray-600">{r.d}</p>
            </div>
          );
        })}
      </div>

      <Section n="01" title="Operatorul de date">
        <p><strong>ENERGY PROJECT DESIGN SRL</strong>, sediu social: <strong>Str. Lt. Alexandru Popescu nr. 9B, Et. mansardă, Cam. 1, Sectorul 3, București</strong>, CUI: <strong>43151074</strong>, J40/12982/2020.</p>
        <p>Responsabil cu protecția datelor (DPO): <a href="mailto:dpo@energyprojectdesign.ro" className="font-semibold underline">dpo@energyprojectdesign.ro</a>.</p>
      </Section>

      <Section n="02" title="Cum exercitați drepturile">
        <p>Trimiteți o cerere la <a href="mailto:dpo@energyprojectdesign.ro" className="font-semibold underline">dpo@energyprojectdesign.ro</a> cu:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Numele complet și adresa de email asociată contului.</li>
          <li>Tipul dreptului pe care doriți să-l exercitați.</li>
          <li>O scurtă descriere a cererii.</li>
        </ul>
        <p>Veți primi răspuns în maxim 30 de zile. Pentru cereri complexe termenul poate fi extins cu încă 60 de zile, cu notificare.</p>
      </Section>

      <Section n="03" title="Reclamații">
        <p>Dacă nu sunteți mulțumit de răspunsul nostru, puteți depune o plângere la <strong>ANSPDCP</strong> (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal):</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București</li>
          <li>Tel: +40 318 059 211</li>
          <li>Email: anspdcp@dataprotection.ro</li>
          <li>Web: <a href="https://www.dataprotection.ro" target="_blank" rel="noreferrer" className="underline">www.dataprotection.ro</a></li>
        </ul>
      </Section>

      <Section n="04" title="Transfer de date în afara UE">
        <p>Datele dvs. sunt stocate pe servere în UE. În cazul transferurilor către parteneri din afara UE (ex. Stripe US, Google US), se aplică Clauzele Contractuale Standard aprobate de Comisia Europeană.</p>
      </Section>

      <Section n="05" title="Ștergerea contului">
        <p>Puteți șterge oricând contul din <a href="/settings" className="font-semibold underline">Setări</a>. Ștergerea include toate documentele, șabloanele, ștampilele și certificatele. Acțiunea este ireversibilă.</p>
      </Section>
    </LegalLayout>
  );
}
