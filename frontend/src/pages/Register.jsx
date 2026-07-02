import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import api, { setAuthToken } from '../lib/api';
import { toast } from 'sonner';
import { Check, AlertCircle } from 'lucide-react';
import { BRAND, BRAND_ASSETS } from '../lib/brand';

export default function Register() {
  const { register, setUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '' });
  const [gdpr, setGdpr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showGdprError, setShowGdprError] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!gdpr) {
      setShowGdprError(true);
      toast.error('Bifați acordul GDPR pentru a crea cont.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Parola trebuie să aibă minim 6 caractere.');
      return;
    }
    setBusy(true);
    try {
      await register({ ...form, gdpr_consent: true });
      toast.success('Cont creat cu succes. Bun venit la EPD!');
      nav('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Eroare la creare cont';
      toast.error(msg);
    } finally { setBusy(false); }
  };

  // V12.4 — Native Google Sign-Up (own Google Cloud OAuth, "Energy Project Design" branded)
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const onGoogleCredential = async (response) => {
    try {
      const { data } = await api.post('/auth/google', { credential: response.credential });
      if (data.token) setAuthToken(data.token);
      setUser(data.user);
      toast.success(`Cont creat via Google. Bun venit, ${data.user?.name || data.user?.email}!`);
      nav('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Înregistrare Google eșuată');
    }
  };

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Stânga — Brand panel cu logo real */}
      <div
        className="hidden md:flex flex-col justify-between text-white p-12 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(76,29,149,0.85) 50%, rgba(30,58,138,0.9) 100%), url(${BRAND_ASSETS.cover1Futurist})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Link to="/" className="flex items-center gap-3" data-testid="register-brand-link">
          <img
            src={BRAND_ASSETS.logoMark}
            alt="Energy Project Design"
            className="w-10 h-10 rounded-lg shadow-lg epd-logo-mark-crop overflow-hidden"
            data-testid="register-brand-logo"
          />
          <div className="font-bold tracking-tight text-lg">Energy Project Design</div>
        </Link>

        <div className="relative">
          <div className="text-xs uppercase tracking-[0.25em] text-violet-300 mb-4 font-semibold">
            // {BRAND.subTagline}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter leading-[1.05]">Începeți în 60 de secunde.</h2>
          <ul className="text-sm text-slate-300 mt-6 space-y-2.5">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 33 documente DOCX legale (NTPEE 2018)</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 221 câmpuri tehnice + calc Renouard</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Acces gratuit nelimitat (fără export)</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Fără card · anulați oricând</li>
          </ul>
        </div>
      </div>

      {/* Dreapta — formular */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8">
            <Link to="/" className="flex items-center gap-3" data-testid="register-brand-link-mobile">
              <img
                src={BRAND_ASSETS.logoMark}
                alt="Energy Project Design"
                className="w-9 h-9 rounded-lg shadow-md epd-logo-mark-crop overflow-hidden"
              />
              <div className="font-bold tracking-tight text-slate-900">Energy Project Design</div>
            </Link>
          </div>

          <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-2">// Energy Project Design</div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2 text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mb-7">Acces gratuit nelimitat (vizualizare + introducere date). Export documente — disponibil la upgrade.</p>

          {/* V12.4 — Native Google Sign-Up */}
          <div className="mb-4" data-testid="google-signup-wrapper">
            <GoogleLogin
              onSuccess={onGoogleCredential}
              onError={() => toast.error('Înregistrare Google eșuată')}
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
              width="100%"
            />
          </div>
          <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span className="flex-1 h-px bg-slate-200"/> sau cu email <span className="flex-1 h-px bg-slate-200"/>
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            <div>
              <label className="label block mb-1.5">Nume complet</label>
              <input required data-testid="name-input" value={form.name} onChange={setF('name')}
                className="w-full border border-slate-300 bg-white px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors"
                placeholder="Ion Popescu" />
            </div>
            <div>
              <label className="label block mb-1.5">Firmă (opțional)</label>
              <input data-testid="company-input" value={form.company} onChange={setF('company')}
                className="w-full border border-slate-300 bg-white px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors"
                placeholder="SC Instalații Gaze SRL" />
            </div>
            <div>
              <label className="label block mb-1.5">Email</label>
              <input required type="email" data-testid="email-input" value={form.email} onChange={setF('email')}
                className="w-full border border-slate-300 bg-white px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors"
                placeholder="ion@firma.ro" />
            </div>
            <div>
              <label className="label block mb-1.5">Parolă (min 6 caractere)</label>
              <input required type="password" data-testid="password-input" value={form.password} onChange={setF('password')}
                className="w-full border border-slate-300 bg-white px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors"
                placeholder="••••••••" minLength={6} />
            </div>

            {/* GDPR — V9.4: prominent, clear, accent culoare brand */}
            <div className={`mt-1 p-3 rounded-lg border transition-all ${showGdprError && !gdpr ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gdpr}
                  onChange={(e) => { setGdpr(e.target.checked); if (e.target.checked) setShowGdprError(false); }}
                  className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer shrink-0"
                  data-testid="gdpr-consent"
                  required
                />
                <span className="leading-relaxed">
                  Am citit și sunt de acord cu <Link to="/termeni" target="_blank" className="text-violet-700 underline font-semibold">Termenii</Link>, <Link to="/confidentialitate" target="_blank" className="text-violet-700 underline font-semibold">Politica de Confidențialitate</Link> și <Link to="/gdpr" target="_blank" className="text-violet-700 underline font-semibold">prelucrarea datelor GDPR</Link>.
                </span>
              </label>
              {showGdprError && !gdpr && (
                <div className="mt-2 flex items-center gap-2 text-xs text-rose-700 font-semibold" data-testid="gdpr-error">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Bifați acordul pentru a continua.
                </div>
              )}
            </div>

            <button data-testid="register-submit" disabled={busy} className="epd-btn w-full disabled:opacity-50">
              {busy ? 'Se creează contul...' : 'Creează cont gratuit'}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500 text-center">
            Aveți deja cont? <Link to="/login" className="text-violet-700 font-semibold hover:text-violet-900" data-testid="link-login">Autentificare</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
