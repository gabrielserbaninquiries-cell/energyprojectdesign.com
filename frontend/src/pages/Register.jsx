import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Flame } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '' });
  const [gdpr, setGdpr] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!gdpr) { toast.error('Trebuie să acceptați Politica de Confidențialitate și GDPR'); return; }
    setBusy(true);
    try {
      await register({ ...form, gdpr_consent: true });
      toast.success('Cont creat cu succes');
      nav('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Eroare înregistrare');
    } finally { setBusy(false); }
  };

  const onGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block bg-black text-white p-12 relative">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#FFB300] text-black flex items-center justify-center"><Flame className="w-4 h-4" strokeWidth={2.5} /></div>
          <div className="font-bold tracking-tight">StampDoc<span className="text-[#FFB300]">.ro</span></div>
        </Link>
        <div className="absolute bottom-12 left-12 right-12">
          <div className="label text-[#FFB300] mb-3">// 5 documente gratuit</div>
          <h2 className="text-3xl font-bold tracking-tighter leading-tight">Începeți în mai puțin de 60 de secunde.</h2>
          <ul className="text-sm text-gray-400 mt-6 space-y-2">
            <li>— Șabloane DOCX nelimitate</li>
            <li>— Ștampile cu poziționare exactă</li>
            <li>— Semnătură digitală PKI (.p12)</li>
            <li>— Trimitere automată pe email</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center"><Flame className="w-4 h-4" strokeWidth={2.5} /></div>
              <div className="font-bold tracking-tight">StampDoc.ro</div>
            </Link>
          </div>
          <div className="label mb-2">// Cont nou</div>
          <h1 className="text-3xl font-bold tracking-tighter mb-8">Creați-vă contul.</h1>

          <button onClick={onGoogle} data-testid="google-register-btn" className="w-full outline-btn mb-3 py-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuă cu Google
          </button>
          <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-[0.2em] text-gray-400">
            <span className="flex-1 h-px bg-gray-200"/> sau <span className="flex-1 h-px bg-gray-200"/>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label block mb-2">Nume complet</label>
              <input required data-testid="name-input" value={form.name} onChange={setF('name')} className="w-full border border-gray-300 bg-white px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30" placeholder="Ion Popescu" />
            </div>
            <div>
              <label className="label block mb-2">Firmă</label>
              <input data-testid="company-input" value={form.company} onChange={setF('company')} className="w-full border border-gray-300 bg-white px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30" placeholder="SC Instalații Gaze SRL" />
            </div>
            <div>
              <label className="label block mb-2">Email</label>
              <input required type="email" data-testid="email-input" value={form.email} onChange={setF('email')} className="w-full border border-gray-300 bg-white px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30" placeholder="ion@firma.ro" />
            </div>
            <div>
              <label className="label block mb-2">Parolă (min 6 caractere)</label>
              <input required type="password" data-testid="password-input" value={form.password} onChange={setF('password')} className="w-full border border-gray-300 bg-white px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30" placeholder="••••••••" />
            </div>
            <button data-testid="register-submit" disabled={busy} className="amber-btn w-full disabled:opacity-50">{busy ? 'Se creează...' : 'Creează cont'}</button>
            <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} className="mt-0.5 accent-[#FFB300]" data-testid="gdpr-consent" />
              <span>Am citit și sunt de acord cu <Link to="/termeni" target="_blank" className="underline font-semibold">Termenii</Link>, <Link to="/confidentialitate" target="_blank" className="underline font-semibold">Politica de Confidențialitate</Link> și <Link to="/gdpr" target="_blank" className="underline font-semibold">prelucrarea datelor conform GDPR</Link>.</span>
            </label>
          </form>

          <div className="mt-6 text-sm text-gray-500">
            Aveți deja cont? <Link to="/login" className="text-black font-semibold hover:text-[#FFA000]">Autentificare</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
