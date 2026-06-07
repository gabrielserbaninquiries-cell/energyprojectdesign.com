import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flame, ShieldCheck, ShieldAlert, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../lib/api';

export default function VerifyGasProject() {
  const { pid } = useParams();
  const [proj, setProj] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const { data } = await api.get(`/gas-project/${pid}/public`);
      setProj(data);
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Proiect inexistent sau șters');
    } finally { setLoading(false); }
  })(); }, [pid]);

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" data-testid="verify-brand">
            <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center"><Flame className="w-4 h-4" strokeWidth={2.5} /></div>
            <div className="font-bold tracking-tight">Energy Project<span className="text-[#FFB300]"> Design</span></div>
          </Link>
          <Link to="/" className="text-xs text-gray-500 hover:text-black uppercase tracking-wider">Acasă →</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="label mb-3">// verificare publică proiect</div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter mb-2">Verificare proiect tehnic</h1>
        <p className="text-sm text-gray-600 mb-8">
          Această pagină certifică autenticitatea unui proiect tehnic înregistrat în platforma Energy Project Design.
          Hash-ul SHA-256 al proiectului este imuabil din momentul semnării digitale.
        </p>

        {loading && <div className="text-sm text-gray-500">Se verifică...</div>}

        {err && (
          <div className="border-2 border-red-200 bg-red-50 p-6" data-testid="verify-error">
            <ShieldAlert className="w-10 h-10 text-red-500 mb-3" />
            <div className="font-semibold text-red-800 mb-1">Verificare eșuată</div>
            <div className="text-sm text-red-700">{err}</div>
            <div className="mt-3 mono text-xs text-gray-600">PID solicitat: {pid}</div>
          </div>
        )}

        {proj && (
          <div className="bg-white border-2 border-gray-900" data-testid="verify-card">
            <div className={`p-5 border-b border-gray-900 flex items-center gap-4 ${proj.status === 'signed' ? 'bg-green-50' : 'bg-amber-50'}`}>
              {proj.status === 'signed' ? (
                <>
                  <ShieldCheck className="w-10 h-10 text-green-700 shrink-0" strokeWidth={2} />
                  <div>
                    <div className="font-semibold text-green-900" data-testid="verify-status-signed">PROIECT SEMNAT DIGITAL</div>
                    <div className="text-xs text-green-700">Integritate criptografică verificată · SHA-256</div>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-10 h-10 text-amber-700 shrink-0" strokeWidth={2} />
                  <div>
                    <div className="font-semibold text-amber-900" data-testid="verify-status-draft">PROIECT ÎN LUCRU — neSEMNAT încă</div>
                    <div className="text-xs text-amber-700">Status: {proj.status || 'draft'}</div>
                  </div>
                </>
              )}
            </div>
            <div className="p-5 space-y-3">
              <Row label="Identificator proiect" value={<span className="mono">{proj.pid}</span>} />
              <Row label="Titlu" value={<span className="font-semibold" data-testid="verify-title">{proj.title || '—'}</span>} />
              <Row label="Beneficiar" value={proj.beneficiar || '—'} testid="verify-beneficiar" />
              <Row label="Loc de consum" value={proj.loc_consum || '—'} />
              <Row label="Faza curentă" value={<span className="mono text-xs bg-gray-100 px-2 py-1">{proj.phase}</span>} />
              {proj.signed_at && (
                <Row label="Semnat la" value={<span className="mono text-xs">{new Date(proj.signed_at).toLocaleString('ro-RO')}</span>} />
              )}
              {proj.signature_hash && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="label mb-1">// hash semnătură digitală (SHA-256)</div>
                  <div className="mono text-[10px] break-all bg-gray-50 border-l-2 border-green-500 p-2" data-testid="verify-signature-hash">
                    {proj.signature_hash}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 p-4 bg-gray-50 text-[11px] text-gray-600">
              Acest document a fost emis prin platforma Energy Project Design (ENERGY PROJECT DESIGN SRL, CUI 43151074).
              Pentru verificarea originii sau detalii tehnice complete, contactați: <a className="underline" href="mailto:contact@energyprojectdesign.com">contact@energyprojectdesign.com</a>.
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500 text-center">
          <Link to="/" className="hover:text-black underline inline-flex items-center gap-1">
            Despre platforma Energy Project Design <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value, testid }) {
  return (
    <div className="flex items-baseline gap-4 text-sm">
      <div className="text-xs uppercase tracking-wider text-gray-500 w-44 shrink-0">{label}</div>
      <div className="text-gray-900 flex-1" data-testid={testid}>{value}</div>
    </div>
  );
}
