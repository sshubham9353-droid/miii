import { useState, useMemo } from 'react';
import { History, DollarSign, Receipt, TrendingUp, Calendar } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import SearchFilterBar from '@/components/SearchFilterBar';
import EmptyState from '@/components/EmptyState';
import ReceiptPreview from '@/components/ReceiptPreview';
import { useLibrary } from '@/context/LibraryContext';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { Payment, PaymentMethod } from '@/types';

export default function PaymentHistoryPage() {
  const { payments, students } = useLibrary();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [studentFilter, setStudentFilter] = useState('All');
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const dateOptions = useMemo(() => {
    const months = new Set(
      payments.map((p) =>
        new Date(p.paymentDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      )
    );
    return ['All', ...Array.from(months).sort()];
  }, [payments]);

  const filtered = useMemo(() => {
    let records = payments;
    if (methodFilter !== 'All') {
      records = records.filter((r) => r.method === methodFilter);
    }
    if (studentFilter !== 'All') {
      records = records.filter((r) => r.studentId === studentFilter);
    }
    if (dateFilter !== 'All') {
      records = records.filter((r) => {
        const payMonth = new Date(r.paymentDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        return payMonth === dateFilter;
      });
    }
    if (search) {
      const q = search.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.rollNumber.toLowerCase().includes(q) ||
          r.transactionId.toLowerCase().includes(q) ||
          (r.referenceNumber?.toLowerCase().includes(q) ?? false)
      );
    }
    return records;
  }, [payments, search, methodFilter, studentFilter, dateFilter]);

  const totalAmount = filtered.reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = filtered.length;
  const avgPayment = totalTransactions > 0 ? Math.round(totalAmount / totalTransactions) : 0;

  const studentOptions = useMemo(() => {
    const names = new Map<string, string>();
    payments.forEach((p) => names.set(p.studentId, p.studentName));
    return Array.from(names.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [payments]);

  function openReceipt(payment: Payment) {
    setReceiptPayment(payment);
    setReceiptOpen(true);
  }

  const columns = [
    'Transaction ID', 'Student Name', 'Roll No',
    'Payment Date', 'Amount', 'Method', 'Reference', 'Action',
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Payment History"
        description="View all recorded payment transactions with receipt previews."
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Transactions" value={totalTransactions} icon={History} accent="sky" />
        <StatCard label="Total Amount" value={formatCurrency(totalAmount)} icon={DollarSign} accent="emerald" />
        <StatCard label="Average Payment" value={formatCurrency(avgPayment)} icon={TrendingUp} accent="cyan" />
      </div>

      {/* Search & Filters */}
      <div className="mb-4">
        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by transaction ID, student name, roll number or reference..."
          filters={[
            {
              label: 'Date',
              value: dateFilter,
              onChange: setDateFilter,
              options: dateOptions.map((d) => ({ value: d, label: d === 'All' ? 'All Dates' : d })),
            },
            {
              label: 'Method',
              value: methodFilter,
              onChange: setMethodFilter,
              options: [
                { value: 'All', label: 'All Methods' },
                { value: 'Cash', label: 'Cash' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Other', label: 'Other' },
              ],
            },
            {
              label: 'Student',
              value: studentFilter,
              onChange: setStudentFilter,
              options: [
                { value: 'All', label: 'All Students' },
                ...studentOptions,
              ],
            },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No transactions found"
          message="No payment transactions match your search or filters."
          icon={History}
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
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-sky-300">{p.transactionId}</td>
                      <td className="px-4 py-3 text-white">{p.studentName}</td>
                      <td className="px-4 py-3 text-slate-400">{p.rollNumber}</td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-3 font-medium text-emerald-300">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3 text-slate-400">{p.method}</td>
                      <td className="px-4 py-3 text-slate-400">{p.referenceNumber || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openReceipt(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-cyan-500/15 hover:text-cyan-300"
                          title="View Receipt"
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 lg:hidden">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sky-300">{p.transactionId}</p>
                    <p className="text-xs text-slate-500">{p.studentName} · {p.rollNumber}</p>
                  </div>
                  <span className="font-medium text-emerald-300">{formatCurrency(p.amount)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(p.paymentDate)}
                  </span>
                  <span>{p.method}</span>
                </div>
                <button
                  onClick={() => openReceipt(p)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-slate-300 transition hover:bg-cyan-500/10 hover:text-cyan-300"
                >
                  <Receipt className="h-3.5 w-3.5" /> View Receipt
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-4 text-xs text-slate-500">
        All transactions are demo records. No real payments have been processed.
      </p>

      <ReceiptPreview payment={receiptPayment} open={receiptOpen} onClose={() => setReceiptOpen(false)} />
    </div>
  );
}
