import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Clock } from 'lucide-react';

function formatRemaining(ms) {
  if (ms <= 0) return 'Expirat';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}z ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function LicenseTimer() {
  const { user } = useAuth();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!user) return null;

  const isDev = user.is_developer;
  const renews = user.plan_renews_at ? new Date(user.plan_renews_at).getTime() : null;
  const ms = renews ? renews - now : null;

  if (isDev) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black text-[#FFB300] text-[10px] uppercase tracking-[0.15em] font-bold" data-testid="license-timer">
        <Clock className="w-3 h-3" /> Developer · Lifetime
      </div>
    );
  }

  if (!renews) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] uppercase tracking-[0.15em]" data-testid="license-timer">
        <Clock className="w-3 h-3" /> Plan {user.plan}
      </div>
    );
  }

  const expired = ms <= 0;
  const urgent = ms < 3 * 86400 * 1000;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-semibold ${
      expired ? 'bg-[#DC2626] text-white' : urgent ? 'bg-[#FFB300] text-black' : 'bg-[#16A34A]/10 text-[#16A34A]'
    }`} data-testid="license-timer">
      <Clock className="w-3 h-3" />
      {expired ? 'Licență expirată' : `${user.plan} · ${formatRemaining(ms)}`}
    </div>
  );
}
