import LegalLayout from './LegalLayout';

const Section = ({ n, title, children }) => (
  <section>
    <h2 className="text-xl font-semibold tracking-tight mb-3"><span className="mono text-[#FFB300] mr-2">{n}.</span>{title}</h2>
    <div className="text-gray-700 space-y-3 text-[15px]">{children}</div>
  </section>
);

export default function Confidentialitate() {
  return (
    <LegalLayout title="Politică de Confidențialitate" eyebrow="// Cum protejăm datele dvs.">
      <p>
        Această politică explică ce date colectăm prin platforma <strong>Energy Project Design Services</strong>,
        cum le folosim și ce drepturi aveți. Operator de date: <strong>ENERGY PROJECT DESIGN SRL</strong>,
        sediu în <strong>Str. Lt. Alexandru Popescu nr. 9B, Sectorul 3, București</strong>, CUI <strong>43151074</strong>,
        contact GDPR: <a href="mailto:dpo@energyprojectdesign.ro" className="font-semibold underline">dpo@energyprojectdesign.ro</a>.
      </p>

      <Section n="01" title="Date colectate">
        <ul className="list-disc pl-6 space-y-1.5">
          <li><strong>Cont:</strong> nume, email, parolă (hash), firmă (opțional), poză profil (Google).</li>
          <li><strong>Conținut:</strong> șabloane DOCX, ștampile, certificate PKCS#12, documente generate.</li>
          <li><strong>Configurare email:</strong> adresa Gmail și parola de aplicație, folosite exclusiv pentru a trimite emailuri în numele dvs.</li>
          <li><strong>Plăți:</strong> id tranzacție Stripe (datele cardului nu sunt stocate de noi).</li>
          <li><strong>Tehnice:</strong> adresa IP, user-agent, log-uri de acces.</li>
        </ul>
      </Section>

      <Section n="02" title="Scop">
        <p>Furnizarea serviciului, autentificare, generarea și trimiterea documentelor, procesarea abonamentelor, suport tehnic, conformare legală (facturare, AML, GDPR).</p>
      </Section>

      <Section n="03" title="Bază legală">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Executarea contractului (Art. 6(1)(b) GDPR) — pentru furnizarea serviciului.</li>
          <li>Obligație legală (Art. 6(1)(c)) — facturare, contabilitate.</li>
          <li>Consimțământ (Art. 6(1)(a)) — comunicări de marketing (revocabil oricând).</li>
        </ul>
      </Section>

      <Section n="04" title="Stocare">
        <p>Datele sunt stocate pe servere în UE (MongoDB), criptate la repaus și în tranzit (TLS 1.3). Parolele Gmail App Password sunt stocate criptat și nu sunt accesibile prin interfață.</p>
      </Section>

      <Section n="05" title="Partajare">
        <ul className="list-disc pl-6 space-y-1.5">
          <li><strong>Stripe</strong> — procesarea plăților.</li>
          <li><strong>Google</strong> — autentificare OAuth și trimitere emailuri SMTP (dacă alegeți să configurați).</li>
          <li><strong>Autorități</strong> — la cerere legală.</li>
        </ul>
        <p>Nu vindem și nu închiriem date personale către terți.</p>
      </Section>

      <Section n="06" title="Durata stocării">
        <p>Date cont: pe durata existenței contului plus 3 ani. Documente generate: până la ștergerea de către utilizator. Facturi: 10 ani (obligație legală).</p>
      </Section>

      <Section n="07" title="Drepturile dvs.">
        <p>Conform GDPR aveți dreptul de acces, rectificare, ștergere, restricționare, portabilitate, opoziție. Vezi pagina <a href="/gdpr" className="font-semibold underline">GDPR</a> pentru cum să le exercitați.</p>
      </Section>

      <Section n="08" title="Cookies">
        <p>Folosim cookie-uri esențiale pentru autentificare (session_token httpOnly) și pentru memorarea preferințelor. Nu folosim cookie-uri de marketing fără consimțământ.</p>
      </Section>

      <Section n="09" title="Modificări">
        <p>Vom anunța orice modificare majoră prin email cu minim 30 de zile înainte de aplicare.</p>
      </Section>
    </LegalLayout>
  );
}
