import { useState, useMemo } from 'react';
import { AlertCircle, DollarSign, Eye, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import SearchFilterBar from '@/components/SearchFilterBar';
import EmptyState from '@/components/EmptyState';
import PaymentModal from '@/components/PaymentModal';
import StudentDetailModal from '@/components/StudentDetailModal';
import { useLibrary } from '@/context/LibraryContext';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { Student, FeeStatus } from '@/types';

export default function PendingFeesPage() {
  const { students, feeRecords } = useLibrary();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentStudent, setPaymentStudent] = useState<Student | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  const pendingRecords = useMemo(() => {
    return feeRecords.filter((f) => f.status !== 'Paid');
  }, [feeRecords]);

  const filtered = useMemo(() => {
    let records = pendingRecords;
    if (statusFilter !== 'All') {
      records = records.filter((r) => r.status === statusFilter);
    }
    if (monthFilter !== 'All') {
      records = records.filter((r) => {
        const dueMonth = new Date(r.dueDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        return dueMonth === monthFilter;
      });
    }
    if (search) {
      const q = search.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.rollNumber.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q)
      );
    }
    return records;
  }, [pendingRecords, search, monthFilter, statusFilter]);

  const totalOutstanding = filtered.reduce((sum, f) => sum + f.outstandingBalance, 0);
  const studentsWithPending = filtered.length;
  const overdueRecords = filtered.filter((f) => f.status === 'Overdue').length;

  const monthOptions = useMemo(() => {
    const months = new Set(
      pendingRecords.map((r) =>
        new Date(r.dueDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      )
    );
    return ['All', ...Array.from(months).sort()];
  }, [pendingRecords]);

  function openPayment(student: Student) {
    setPaymentStudent(student);
    setPaymentOpen(true);
  }

  const columns = [
    'Student Name', 'Student ID', 'Roll No', 'Phone',
    'Seat', 'Monthly Fee', 'Paid', 'Balance', 'Due Date', 'Status', 'Actions',
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pending Fees"
        description="Track unpaid and overdue fees across all students."
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Outstanding" value={formatCurrency(totalOutstanding)} icon={DollarSign} accent="rose" />
        <StatCard label="Students with Pending" value={studentsWithPending} icon={Users} accent="amber" />
        <StatCard label="Overdue Records" value={overdueRecords} icon={AlertCircle} accent="rose" />
      </div>

      {/* Search & Filters */}
      <div className="mb-4">
        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by student name or roll number..."
          filters={[
            {
              label: 'Month',
              value: monthFilter,
              onChange: setMonthFilter,
              options: monthOptions.map((m) => ({ value: m, label: m === 'All' ? 'All Months' : m })),
            },
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'All', label: 'All Statuses' },
                { value: 'Partially Paid', label: 'Partially Paid' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Overdue', label: 'Overdue' },
              ],
            },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No pending fees"
          message="All fees are paid for the current filter. Great job!"
          icon={AlertCircle}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-400">
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => {
                    const student = students.find((s) => s.id === f.studentId);
                    return (
                      <tr key={f.id} className="border-b border-white/5 transition hover:bg-white/5">
                        <td className="px-4 py-3 font-medium text-white">{f.studentName}</td>
                        <td className="px-4 py-3 text-slate-400">{f.studentId}</td>
                        <td className="px-4 py-3 text-slate-400">{f.rollNumber}</td>
                        <td className="px-4 py-3 text-slate-400">{student?.phone || '—'}</td>
                        <td className="px-4 py-3 text-slate-400">{f.seatNumber ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-300">{formatCurrency(f.monthlyFee)}</td>
                        <td className="px-4 py-3 text-emerald-300">{formatCurrency(f.amountPaid)}</td>
                        <td className="px-4 py-3 font-medium text-amber-300">{formatCurrency(f.outstandingBalance)}</td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(f.dueDate)}</td>
                        <td className="px-4 py-3"><StatusBadge status={f.status as FeeStatus} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {student && (
                              <button
                                onClick={() => setDetailStudent(student)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-sky-500/15 hover:text-sky-300"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            {student && (
                              <button
                                onClick={() => openPayment(student)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-emerald-500/15 hover:text-emerald-300"
                                title="Record Demo Payment"
                              >
                                <DollarSign className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 lg:hidden">
            {filtered.map((f) => {
              const student = students.find((s) => s.id === f.studentId);
              return (
                <div key={f.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">{f.studentName}</p>
                      <p className="text-xs text-slate-500">{f.studentId} · {f.rollNumber}</p>
                    </div>
                    <StatusBadge status={f.status as FeeStatus} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Phone:</span>{' '}
                      <span className="text-slate-300">{student?.phone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Seat:</span>{' '}
                      <span className="text-slate-300">{f.seatNumber ?? '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Monthly:</span>{' '}
                      <span className="text-slate-300">{formatCurrency(f.monthlyFee)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Paid:</span>{' '}
                      <span className="text-emerald-300">{formatCurrency(f.amountPaid)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Balance:</span>{' '}
                      <span className="text-amber-300">{formatCurrency(f.outstandingBalance)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Due:</span>{' '}
                      <span className="text-slate-300">{formatDate(f.dueDate)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {student && (
                      <button
                        onClick={() => setDetailStudent(student)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-slate-300 transition hover:bg-white/5"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    )}
                    {student && (
                      <button
                        onClick={() => openPayment(student)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-slate-300 transition hover:bg-emerald-500/10 hover:text-emerald-300"
                      >
                        <DollarSign className="h-3.5 w-3.5" /> Pay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modals */}
      <PaymentModal student={paymentStudent} open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <StudentDetailModal student={detailStudent} onClose={() => setDetailStudent(null)} />
    </div>
  );
}
