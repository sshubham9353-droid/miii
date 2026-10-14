import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useLibrary } from '@/context/LibraryContext';
import { formatCurrency } from '@/utils/helpers';
import type { Student, PaymentMethod } from '@/types';
import { Save, DollarSign } from 'lucide-react';

export default function PaymentModal({
  student,
  open,
  onClose,
}: {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}) {
  const { recordPayment, showToast } = useLibrary();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student && open) {
      const pending = Math.max(student.monthlyFee - student.paidAmount, 0);
      setAmount(pending > 0 ? pending.toString() : '');
      setDate(new Date().toISOString().split('T')[0]);
      setMethod('Cash');
      setReference('');
      setNotes('');
      setErrors({});
    }
  }, [student, open]);

  if (!student) return null;

  const pending = Math.max(student.monthlyFee - student.paidAmount, 0);

  function validate(): boolean {
    const e: Record<string, string> = {};
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid payment amount';
    else if (amt > pending) e.amount = `Amount exceeds outstanding balance (${formatCurrency(pending)})`;
    if (!date) e.date = 'Payment date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!student) return;
    if (!validate()) {
      showToast('Please fix the highlighted fields', 'error');
      return;
    }
    recordPayment(
      student.id,
      Number(amount),
      date,
      method,
      reference.trim() || undefined,
      notes.trim() || undefined
    );
    showToast(`Payment of ${formatCurrency(Number(amount))} recorded for ${student.name}`, 'success');
    onClose();
  }

  const inputClass = (field: string) =>
    `w-full rounded-lg border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:bg-white/8 ${
      errors[field]
        ? 'border-rose-500/50 focus:border-rose-500/60'
        : 'border-white/10 focus:border-sky-400/40'
    }`;
  const labelClass = 'mb-1.5 block text-sm font-medium text-slate-300';

  return (
    <Modal open={open} onClose={onClose} title={`Record Payment — ${student.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-xs text-slate-500">Monthly Fee</p>
            <p className="text-sm font-medium text-slate-200">{formatCurrency(student.monthlyFee)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Already Paid</p>
            <p className="text-sm font-medium text-emerald-300">{formatCurrency(student.paidAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Outstanding</p>
            <p className="text-sm font-medium text-amber-300">{formatCurrency(pending)}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Payment Amount (₹) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1500"
              min="1"
              max={pending}
              className={inputClass('amount')}
            />
            {errors.amount && <p className="mt-1 text-xs text-rose-400">{errors.amount}</p>}
          </div>
          <div>
            <label className={labelClass}>
              Payment Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass('date')}
            />
            {errors.date && <p className="mt-1 text-xs text-rose-400">{errors.date}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Payment Method *</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className={inputClass('method')}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Reference Number (Optional)</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. UPI-901234"
              className={inputClass('reference')}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any payment-related notes..."
            className={inputClass('notes')}
          />
        </div>

        {/* Balance preview */}
        {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
          <div className="rounded-lg border border-white/10 bg-slate-800/50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Remaining balance after payment:</span>
              <span className="font-medium text-sky-300">
                {formatCurrency(Math.max(pending - Number(amount), 0))}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-600"
          >
            <Save className="h-4 w-4" />
            Record Payment
          </button>
        </div>

        <p className="text-xs text-slate-500">
          This is a demo payment record. No real money is transferred.
        </p>
      </form>
    </Modal>
  );
}
