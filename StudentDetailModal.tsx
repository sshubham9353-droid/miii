import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { useLibrary } from '@/context/LibraryContext';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { Student } from '@/types';
import { User, Phone, Calendar, DollarSign, Armchair, ClipboardList, Hash } from 'lucide-react';

export default function StudentDetailModal({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  const { payments } = useLibrary();
  if (!student) return null;

  const studentPayments = payments.filter((p) => p.studentId === student.id);
  const pending = Math.max(student.monthlyFee - student.paidAmount, 0);

  const rows = [
    { icon: User, label: 'Name', value: student.name },
    { icon: Hash, label: 'Student ID', value: student.studentId },
    { icon: Hash, label: 'Roll Number', value: student.rollNumber },
    { icon: Phone, label: 'Phone', value: student.phone },
    { icon: Phone, label: 'Alternate Phone', value: student.altPhone || '—' },
    { icon: Armchair, label: 'Seat Number', value: student.seatNumber?.toString() || 'Unassigned' },
    { icon: DollarSign, label: 'Monthly Fee', value: formatCurrency(student.monthlyFee) },
    { icon: DollarSign, label: 'Amount Paid', value: formatCurrency(student.paidAmount) },
    { icon: DollarSign, label: 'Pending Balance', value: formatCurrency(pending) },
    { icon: Calendar, label: 'Registration Date', value: formatDate(student.registrationDate) },
    { icon: Calendar, label: 'Joining Date', value: formatDate(student.joiningDate) },
    { icon: Calendar, label: 'Fee Due Date', value: formatDate(student.feeDueDate) },
  ];

  return (
    <Modal open={!!student} onClose={onClose} title="Student Details">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">{student.name}</p>
              <p className="text-xs text-slate-400">{student.studentId} · {student.rollNumber}</p>
            </div>
          </div>
          <StatusBadge status={student.status} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5"
              >
                <Icon className="h-4 w-4 text-slate-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">{row.label}</span>
                  <span className="text-sm text-slate-200">{row.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {student.notes && (
          <div className="rounded-lg border border-white/5 bg-white/5 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
              <ClipboardList className="h-3.5 w-3.5" />
              Notes
            </div>
            <p className="text-sm text-slate-300">{student.notes}</p>
          </div>
        )}

        {studentPayments.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-300">Payment History ({studentPayments.length})</h4>
            <div className="space-y-2">
              {studentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="text-slate-300">{formatDate(p.paymentDate)}</span>
                    <span className="ml-2 text-xs text-slate-500">{p.method}</span>
                  </div>
                  <span className="font-medium text-emerald-300">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500">
          Version 1 — Frontend Preview. Data shown is demonstration data for the current session.
        </p>
      </div>
    </Modal>
  );
}
