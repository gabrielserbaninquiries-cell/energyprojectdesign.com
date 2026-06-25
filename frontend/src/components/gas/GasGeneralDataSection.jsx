/**
 * Date Generale — operator OSD, VGD, RTE, proiectant, executant, beneficiar
 */
import { useState, useMemo } from 'react';
import { OSD_LIST, TIPURI_LUCRARE, LEGITIMATIE_PROIECTANT_TIPURI, LEGITIMATIE_EXECUTANT_TIPURI } from '../../lib/gasCalcs';
import { Search, Plus, X, Calendar, MapPin, User, Building2 } from 'lucide-react';
import DevPlaceholderTag from './DevPlaceholderTag';

function Field({ label, k, value, onChange, type = 'text', placeholder, required, options, suffix }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <DevPlaceholderTag pkey={k} />
      {options ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(k, e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          data-testid={`field-${k}`}
        >
          <option value="">— alege —</option>
          {options.map((o) => (
            <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
              {typeof o === 'string' ? o : o.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(k, e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            data-testid={`field-${k}`}
          />
          {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
        </div>
      )}
    </div>
  );
}

function SearchSelect({ label, k, value, onChange, options, required, placeholder = 'Caută…' }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const lq = q.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(lq));
  }, [q, options]);
  return (
    <div className="space-y-1 relative">
      <label className="block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <DevPlaceholderTag pkey={k} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-left bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 flex items-center justify-between gap-2"
        data-testid={`field-${k}`}
      >
        <span className={value ? '' : 'text-slate-400'}>{value || '— alege —'}</span>
        <Search className="w-3.5 h-3.5 text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-80 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
              data-testid={`search-${k}`}
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && <div className="p-3 text-xs text-slate-400">Niciun rezultat</div>}
            {filtered.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => { onChange(k, o); setOpen(false); setQ(''); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50 hover:text-violet-700"
                data-testid={`opt-${k}-${o.replace(/\W/g, '_').slice(0, 30)}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-slate-50">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-violet-600" />}
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function GasGeneralDataSection({ data, onChange }) {
  const update = (k, v) => onChange({ [k]: v });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Date generale</h2>
        <p className="text-sm text-slate-500">Aceste câmpuri se propagă în TOATE documentele tipizate.</p>
      </div>

      <Card title="Tipul lucrării" icon={Search}>
        <Field
          label="Tip lucrare"
          k="tip_lucrare"
          value={data.tip_lucrare}
          onChange={update}
          options={TIPURI_LUCRARE}
          required
        />
        <div className="mt-3">
          <Field label="Număr de proiect" k="nr_proiect" value={data.nr_proiect} onChange={update} placeholder="Ex: BR-2026-001" />
        </div>
      </Card>

      <Card title="Operator Sistem Distribuție (OSD)" icon={Building2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchSelect label="OSD" k="osd_nume" value={data.osd_nume} onChange={update} options={OSD_LIST} required />
          <Field label="Denumire OSD (pseudonim public)" k="osd_denumire_public" value={data.osd_denumire_public} onChange={update} placeholder="Ex: Engie Romania S.A." />
          <div className="md:col-span-2">
            <Field label="Sediu social OSD" k="osd_sediu_social" value={data.osd_sediu_social} onChange={update} placeholder="Strada, nr., oraș, județ" />
          </div>
        </div>
      </Card>

      <Card title="Verificator atestat VGD" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Field label="Nume și prenume" k="vgd_nume" value={data.vgd_nume} onChange={update} />
          </div>
          <Field label="Tip" k="vgd_legitimatie_tip" value={data.vgd_legitimatie_tip || 'VGD'} onChange={update} options={['VGD']} />
          <Field label="Nr. legitimație" k="vgd_legitimatie_nr" value={data.vgd_legitimatie_nr} onChange={update} />
          <Field label="Data expirare" k="vgd_legitimatie_exp" value={data.vgd_legitimatie_exp} onChange={update} type="date" />
        </div>
      </Card>

      <Card title="Verificator atestat RTE" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Field label="Nume și prenume" k="rte_nume" value={data.rte_nume} onChange={update} />
          </div>
          <Field label="Tip" k="rte_legitimatie_tip" value={data.rte_legitimatie_tip || 'RTE'} onChange={update} options={['RTE']} />
          <Field label="Nr. legitimație" k="rte_legitimatie_nr" value={data.rte_legitimatie_nr} onChange={update} />
          <Field label="Data expirare" k="rte_legitimatie_exp" value={data.rte_legitimatie_exp} onChange={update} type="date" />
        </div>
      </Card>

      <Card title="Societate proiectantă" icon={Building2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nume societate" k="proiectant_societate" value={data.proiectant_societate} onChange={update} required />
          <Field label="CUI" k="proiectant_cui" value={data.proiectant_cui} onChange={update} />
          <Field label="Sediu social" k="proiectant_sediu" value={data.proiectant_sediu} onChange={update} />
          <Field label="Telefon" k="proiectant_telefon" value={data.proiectant_telefon} onChange={update} />
          <Field label="Fax" k="proiectant_fax" value={data.proiectant_fax} onChange={update} />
          <Field label="Email" k="proiectant_email" value={data.proiectant_email} onChange={update} type="email" />
          <Field label="Administrator — nume" k="proiectant_admin_nume" value={data.proiectant_admin_nume} onChange={update} />
          <Field label="Administrator — CNP" k="proiectant_admin_cnp" value={data.proiectant_admin_cnp} onChange={update} />
          <Field label="Reprezentant legal — nume" k="proiectant_reprez_nume" value={data.proiectant_reprez_nume} onChange={update} />
          <Field label="Reprezentant legal — CNP" k="proiectant_reprez_cnp" value={data.proiectant_reprez_cnp} onChange={update} />
          <Field label="Reprezentant legal — telefon" k="proiectant_reprez_telefon" value={data.proiectant_reprez_telefon} onChange={update} />
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-2">Inginer proiectant atestat</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Field label="Nume" k="proiectant_inginer_nume" value={data.proiectant_inginer_nume} onChange={update} />
            </div>
            <Field label="Tip legitimație" k="proiectant_inginer_legit_tip" value={data.proiectant_inginer_legit_tip} onChange={update} options={LEGITIMATIE_PROIECTANT_TIPURI} />
            <Field label="Nr. legitimație" k="proiectant_inginer_legit_nr" value={data.proiectant_inginer_legit_nr} onChange={update} />
            <Field label="Data expirare" k="proiectant_inginer_legit_exp" value={data.proiectant_inginer_legit_exp} onChange={update} type="date" />
          </div>
        </div>
      </Card>

      <Card title="Societate executantă" icon={Building2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nume societate" k="executant_societate" value={data.executant_societate} onChange={update} />
          <Field label="CUI" k="executant_cui" value={data.executant_cui} onChange={update} />
          <Field label="Telefon" k="executant_telefon" value={data.executant_telefon} onChange={update} />
          <Field label="Fax" k="executant_fax" value={data.executant_fax} onChange={update} />
          <Field label="Email" k="executant_email" value={data.executant_email} onChange={update} type="email" />
          <Field label="Reprezentant legal — nume" k="executant_reprez_nume" value={data.executant_reprez_nume} onChange={update} />
          <Field label="Reprezentant legal — CNP" k="executant_reprez_cnp" value={data.executant_reprez_cnp} onChange={update} />
          <Field label="Reprezentant legal — telefon" k="executant_reprez_telefon" value={data.executant_reprez_telefon} onChange={update} />
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-2">Inginer executant atestat</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Field label="Nume" k="executant_inginer_nume" value={data.executant_inginer_nume} onChange={update} />
            </div>
            <Field label="Tip legitimație" k="executant_inginer_legit_tip" value={data.executant_inginer_legit_tip} onChange={update} options={LEGITIMATIE_EXECUTANT_TIPURI} />
            <Field label="Nr. legitimație" k="executant_inginer_legit_nr" value={data.executant_inginer_legit_nr} onChange={update} />
            <Field label="Data expirare" k="executant_inginer_legit_exp" value={data.executant_inginer_legit_exp} onChange={update} type="date" />
          </div>
        </div>
      </Card>

      <Card title="Beneficiar" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nume / Denumire" k="beneficiar_nume" value={data.beneficiar_nume} onChange={update} required />
          <Field label="CNP / CUI" k="beneficiar_cnp_cui" value={data.beneficiar_cnp_cui} onChange={update} required />
          <Field label="Telefon" k="beneficiar_telefon" value={data.beneficiar_telefon} onChange={update} />
          <Field label="Email" k="beneficiar_email" value={data.beneficiar_email} onChange={update} type="email" />
        </div>
      </Card>

      <Card title="Amplasament & cadastral" icon={MapPin}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Field label="Amplasament lucrări (strada pe care se execută)" k="amplasament_lucrari" value={data.amplasament_lucrari} onChange={update} required />
          </div>
          <div className="md:col-span-2">
            <Field label="Amplasament imobil (adresa lucrare)" k="amplasament_imobil" value={data.amplasament_imobil} onChange={update} required />
          </div>
          <Field label="Număr cadastral imobil" k="nr_cadastral_imobil" value={data.nr_cadastral_imobil} onChange={update} placeholder="opțional" />
          <Field label="Număr cadastral traseu" k="nr_cadastral_traseu" value={data.nr_cadastral_traseu} onChange={update} placeholder="opțional" />
          <Field label="Regim juridic execuție" k="regim_juridic" value={data.regim_juridic} onChange={update} options={['public', 'privat', 'public+privat']} />
          {data.regim_juridic === 'public+privat' && (
            <>
              <Field label="Lungime în domeniul public (m)" k="regim_public_m" value={data.regim_public_m} onChange={update} type="number" suffix="m" />
              <Field label="Lungime în domeniul privat (m)" k="regim_privat_m" value={data.regim_privat_m} onChange={update} type="number" suffix="m" />
            </>
          )}
        </div>
      </Card>

      <Card title="Ordin lucru & ATR" icon={Calendar}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Ordin de lucru — număr" k="ordin_lucru_nr" value={data.ordin_lucru_nr} onChange={update} />
          <Field label="Ordin de lucru — dată" k="ordin_lucru_data" value={data.ordin_lucru_data} onChange={update} type="date" />
          <Field label="ATR / Acord acces — număr" k="atr_nr" value={data.atr_nr} onChange={update} />
          <Field label="ATR — dată" k="atr_data" value={data.atr_data} onChange={update} type="date" />
          <Field label="Debit aprobat lucrare" k="debit_aprobat_nmc" value={data.debit_aprobat_nmc} onChange={update} type="number" suffix="Nmc/h" />
        </div>
      </Card>

      <Card title="Date contractuale & financiare" icon={Building2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Perioada începere lucrări" k="perioada_incepere" value={data.perioada_incepere} onChange={update} type="date" />
          <Field label="Durata execuție lucrări (zile)" k="durata_executie_zile" value={data.durata_executie_zile} onChange={update} type="number" suffix="zile" />
          <Field label="Valoare lucrări (RON + TVA)" k="valoare_lucrari_ron" value={data.valoare_lucrari_ron} onChange={update} type="number" suffix="RON" />
          <Field label="Diriginte de șantier — nume" k="diriginte_santier_nume" value={data.diriginte_santier_nume} onChange={update} />
          <Field label="Sudor autorizat — nume" k="sudor_nume" value={data.sudor_nume} onChange={update} />
          <Field label="Nr. autorizație sudor" k="sudor_autorizatie_nr" value={data.sudor_autorizatie_nr} onChange={update} />
          <Field label="Expirare autorizație sudor" k="sudor_autorizatie_exp" value={data.sudor_autorizatie_exp} onChange={update} type="date" />
        </div>
      </Card>
    </div>
  );
}
