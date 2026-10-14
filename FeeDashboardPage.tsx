import { useState, useMemo } from 'react';
import { Wallet, TrendingUp, AlertCircle, Clock, DollarSign, Eye, History, Receipt, Pencil } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import SearchFilterBar from '@/components/SearchFilterBar';
import EmptyState from '@/components/EmptyState';
import PaymentModal from '@/components/PaymentModal';
import ReceiptPreview from '@/components/ReceiptPreview';
import StudentDetailModal from '@/components/StudentDetailModal';
import { useLibrary } from '@/context/LibraryContext';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { FeeRecord, Student, Payment } from '@/types';

type Tab = 'All Fees' | 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue' | 'Payment History';

const tabs: Tab[] = ['All Fees', 'Paid', 'Partially Paid', 'Pending', 'Overdue', 'Payment History'];

const monthlyData = [
  { month: 'May', collection: 3000 },
  { month: 'Jun', collection: 4500 },
  { month: 'Jul', collection: 4500 },
  { month: 'Aug', collection: 6000 },
  { month: 'Sep', collection: 8500 },
  { month: 'Oct', collection: 9800 },
];

export default function FeeDashboardPage() {
  const { students, feeRecords, payments, showToast } = useLibrary();
  const [activeTab, setActiveTab] = useState<Tab>('All Fees');
  const [search, setSearch] = useState('');
  const [paymentStudent, setPaymentStudent] = useState<Student | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  const totalCollected = students.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalPending = feeRecords
    .filter((f) => f.status === 'Pending' || f.status === 'Partially Paid')
    .reduce((sum, f) => sum + f.outstandingBalance, 0);
  const partialCount = feeRecords.filter((f) => f.status === 'Partially Paid').length;
  const overdueAmount = feeRecords
    .filter((f) => f.status === 'Overdue')
    .reduce((sum, f) => sum + f.outstandingBalance, 0);

  const filteredFees = useMemo(() => {
    let records = feeRecords;
    if (activeTab !== 'All Fees' && activeTab !== 'Payment History') {
      records = records.filter((r) => r.status === activeTab);
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
  }, [feeRecords, activeTab, search]);

  const filteredPayments = useMemo(() => {
    if (!search) return payments;
    const q = search.toLowerCase().trim();
    return payments.filter(
      (p) =>
        p.studentName.toLowerCase().includes(q) ||
        p.rollNumber.toLowerCase().includes(q) ||
        p.transactionId.toLowerCase().includes(q)
    );
  }, [payments, search]);

  function openPayment(student: Student) {
    setPaymentStudent(student);
    setPaymentOpen(true);
  }

  function openReceipt(payment: Payment) {
    setReceiptPayment(payment);
    setReceiptOpen(true);
  }

  const feeColumns = [
    'Student Name', 'Roll No', 'Seat', 'Monthly Fee', 'Amount Paid',
    'Outstanding', 'Due Date', 'Status', 'Actions',
  ];

  const isFeeTab = activeTab !== 'Payment History';

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Fee & Payment Dashboard"
        description="Track fee collections, pending balances, and payment history."
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Collected" value={formatCurrency(totalCollected)} icon={DollarSign} accent="emerald" />
        <StatCard label="Total Pending" value={formatCurrency(totalPending)} icon={AlertCircle} accent="amber" />
        <StatCard label="Partially Paid" value={partialCount} icon={Clock} accent="sky" />
        <StatCard label="Overdue" value={formatCurrency(overdueAmount)} icon={AlertCircle} accent="rose" />
      </div>

      {/* Monthly collection chart */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-sky-400" />
          <h3 className="text-sm font-semibold text-white">Monthly Fee Collection</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
              formatter={(value) => [formatCurrency(Number(value)), 'Collected']}
            />
            <Bar dataKey="collection" fill="#38bdf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-slate-900/40 p-1 backdrop-blur-md">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-sky-500/20 text-sky-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={isFeeTab ? 'Search by student name or roll number...' : 'Search by transaction ID, student name...'}
        />
      </div>

      {/* Fee Table */}
      {isFeeTab ? (
        filteredFees.length === 0 ? (
          <EmptyState title="No fee records found" message="No records match your current search or filter." icon={Wallet} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md lg:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-400">
                      {feeColumns.map((col) => (
                        <th key={col} className="px-4 py-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFees.map((f) => {
                      const student = students.find((s) => s.id === f.studentId);
                      return (
                        <tr key={f.id} className="border-b border-white/5 transition hover:bg-white/5">
                          <td className="px-4 py-3 font-medium text-white">{f.studentName}</td>
                          <td className="px-4 py-3 text-slate-400">{f.rollNumber}</td>
                          <td className="px-4 py-3 text-slate-400">{f.seatNumber ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-300">{formatCurrency(f.monthlyFee)}</td>
                          <td className="px-4 py-3 text-emerald-300">{formatCurrency(f.amountPaid)}</td>
                          <td className="px-4 py-3 text-amber-300">{formatCurrency(f.outstandingBalance)}</td>
                          <td className="px-4 py-3 text-slate-400">{formatDate(f.dueDate)}</td>
                          <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {f.status !== 'Paid' && student && (
                                <button
                                  onClick={() => openPayment(student)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-emerald-500/15 hover:text-emerald-300"
                                  title="Record Payment"
                                >
                                  <DollarSign className="h-4 w-4" />
                                </button>
                              )}
                              {student && (
                                <button
                                  onClick={() => setDetailStudent(student)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-sky-500/15 hover:text-sky-300"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              {f.amountPaid > 0 && (
                                <button
                                  onClick={() => {
                                    const lastPayment = payments
                                      .filter((p) => p.studentId === f.studentId)
                                      .pop();
                                    if (lastPayment) openReceipt(lastPayment);
                                    else showToast('No payment receipt available', 'info');
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-cyan-500/15 hover:text-cyan-300"
                                  title="View Receipt"
                                >
                                  <Receipt className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => showToast('Edit demo record — feature available in Version 2', 'info')}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-amber-500/15 hover:text-amber-300"
                                title="Edit Demo Record"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
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
              {filteredFees.map((f) => {
                const student = students.find((s) => s.id === f.studentId);
                return (
                  <div key={f.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-white">{f.studentName}</p>
                        <p className="text-xs text-slate-500">{f.rollNumber} · Seat {f.seatNumber ?? '—'}</p>
                      </div>
                      <StatusBadge status={f.status} />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Fee:</span>{' '}
                        <span className="text-slate-300">{formatCurrency(f.monthlyFee)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Paid:</span>{' '}
                        <span className="text-emerald-300">{formatCurrency(f.amountPaid)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Due:</span>{' '}
                        <span className="text-amber-300">{formatCurrency(f.outstandingBalance)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {f.status !== 'Paid' && student && (
                        <button
                          onClick={() => openPayment(student)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-slate-300 transition hover:bg-emerald-500/10 hover:text-emerald-300"
                        >
                          <DollarSign className="h-3.5 w-3.5" /> Pay
                        </button>
                      )}
                      {student && (
                        <button
                          onClick={() => setDetailStudent(student)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-slate-300 transition hover:bg-white/5"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      ) : (
        /* Payment History Tab */
        filteredPayments.length === 0 ? (
          <EmptyState title="No payments found" message="No payment transactions match your search." icon={History} />
        ) : (
          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-sky-300">{p.transactionId}</td>
                      <td className="px-4 py-3 text-white">{p.studentName}</td>
                      <td className="px-4 py-3 text-slate-400">{p.rollNumber}</td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-3 font-medium text-emerald-300">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3 text-slate-400">{p.method}</td>
                      <td className="px-4 py-3 text-slate-400">{p.referenceNumber || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openReceipt(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-cyan-500/15 hover:text-cyan-300 ml-auto"
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
        )
      )}

      {/* Modals */}
      <PaymentModal student={paymentStudent} open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <ReceiptPreview payment={receiptPayment} open={receiptOpen} onClose={() => setReceiptOpen(false)} />
      <StudentDetailModal student={detailStudent} onClose={() => setDetailStudent(null)} />
    </div>
  );
}
