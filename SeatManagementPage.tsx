import { useState } from 'react';
import { Plus, Armchair, CircleCheck, Circle, Clock, Wrench, UserCheck, ArrowRightLeft, UserX, Info } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { useLibrary } from '@/context/LibraryContext';
import type { Seat, SeatStatus } from '@/types';

const statusIcons: Record<SeatStatus, typeof Circle> = {
  Available: CircleCheck,
  Occupied: Circle,
  Reserved: Clock,
  Maintenance: Wrench,
};

const statusColors: Record<SeatStatus, string> = {
  Available: 'border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50 hover:bg-emerald-500/15',
  Occupied: 'border-sky-500/30 bg-sky-500/10 hover:border-sky-500/50 hover:bg-sky-500/15',
  Reserved: 'border-amber-500/30 bg-amber-500/10 hover:border-amber-500/50 hover:bg-amber-500/15',
  Maintenance: 'border-rose-500/30 bg-rose-500/10 hover:border-rose-500/50 hover:bg-rose-500/15',
};

export default function SeatManagementPage() {
  const { seats, students, assignSeat, releaseSeat, changeSeat, addSeat, showToast } = useLibrary();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [assignMode, setAssignMode] = useState(false);
  const [assignStudentId, setAssignStudentId] = useState('');
  const [changeMode, setChangeMode] = useState(false);
  const [changeTargetSeatId, setChangeTargetSeatId] = useState('');

  const filtered = seats.filter((seat) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      seat.seatNumber.toString().includes(q) ||
      (seat.assignedStudentName?.toLowerCase().includes(q) ?? false) ||
      (seat.assignedStudentRoll?.toLowerCase().includes(q) ?? false);
    const matchesStatus = statusFilter === 'All' || seat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const occupiedCount = seats.filter((s) => s.status === 'Occupied').length;
  const availableCount = seats.filter((s) => s.status === 'Available').length;
  const reservedCount = seats.filter((s) => s.status === 'Reserved').length;

  const unassignedStudents = students.filter(
    (s) => s.status === 'Active' && (s.seatNumber === null || s.id !== selectedSeat?.assignedStudentId)
  );

  const availableSeatsForChange = seats.filter((s) => s.status === 'Available' && s.id !== selectedSeat?.id);

  function handleAssign() {
    if (!selectedSeat || !assignStudentId) return;
    if (selectedSeat.status !== 'Available') {
      showToast('This seat is not available for assignment', 'error');
      return;
    }
    assignSeat(selectedSeat.id, assignStudentId);
    const student = students.find((s) => s.id === assignStudentId);
    showToast(`Seat ${selectedSeat.seatNumber} assigned to ${student?.name}`, 'success');
    setAssignMode(false);
    setAssignStudentId('');
    setSelectedSeat(null);
  }

  function handleRelease() {
    if (!selectedSeat) return;
    releaseSeat(selectedSeat.id);
    showToast(`Seat ${selectedSeat.seatNumber} has been released`, 'success');
    setSelectedSeat(null);
  }

  function handleChangeSeat() {
    if (!selectedSeat || !changeTargetSeatId) return;
    changeSeat(selectedSeat.id, changeTargetSeatId);
    const targetSeat = seats.find((s) => s.id === changeTargetSeatId);
    showToast(`Seat changed from ${selectedSeat.seatNumber} to ${targetSeat?.seatNumber}`, 'success');
    setChangeMode(false);
    setChangeTargetSeatId('');
    setSelectedSeat(null);
  }

  function openSeatDetail(seat: Seat) {
    setSelectedSeat(seat);
    setAssignMode(false);
    setChangeMode(false);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Seat Management"
        description="View, assign, and manage seat allocations across your library."
        actions={
          <button
            onClick={() => {
              addSeat();
              showToast(`Seat ${seats.length + 1} has been added`, 'success');
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-600 hover:to-cyan-600"
          >
            <Plus className="h-4 w-4" />
            Add Seat
          </button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Seats" value={seats.length} icon={Armchair} accent="sky" />
        <StatCard label="Occupied" value={occupiedCount} icon={UserCheck} accent="amber" />
        <StatCard label="Available" value={availableCount} icon={CircleCheck} accent="emerald" />
        <StatCard label="Reserved" value={reservedCount} icon={Clock} accent="cyan" />
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-xs text-slate-400 backdrop-blur-md">
        <span className="font-medium text-slate-300">Legend:</span>
        {(['Available', 'Occupied', 'Reserved', 'Maintenance'] as SeatStatus[]).map((st) => {
          const Icon = statusIcons[st];
          return (
            <span key={st} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {st}
            </span>
          );
        })}
      </div>

      {/* Search & filter */}
      <div className="mb-6">
        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by seat number or student name..."
          filters={[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'All', label: 'All Statuses' },
                { value: 'Available', label: 'Available' },
                { value: 'Occupied', label: 'Occupied' },
                { value: 'Reserved', label: 'Reserved' },
                { value: 'Maintenance', label: 'Maintenance' },
              ],
            },
          ]}
        />
      </div>

      {/* Seat Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {filtered.map((seat) => {
          const Icon = statusIcons[seat.status];
          return (
            <button
              key={seat.id}
              onClick={() => openSeatDetail(seat)}
              className={`group flex flex-col items-center rounded-xl border p-4 text-center transition-all duration-200 ${statusColors[seat.status]}`}
            >
              <Icon className="h-6 w-6 mb-2" />
              <span className="text-lg font-bold text-white">S{seat.seatNumber}</span>
              <span className="mt-0.5 text-xs text-slate-400">{seat.status}</span>
              {seat.assignedStudentName && (
                <span className="mt-1 truncate text-xs text-slate-300" title={seat.assignedStudentName}>
                  {seat.assignedStudentName}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-slate-900/30 px-6 py-16 text-center">
          <p className="text-sm text-slate-400">No seats match your search.</p>
        </div>
      )}

      {/* Seat Detail Modal */}
      <Modal
        open={!!selectedSeat}
        onClose={() => setSelectedSeat(null)}
        title={selectedSeat ? `Seat ${selectedSeat.seatNumber}` : ''}
      >
        {selectedSeat && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                  {(() => {
                    const Icon = statusIcons[selectedSeat.status];
                    return <Icon className="h-6 w-6 text-slate-300" />;
                  })()}
                </div>
                <div>
                  <p className="font-semibold text-white">Seat {selectedSeat.seatNumber}</p>
                  <StatusBadge status={selectedSeat.status} />
                </div>
              </div>
            </div>

            {selectedSeat.assignedStudentName ? (
              <div className="rounded-lg border border-white/5 bg-white/5 p-4">
                <p className="mb-1 text-xs text-slate-500">Assigned Student</p>
                <p className="text-sm font-medium text-white">{selectedSeat.assignedStudentName}</p>
                <p className="text-xs text-slate-400">Roll: {selectedSeat.assignedStudentRoll}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-white/5 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Info className="h-4 w-4" />
                  No student currently assigned to this seat.
                </div>
              </div>
            )}

            {/* Assign Mode */}
            {assignMode && selectedSeat.status === 'Available' && (
              <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-300">Select a student to assign</label>
                <select
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-400/40"
                >
                  <option value="">Choose a student...</option>
                  {unassignedStudents
                    .filter((s) => s.seatNumber === null)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.rollNumber}
                      </option>
                    ))}
                </select>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleAssign}
                    disabled={!assignStudentId}
                    className="flex-1 rounded-lg bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/30 disabled:opacity-40"
                  >
                    Confirm Assignment
                  </button>
                  <button
                    onClick={() => {
                      setAssignMode(false);
                      setAssignStudentId('');
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Change Seat Mode */}
            {changeMode && selectedSeat.status === 'Occupied' && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-300">Move to available seat</label>
                <select
                  value={changeTargetSeatId}
                  onChange={(e) => setChangeTargetSeatId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-400/40"
                >
                  <option value="">Choose a seat...</option>
                  {availableSeatsForChange.map((s) => (
                    <option key={s.id} value={s.id}>
                      Seat {s.seatNumber}
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleChangeSeat}
                    disabled={!changeTargetSeatId}
                    className="flex-1 rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/30 disabled:opacity-40"
                  >
                    Confirm Change
                  </button>
                  <button
                    onClick={() => {
                      setChangeMode(false);
                      setChangeTargetSeatId('');
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!assignMode && !changeMode && (
              <div className="flex flex-wrap gap-2">
                {selectedSeat.status === 'Available' && (
                  <button
                    onClick={() => setAssignMode(true)}
                    className="flex items-center gap-2 rounded-lg bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/30"
                  >
                    <UserCheck className="h-4 w-4" />
                    Assign Student
                  </button>
                )}
                {selectedSeat.status === 'Occupied' && (
                  <>
                    <button
                      onClick={() => setChangeMode(true)}
                      className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/30"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Change Seat
                    </button>
                    <button
                      onClick={handleRelease}
                      className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
                    >
                      <UserX className="h-4 w-4" />
                      Release Seat
                    </button>
                  </>
                )}
              </div>
            )}

            <p className="text-xs text-slate-500">
              Version 1 — Frontend Preview. Seat operations update demo state only.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
