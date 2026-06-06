import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { ArrowRight, Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const COLOR_STYLES = {
  gray:  'bg-gray-100 text-gray-700 border-gray-300',
  amber: 'bg-amber-100 text-amber-800 border-amber-300',
  blue:  'bg-blue-100 text-blue-800 border-blue-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  red:   'bg-red-100 text-red-800 border-red-300',
};

const SEVERITY_STYLES = {
  high:   { bg: 'bg-red-50 border-red-300',     icon: AlertTriangle,  iconCls: 'text-red-700' },
  medium: { bg: 'bg-amber-50 border-amber-300', icon: Target,         iconCls: 'text-amber-700' },
  low:    { bg: 'bg-green-50 border-green-300', icon: CheckCircle2,   iconCls: 'text-green-700' },
};

const SECTION_LABELS = {
  project_data: 'Date proiect',
  technical_data: 'Date tehnice',
  calc: 'Calcul',
  templates: 'Șabloane',
  documents: 'Documente',
  stamps: 'Ștampile',
  certifications: 'Certificări',
};

export default function LifecycleWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/lifecycle/current');
        setData(data);
      } catch (e) {
        console.error('Lifecycle load failed:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;
  if (!data) return null;

  const sev = SEVERITY_STYLES[data.next_best_action.severity] || SEVERITY_STYLES.medium;
  const SevIcon = sev.icon;
  const statusColor = COLOR_STYLES[data.status_meta.color] || COLOR_STYLES.gray;
  const score = data.score.overall_score;

  return (
    <div className="bg-white border-2 border-black mb-8" data-testid="lifecycle-widget">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-gray-200">
        {/* Status badge */}
        <div className="bg-white p-5 md:col-span-3" data-testid="lifecycle-status">
          <div className="label mb-2 flex items-center gap-1.5"><Target className="w-3 h-3" /> Status proiect</div>
          <div className={`inline-block px-3 py-1.5 border text-sm font-semibold ${statusColor}`}>
            {data.status_meta.label}
          </div>
          <div className="text-xs text-gray-500 mt-2 leading-relaxed">{data.status_meta.description}</div>
          <div className="text-[10px] text-gray-400 mt-2">Etapa {data.status_meta.stage} / 10</div>
        </div>

        {/* Score */}
        <div className="bg-white p-5 md:col-span-3" data-testid="lifecycle-score">
          <div className="label mb-2 flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> Scor completare</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight">{score}</span>
            <span className="text-sm text-gray-500">/100</span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${score >= 85 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
          <div className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider">{
            { excellent: 'Excelent', good: 'Bun', in_progress: 'În progres', starting: 'La început' }[data.score.rating] || data.score.rating
          }</div>
        </div>

        {/* Next best action */}
        <div className={`p-5 md:col-span-6 border-2 ${sev.bg}`} data-testid="lifecycle-nba">
          <div className="label mb-2 flex items-center gap-1.5"><SevIcon className={`w-3 h-3 ${sev.iconCls}`} /> Următorul pas</div>
          <div className="font-bold text-base mb-1">{data.next_best_action.title}</div>
          <div className="text-xs text-gray-600 mb-3">{data.next_best_action.description}</div>
          <Link
            to={data.next_best_action.action_url}
            className="inline-flex items-center gap-2 bg-black text-[#FFB300] px-4 py-2 text-xs font-semibold hover:bg-[#FFB300] hover:text-black border border-black transition-colors"
            data-testid="lifecycle-action-btn"
          >
            {data.next_best_action.action_label} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Breakdown */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Detaliu pe secțiuni (ponderat)</div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-xs">
          {Object.entries(data.score.breakdown).map(([key, val]) => (
            <div key={key} className="bg-gray-50 px-2 py-2 text-center" data-testid={`score-${key}`}>
              <div className="font-bold text-sm">{val}%</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{SECTION_LABELS[key] || key}</div>
              <div className="text-[9px] text-gray-400">peso {(data.score.weights[key] * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
