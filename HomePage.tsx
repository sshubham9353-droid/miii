import { useNavigate } from 'react-router-dom';
import { Library, Armchair, UserPlus, Wallet, Users, LayoutGrid, CircleDollarSign, AlertCircle, Calendar } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import StatCard from '@/components/StatCard';
import { useLibrary } from '@/context/LibraryContext';
import { formatCurrency } from '@/utils/helpers';

export default function HomePage() {
  const navigate = useNavigate();
  const { students, seats, settings, feeRecords } = useLibrary();

  const occupiedSeats = seats.filter((s) => s.status === 'Occupied').length;
  const availableSeats = seats.filter((s) => s.status === 'Available').length;
  const feesCollected = students.reduce((sum, s) => sum + s.paidAmount, 0);
  const pendingFees = feeRecords.reduce(
    (sum, f) => sum + f.outstandingBalance,
    0
  );

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/20">
            <Library className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              {settings.libraryName}
            </h1>
            <p className="text-sm text-slate-400">Your Library, Simplified.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="h-4 w-4" />
          {today}
        </div>
      </div>

      {/* Three primary dashboard cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Seat Management"
          description="View available seats, occupied seats and student assignments."
          icon={Armchair}
          buttonLabel="Manage Seats"
          onClick={() => navigate('/seats')}
          accent="sky"
        />
        <DashboardCard
          title="Student Registration"
          description="Register students and manage their information."
          icon={UserPlus}
          buttonLabel="Register Student"
          onClick={() => navigate('/registration')}
          accent="cyan"
        />
        <DashboardCard
          title="Fees & Payments"
          description="Track fee collections, pending balances and payment history."
          icon={Wallet}
          buttonLabel="Open Fee Dashboard"
          onClick={() => navigate('/fees')}
          accent="emerald"
        />
      </div>

      {/* Statistics row */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Overview — Demo Data
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label="Total Students"
            value={students.length}
            icon={Users}
            accent="sky"
          />
          <StatCard
            label="Total Seats"
            value={seats.length}
            icon={LayoutGrid}
            accent="cyan"
          />
          <StatCard
            label="Occupied"
            value={occupiedSeats}
            icon={Armchair}
            accent="amber"
          />
          <StatCard
            label="Available"
            value={availableSeats}
            icon={LayoutGrid}
            accent="emerald"
          />
          <StatCard
            label="Fees Collected"
            value={formatCurrency(feesCollected)}
            icon={CircleDollarSign}
            accent="emerald"
          />
          <StatCard
            label="Pending Fees"
            value={formatCurrency(pendingFees)}
            icon={AlertCircle}
            accent="rose"
          />
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-white/5 bg-slate-900/30 p-4 text-center text-xs text-slate-500">
        Version 1 — Frontend Preview · All data shown is demonstration data and will not be permanently saved.
      </div>
    </div>
  );
}
