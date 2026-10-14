import { useState, useMemo } from 'react';
import { Download, TrendingUp, Users, Armchair, AlertCircle, CreditCard } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useLibrary } from '@/context/LibraryContext';
import { formatCurrency } from '@/utils/helpers';

const PIE_COLORS = ['#38bdf8', '#22d3ee', '#34d399', '#fbbf24', '#f43f5e'];

const monthlyCollection = [
  { month: 'May', collected: 3000, pending: 1500 },
  { month: 'Jun', collected: 4500, pending: 1200 },
  { month: 'Jul', collected: 4500, pending: 800 },
  { month: 'Aug', collected: 6000, pending: 2000 },
  { month: 'Sep', collected: 8500, pending: 3000 },
  { month: 'Oct', collected: 9800, pending: 2500 },
];

const registrationData = [
  { month: 'May', registrations: 2 },
  { month: 'Jun', registrations: 2 },
  { month: 'Jul', registrations: 2 },
  { month: 'Aug', registrations: 3 },
  { month: 'Sep', registrations: 2 },
  { month: 'Oct', registrations: 1 },
];

export default function ReportsPage() {
  const { students, seats, feeRecords, payments, showToast } = useLibrary();
  const [fromDate, setFromDate] = useState('2024-05-01');
  const [toDate, setToDate] = useState('2024-10-31');

  const totalCollected = students.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalPending = feeRecords.reduce((sum, f) => sum + f.outstandingBalance, 0);
  const occupiedSeats = seats.filter((s) => s.status === 'Occupied').length;

  const occupancyData = useMemo(() => {
    const available = seats.filter((s) => s.status === 'Available').length;
    const reserved = seats.filter((s) => s.status === 'Reserved').length;
    const maintenance = seats.filter((s) => s.status === 'Maintenance').length;
    return [
      { name: 'Occupied', value: occupiedSeats },
      { name: 'Available', value: available },
      { name: 'Reserved', value: reserved },
      { name: 'Maintenance', value: maintenance },
    ];
  }, [seats, occupiedSeats]);

  const methodBreakdown = useMemo(() => {
    const methods: Record<string, number> = {};
    payments.forEach((p) => {
      methods[p.method] = (methods[p.method] || 0) + p.amount;
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [payments]);

  const pendingByStatus = useMemo(() => {
    const statuses: Record<string, number> = {};
    feeRecords
      .filter((f) => f.status !== 'Paid')
      .forEach((f) => {
        statuses[f.status] = (statuses[f.status] || 0) + f.outstandingBalance;
      });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [feeRecords]);

  function handleCSVExport() {
    const headers = [
      'Student Name', 'Student ID', 'Roll Number', 'Phone',
      'Seat', 'Monthly Fee', 'Amount Paid', 'Pending',
      'Status', 'Due Date',
    ];
    const rows = students.map((s) => [
      s.name,
      s.studentId,
      s.rollNumber,
      s.phone,
      s.seatNumber ?? '',
      s.monthlyFee,
      s.paidAmount,
      Math.max(s.monthlyFee - s.paidAmount, 0),
      s.status,
      s.feeDueDate,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV report exported successfully', 'success');
  }

  const tooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#e2e8f0',
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports"
        description="Monthly collection, registration, occupancy, and payment method insights."
        actions={
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-600 hover:to-cyan-600"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        }
      />

      {/* Date range */}
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/40"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/40"
          />
        </div>
        <span className="text-xs text-slate-500">Date range is for demonstration filtering</span>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Collected" value={formatCurrency(totalCollected)} icon={TrendingUp} accent="emerald" />
        <StatCard label="Total Pending" value={formatCurrency(totalPending)} icon={AlertCircle} accent="rose" />
        <StatCard label="Total Students" value={students.length} icon={Users} accent="sky" />
        <StatCard label="Occupied Seats" value={occupiedSeats} icon={Armchair} accent="amber" />
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Fee Collection */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-white">Monthly Fee Collection</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyCollection}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Bar dataKey="collected" name="Collected" fill="#34d399" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Student Registrations */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-white">Student Registration Summary</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="registrations" name="New Students" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Seat Occupancy */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-white">Seat Occupancy</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={occupancyData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {occupancyData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Method Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-white">Payment Method Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={methodBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
              <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} width={100} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" name="Amount" fill="#22d3ee" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Fees Summary */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-sm font-semibold text-white">Pending Fees Summary by Status</h3>
        {pendingByStatus.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pendingByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" name="Outstanding" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-12 text-center text-sm text-slate-400">No pending fees. All payments are complete.</p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        All charts use demonstration data. CSV export contains current session student records.
      </p>
    </div>
  );
}
