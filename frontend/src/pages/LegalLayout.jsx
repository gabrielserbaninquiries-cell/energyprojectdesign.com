import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EPDLogo from '../components/EPDLogo';

export default function LegalLayout({ title, eyebrow, children }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <EPDLogo />
          <Link to="/" className="ghost-btn text-sm"><ArrowLeft className="w-4 h-4" /> Înapoi</Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-6 lg:px-12 py-16 page-enter">
        <div className="label mb-3">{eyebrow}</div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4 text-zinc-950">{title}</h1>
        <div className="text-sm text-zinc-500 mb-12">Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</div>

        <div className="prose-legal space-y-8 text-[15px] leading-relaxed text-zinc-800">
          {children}
        </div>
      </article>

      <footer className="border-t border-zinc-200 py-10 mt-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>© {new Date().getFullYear()} Energy Project Design SRL · International electronic technical documentation, certified and digitally stamped.</div>
          <div className="flex gap-6">
            <Link to="/termeni">Termeni</Link>
            <Link to="/confidentialitate">Confidențialitate</Link>
            <Link to="/gdpr">GDPR</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
