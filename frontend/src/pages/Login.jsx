import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { BRAND, BRAND_ASSETS } from '../lib/brand';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success('Autentificat cu succes');
      nav('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Eroare autentificare');
    } finally { setBusy(false); }
  };

  const onGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Stânga — Brand panel */}
      <div
        className="hidden md:flex flex-col justify-between text-white p-12 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(76,29,149,0.85) 50%, rgba(30,58,138,0.9) 100%), url(${BRAND_ASSETS.cover1Futurist})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Link to="/" className="flex items-center gap-3" data-testid="login-brand-link">
          <img
            src={BRAND_ASSETS.logoMark}
            alt="Energy Project Design"
            className="w-10 h-10 rounded-lg shadow-lg epd-logo-mark-crop overflow-hidden"
            data-testid="login-brand-logo"
          />
          <div className="font-bold tracking-tight text-lg" data-testid="login-brand-name">
            Energy Project Design
          </div>
        </Link>

        <div className="relative">
          <div className="text-xs uppercase tracking-[0.25em] text-violet-300 mb-4 font-semibold">
            // {BRAND.subTagline}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.05]" data-testid="login-brand-tagline">
            {BRAND.tagline}
          </h2>
          <p className="text-slate-300 mt-5 text-sm max-w-sm leading-relaxed">
            Documentație tehnică digitală certificată, marketplace, imobiliare și ecosistem global —
            într-o singură platformă pentru ingineri, proiectanți și firme de instalații.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm">
            {[
              { v: '33',  l: 'Docs legale' },
              { v: '221', l: 'Câmpuri' },
              { v: '13',  l: 'Industrii' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-2xl font-bold tabular-nums">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-violet-300 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dreapta — Formular */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8">
            <Link to="/" className="flex items-center gap-3" data-testid="login-brand-link-mobile">
              <img
                src={BRAND_ASSETS.logoMark}
                alt="Energy Project Design"
                className="w-9 h-9 rounded-lg shadow-md epd-logo-mark-crop overflow-hidden"
              />
              <div className="font-bold tracking-tight text-slate-900">Energy Project Design</div>
            </Link>
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-2">// Autentificare EPD</div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2 text-slate-900">Bine ați revenit.</h1>
          <p className="text-sm text-slate-500 mb-8">Folosiți email-ul și parola contului EPD.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label block mb-2">Email</label>
              <input data-testid="email-input" required type="email" value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 rounded-lg transition-colors"
                placeholder="nume@firma.ro" />
            </div>
            <div>
              <label className="label block mb-2">Parolă</label>
              <input data-testid="password-input" required type="password" value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 rounded-lg transition-colors"
                placeholder="••••••••" />
            </div>
            <button data-testid="login-submit" disabled={busy} type="submit" className="epd-btn w-full disabled:opacity-50">
              {busy ? 'Se conectează...' : 'Autentificare EPD'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span className="flex-1 h-px bg-slate-200"/> sau alternativ <span className="flex-1 h-px bg-slate-200"/>
          </div>

          <button onClick={onGoogle} data-testid="google-login-btn" className="w-full outline-btn py-3 text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuă cu Google (cont nou)
          </button>

          <div className="mt-6 text-sm text-slate-500">
            Nu aveți cont? <Link to="/register" className="text-violet-700 font-semibold hover:text-violet-900" data-testid="link-register">Înregistrare</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
