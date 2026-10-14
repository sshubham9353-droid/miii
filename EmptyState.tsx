import type { LucideIcon } from 'lucide-react';
import { SearchX } from 'lucide-react';

export default function EmptyState({
  title,
  message,
  icon: Icon = SearchX,
  action,
}: {
  title: string;
  message: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/30 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-7 w-7 text-slate-500" />
      </div>
      <h3 className="mt-4 text-base font-medium text-slate-300">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
