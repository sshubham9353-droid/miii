import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useLibrary } from '@/context/LibraryContext';
import type { Student, StudentStatus } from '@/types';
import { Save, RotateCcw } from 'lucide-react';

export default function StudentFormModal({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  const { updateStudent, showToast } = useLibrary();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    altPhone: '',
    seatNumber: '',
    monthlyFee: '0',
    status: 'Active' as StudentStatus,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        phone: student.phone,
        altPhone: student.altPhone || '',
        seatNumber: student.seatNumber?.toString() || '',
        monthlyFee: student.monthlyFee.toString(),
        status: student.status,
        notes: student.notes || '',
      });
      setErrors({});
    }
  }, [student]);

  if (!student) return null;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[+\d\s-]{10,15}$/.test(form.phone.trim()))
      e.phone = 'Enter a valid phone number';
    if (form.altPhone && !/^[+\d\s-]{10,15}$/.test(form.altPhone.trim()))
      e.altPhone = 'Enter a valid alternate phone';
    if (!form.monthlyFee || isNaN(Number(form.monthlyFee)) || Number(form.monthlyFee) < 0)
      e.monthlyFee = 'Enter a valid fee';
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
    updateStudent(student.id, {
      name: form.name.trim(),
      phone: form.phone.trim(),
      altPhone: form.altPhone.trim() || undefined,
      seatNumber: form.seatNumber ? Number(form.seatNumber) : null,
      monthlyFee: Number(form.monthlyFee),
      status: form.status,
      notes: form.notes.trim() || undefined,
    });
    showToast(`${form.name} has been updated`, 'success');
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
    <Modal open={!!student} onClose={onClose} title={`Edit Student — ${student.name}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className={inputClass('phone')}
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>}
          </div>
          <div>
            <label className={labelClass}>Alternate Phone</label>
            <input
              type="tel"
              value={form.altPhone}
              onChange={(e) => setForm((p) => ({ ...p, altPhone: e.target.value }))}
              className={inputClass('altPhone')}
            />
            {errors.altPhone && <p className="mt-1 text-xs text-rose-400">{errors.altPhone}</p>}
          </div>
          <div>
            <label className={labelClass}>Seat Number</label>
            <input
              type="number"
              value={form.seatNumber}
              onChange={(e) => setForm((p) => ({ ...p, seatNumber: e.target.value }))}
              min="1"
              className={inputClass('seatNumber')}
            />
          </div>
          <div>
            <label className={labelClass}>Monthly Fee (₹) *</label>
            <input
              type="number"
              value={form.monthlyFee}
              onChange={(e) => setForm((p) => ({ ...p, monthlyFee: e.target.value }))}
              min="0"
              className={inputClass('monthlyFee')}
            />
            {errors.monthlyFee && <p className="mt-1 text-xs text-rose-400">{errors.monthlyFee}</p>}
          </div>
          <div>
            <label className={labelClass}>Status *</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StudentStatus }))}
              className={inputClass('status')}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Left">Left</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={3}
            className={inputClass('notes')}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-600 hover:to-cyan-600"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
