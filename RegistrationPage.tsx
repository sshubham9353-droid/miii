import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, RotateCcw, Save, User, Phone, Calendar, DollarSign, ClipboardList } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useLibrary } from '@/context/LibraryContext';
import { generateStudentId, generateRollNumber, formatDate } from '@/utils/helpers';
import type { Student, StudentStatus } from '@/types';

interface FormErrors {
  [key: string]: string;
}

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { students, addStudent, showToast } = useLibrary();

  const [form, setForm] = useState({
    name: '',
    studentId: generateStudentId(students.map((s) => s.studentId)),
    rollNumber: generateRollNumber(students.map((s) => s.rollNumber)),
    phone: '',
    altPhone: '',
    seatNumber: '',
    monthlyFee: '1500',
    registrationDate: new Date().toISOString().split('T')[0],
    joiningDate: new Date().toISOString().split('T')[0],
    feeDueDate: '',
    status: 'Active' as StudentStatus,
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Student name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[+\d\s-]{10,15}$/.test(form.phone.trim()))
      e.phone = 'Enter a valid phone number (10-15 digits)';
    if (form.altPhone && !/^[+\d\s-]{10,15}$/.test(form.altPhone.trim()))
      e.altPhone = 'Enter a valid alternate phone number';
    if (!form.monthlyFee || isNaN(Number(form.monthlyFee)) || Number(form.monthlyFee) < 0)
      e.monthlyFee = 'Enter a valid monthly fee';
    if (!form.registrationDate) e.registrationDate = 'Registration date is required';
    if (!form.joiningDate) e.joiningDate = 'Joining date is required';
    if (!form.feeDueDate) e.feeDueDate = 'Fee due date is required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast('Please fix the highlighted fields', 'error');
      return;
    }

    const newStudent: Student = {
      id: `s-${Date.now()}`,
      studentId: form.studentId,
      name: form.name.trim(),
      rollNumber: form.rollNumber,
      phone: form.phone.trim(),
      altPhone: form.altPhone.trim() || undefined,
      seatNumber: form.seatNumber ? Number(form.seatNumber) : null,
      monthlyFee: Number(form.monthlyFee),
      paidAmount: 0,
      registrationDate: form.registrationDate,
      joiningDate: form.joiningDate,
      feeDueDate: form.feeDueDate,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };

    addStudent(newStudent);
    showToast(`${newStudent.name} has been registered successfully`, 'success');
    navigate('/students');
  }

  function handleReset() {
    setForm({
      name: '',
      studentId: generateStudentId(students.map((s) => s.studentId)),
      rollNumber: generateRollNumber(students.map((s) => s.rollNumber)),
      phone: '',
      altPhone: '',
      seatNumber: '',
      monthlyFee: '1500',
      registrationDate: new Date().toISOString().split('T')[0],
      joiningDate: new Date().toISOString().split('T')[0],
      feeDueDate: '',
      status: 'Active',
      notes: '',
    });
    setErrors({});
    showToast('Form has been reset', 'info');
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const inputClass = (field: string) =>
    `w-full rounded-lg border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:bg-white/8 ${
      errors[field]
        ? 'border-rose-500/50 focus:border-rose-500/60'
        : 'border-white/10 focus:border-sky-400/40'
    }`;

  const labelClass = 'mb-1.5 block text-sm font-medium text-slate-300';

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="New Student Registration"
        description="Register a new student with their information. All fields marked with * are required."
      />

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Student Information */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-sky-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Student Information
            </h3>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Student Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className={inputClass('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass}>Student ID</label>
              <input
                type="text"
                value={form.studentId}
                readOnly
                className={`${inputClass('studentId')} cursor-not-allowed opacity-60`}
              />
              <p className="mt-1 text-xs text-slate-500">Auto-generated demo ID</p>
            </div>
            <div>
              <label className={labelClass}>Roll Number</label>
              <input
                type="text"
                value={form.rollNumber}
                readOnly
                className={`${inputClass('rollNumber')} cursor-not-allowed opacity-60`}
              />
              <p className="mt-1 text-xs text-slate-500">Auto-generated demo roll number</p>
            </div>
            <div>
              <label className={labelClass}>
                Student Status <span className="text-rose-400">*</span>
              </label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className={inputClass('status')}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Left">Left</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Contact Information
            </h3>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Phone Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="e.g. +91 90000 11111"
                className={inputClass('phone')}
              />
              {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>}
            </div>
            <div>
              <label className={labelClass}>Alternate Phone Number (Optional)</label>
              <input
                type="tel"
                value={form.altPhone}
                onChange={(e) => update('altPhone', e.target.value)}
                placeholder="e.g. +91 90000 22222"
                className={inputClass('altPhone')}
              />
              {errors.altPhone && <p className="mt-1 text-xs text-rose-400">{errors.altPhone}</p>}
            </div>
          </div>
        </div>

        {/* Seat & Fee */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Seat & Fee Information
            </h3>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Seat Number (Optional)</label>
              <input
                type="number"
                value={form.seatNumber}
                onChange={(e) => update('seatNumber', e.target.value)}
                placeholder="e.g. 15"
                min="1"
                className={inputClass('seatNumber')}
              />
            </div>
            <div>
              <label className={labelClass}>
                Monthly Fee (₹) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                value={form.monthlyFee}
                onChange={(e) => update('monthlyFee', e.target.value)}
                placeholder="e.g. 1500"
                min="0"
                className={inputClass('monthlyFee')}
              />
              {errors.monthlyFee && <p className="mt-1 text-xs text-rose-400">{errors.monthlyFee}</p>}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Important Dates
            </h3>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className={labelClass}>
                Registration Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={form.registrationDate}
                onChange={(e) => update('registrationDate', e.target.value)}
                className={inputClass('registrationDate')}
              />
              {errors.registrationDate && <p className="mt-1 text-xs text-rose-400">{errors.registrationDate}</p>}
            </div>
            <div>
              <label className={labelClass}>
                Joining Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) => update('joiningDate', e.target.value)}
                className={inputClass('joiningDate')}
              />
              {errors.joiningDate && <p className="mt-1 text-xs text-rose-400">{errors.joiningDate}</p>}
            </div>
            <div>
              <label className={labelClass}>
                Fee Due Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={form.feeDueDate}
                onChange={(e) => update('feeDueDate', e.target.value)}
                className={inputClass('feeDueDate')}
              />
              {errors.feeDueDate && <p className="mt-1 text-xs text-rose-400">{errors.feeDueDate}</p>}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Additional Notes (Optional)
            </h3>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            placeholder="Any additional information about the student..."
            className={inputClass('notes')}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-600 hover:to-cyan-600"
          >
            <Save className="h-4 w-4" />
            Register Student
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Form
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Version 1 — Frontend Preview. Registration is stored in session memory only and will not be permanently saved.
        </p>
      </form>
    </div>
  );
}
