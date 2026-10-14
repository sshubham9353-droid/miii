import type { LucideIcon } from 'lucide-react';

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'sky',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'sky' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
}) {
  const accentMap = {
    sky: 'from-sky-500/20 to-sky-500/5 text-sky-300',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-300',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-300',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-300',
    slate: 'from-slate-500/20 to-slate-500/5 text-slate-300',
  };
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md transition hover:border-white/20 hover:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-400">{label}</span>
          <span className="mt-1 text-lg font-semibold text-white">{value}</span>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${accentMap[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
