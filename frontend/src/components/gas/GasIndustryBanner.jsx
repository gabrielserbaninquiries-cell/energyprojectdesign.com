/**
 * GasIndustryBanner — banner reprezentativ industriei gaze naturale.
 * V12.5 — real photo overlay + heading; folosit ca antet vizual pentru fiecare subsecțiune.
 */
import { Flame } from 'lucide-react';

const GAS_BANNER_IMG = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600&q=80&auto=format&fit=crop';
// Gas pipeline & industrial installation (source: Unsplash, license: free commercial use)

export default function GasIndustryBanner({ subtitle, subsectionLabel }) {
  return (
    <section
      data-testid="gas-industry-banner"
      className="relative mb-6 overflow-hidden border border-slate-200 rounded-lg"
      style={{ height: '260px' }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.72) 0%, rgba(76,29,149,0.58) 50%, rgba(30,64,175,0.62) 100%), url(${GAS_BANNER_IMG})`,
        }}
      />
      <div className="relative h-full flex flex-col justify-end p-6 lg:p-8 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-amber-300" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-amber-300">Industrie Gaze Naturale</span>
        </div>
        <h1 className="text-2xl lg:text-4xl font-bold tracking-tighter text-white leading-tight">
          {subsectionLabel || 'Studio Gaze Naturale'}
        </h1>
        {subtitle && <p className="text-sm lg:text-base text-slate-200 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  );
}
