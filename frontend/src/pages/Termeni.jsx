import LegalLayout from './LegalLayout';
import useSEO from '../hooks/useSEO';

const Section = ({ n, title, children }) => (
  <section>
    <h2 className="text-xl font-semibold tracking-tight mb-3"><span className="mono text-[#FFB300] mr-2">{n}.</span>{title}</h2>
    <div className="text-gray-700 space-y-3 text-[15px]">{children}</div>
  </section>
);

export default function Termeni() {
  useSEO({
    title: 'Termeni și Condiții · Energy Project Design',
    description: 'Termeni și condiții de utilizare a platformei Energy Project Design Services (EPD). Document juridic conform legislației române, GDPR, eIDAS. Operator: ENERGY PROJECT DESIGN SRL, CUI 43151074, J40/12982/2020.',
    canonical: 'https://www.energyprojectdesign.com/termeni',
    keywords: 'termeni si conditii EPD, terms of service energy project design, juridic platforma, CUI 43151074, J40/12982/2020',
    breadcrumbs: [
      { name: 'Acasă', url: '/' },
      { name: 'Termeni și Condiții', url: '/termeni' },
    ],
  });
  return (
    <LegalLayout title="Termeni și Condiții" eyebrow="// Document juridic">
      <p className="text-gray-700">
        Prezentul document reglementează utilizarea platformei <strong>Energy Project Design Services</strong> ("Platforma"),
        operată de <strong>ENERGY PROJECT DESIGN SRL</strong>, cu sediul în <strong>Str. Lt. Alexandru Popescu nr. 9B, Et. mansardă, Cam. 1, Sectorul 3, București, cod 032577</strong>,
        înregistrată la Registrul Comerțului cu nr. <strong>J40/12982/2020</strong>,
        CUI <strong>43151074</strong>, cod CAEN 7112 — Activități de inginerie și consultanță tehnică ("Operatorul").
      </p>

      <Section n="01" title="Acceptarea termenilor">
        <p>Prin crearea unui cont sau utilizarea Platformei sunteți de acord cu prezentul document. Dacă nu sunteți de acord, nu utilizați Platforma.</p>
      </Section>

      <Section n="02" title="Descrierea serviciului">
        <p>Platforma permite generarea, ștampilarea și semnarea digitală a documentelor DOCX, precum și trimiterea acestora prin email către destinatari aleși de utilizator. Funcționalitățile pot fi modificate, extinse sau retrase de către Operator.</p>
      </Section>

      <Section n="03" title="Cont utilizator">
        <p>Înregistrarea se poate face prin email/parolă sau prin contul Google. Utilizatorul este responsabil pentru păstrarea confidențialității credențialelor și pentru toate acțiunile efectuate sub contul său.</p>
      </Section>

      <Section n="04" title="Planuri și plăți">
        <p>Sunt disponibile planuri Free, Pro și Enterprise, cu prețurile afișate în pagina de tarife (RON, TVA inclus). Plățile sunt procesate prin Stripe. Abonamentele se reînnoiesc lunar până la anulare.</p>
      </Section>

      <Section n="05" title="Semnătura digitală">
        <p>Platforma oferă semnătură electronică bazată pe certificate PKCS#12 încărcate de utilizator. Pentru semnătură electronică calificată (QES) conform Regulamentului eIDAS, utilizatorul trebuie să dețină un certificat calificat emis de un Prestator de Servicii de Încredere Calificat (certSIGN, DigiSign, Trans Sped etc.). Operatorul nu garantează caracterul calificat al semnăturilor produse cu certificate necalificate.</p>
      </Section>

      <Section n="06" title="Conținut utilizator">
        <p>Documentele, ștampilele și certificatele încărcate rămân proprietatea utilizatorului. Operatorul le stochează exclusiv pentru a furniza serviciul. Utilizatorul garantează că deține toate drepturile asupra conținutului încărcat.</p>
      </Section>

      <Section n="07" title="Limitarea răspunderii">
        <p>Platforma este furnizată "ca atare". Operatorul nu răspunde pentru daune indirecte, pierderi de profit sau prejudicii rezultate din utilizarea Platformei, în limita maximă permisă de lege.</p>
      </Section>

      <Section n="08" title="Modificarea termenilor">
        <p>Operatorul poate modifica acești termeni cu notificare prealabilă de 30 de zile prin email sau notificare în aplicație.</p>
      </Section>

      <Section n="09" title="Legea aplicabilă">
        <p>Prezentul contract este guvernat de legea română. Orice litigiu se va soluționa amiabil sau, în caz contrar, de instanțele competente din <strong>Municipiul București</strong>.</p>
      </Section>

      <Section n="10" title="Contact">
        <p>Întrebări la <a href="mailto:contact@energyprojectdesign.ro" className="text-black font-semibold underline">contact@energyprojectdesign.ro</a>.</p>
      </Section>
    </LegalLayout>
  );
}
