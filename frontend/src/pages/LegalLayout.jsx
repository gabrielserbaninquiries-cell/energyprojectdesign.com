import { Link } from 'react-router-dom';
import { Flame, ArrowLeft } from 'lucide-react';

export default function LegalLayout({ title, eyebrow, children }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center"><Flame className="w-4 h-4" strokeWidth={2.5} /></div>
            <div className="font-bold tracking-tight">StampDoc<span className="text-[#FFB300]">.ro</span></div>
          </Link>
          <Link to="/" className="ghost-btn text-sm"><ArrowLeft className="w-4 h-4" /> Înapoi</Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-6 lg:px-12 py-16 page-enter">
        <div className="label mb-3">{eyebrow}</div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4">{title}</h1>
        <div className="text-sm text-gray-500 mb-12">Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</div>

        <div className="prose-legal space-y-8 text-[15px] leading-relaxed text-gray-800">
          {children}
        </div>
      </article>

      <footer className="border-t border-gray-200 py-10 mt-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>© {new Date().getFullYear()} StampDoc România.</div>
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
