import type { LucideIcon } from 'lucide-react';

export default function DashboardCard({
  title,
  description,
  icon: Icon,
  buttonLabel,
  onClick,
  accent = 'sky',
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  buttonLabel: string;
  onClick: () => void;
  accent?: 'sky' | 'cyan' | 'emerald';
}) {
  const accentMap = {
    sky: 'from-sky-500 to-blue-600 shadow-sky-500/25',
    cyan: 'from-cyan-500 to-teal-600 shadow-cyan-500/25',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
  };
  return (
    <div className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-slate-900/60 hover:shadow-2xl">
      <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${accentMap[accent]} shadow-lg`}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{description}</p>
      <button
        onClick={onClick}
        className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-sky-400/20 bg-sky-500/10 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:bg-sky-500/20 hover:text-sky-200"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
