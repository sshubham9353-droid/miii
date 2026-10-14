import type { LucideIcon } from 'lucide-react';

type BadgeVariant =
  | 'Active'
  | 'Inactive'
  | 'Left'
  | 'Available'
  | 'Occupied'
  | 'Reserved'
  | 'Maintenance'
  | 'Paid'
  | 'Partially Paid'
  | 'Pending'
  | 'Overdue';

const styles: Record<BadgeVariant, string> = {
  Active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Inactive: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Left: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Available: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Occupied: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  Reserved: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Maintenance: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Paid: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Partially Paid': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Pending: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  Overdue: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const icons: Partial<Record<BadgeVariant, LucideIcon>> = {};
// icons are optional; status text is primary

export default function StatusBadge({
  status,
  icon: Icon,
}: {
  status: BadgeVariant;
  icon?: LucideIcon;
}) {
  const style = styles[status] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  return (
    <span
      className={`status-badge inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {status}
    </span>
  );
}
