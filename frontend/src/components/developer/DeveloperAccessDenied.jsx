import { Lock } from 'lucide-react';
import AppShell from '../AppShell';

export default function DeveloperAccessDenied() {
  return (
    <AppShell title="AI Developer">
      <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 p-8 text-center" data-testid="dev-access-denied">
        <Lock className="w-10 h-10 text-[#DC2626] mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acces restricționat</h2>
        <p className="text-sm text-gray-700">
          Această secțiune este accesibilă doar contului Developer (<code className="mono bg-white px-1.5 py-0.5">dragosserban95@gmail.com</code>).
        </p>
      </div>
    </AppShell>
  );
}
