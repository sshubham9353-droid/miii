import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowUp, ArrowDown, ArrowUpDown, Eye, Pencil, Trash2, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import StudentFormModal from '@/components/StudentFormModal';
import StudentDetailModal from '@/components/StudentDetailModal';
import { useLibrary } from '@/context/LibraryContext';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { Student, StudentStatus } from '@/types';

type SortField = 'name' | 'studentId' | 'rollNumber' | 'phone' | 'seatNumber' | 'monthlyFee' | 'paidAmount' | 'status';
type SortDir = 'asc' | 'desc';

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { students, deleteStudent, showToast } = useLibrary();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [seatFilter, setSeatFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, seatFilter]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesSeat =
      seatFilter === 'All' ||
      (seatFilter === 'Assigned' && s.seatNumber !== null) ||
      (seatFilter === 'Unassigned' && s.seatNumber === null);
    return matchesSearch && matchesStatus && matchesSeat;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal: string | number = a[sortField] as string | number;
    let bVal: string | number = b[sortField] as string | number;
    if (aVal === null) aVal = -1;
    if (bVal === null) bVal = -1;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteStudent(deleteTarget.id);
    showToast(`${deleteTarget.name} has been removed`, 'success');
    setDeleteTarget(null);
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-sky-400" />
      : <ArrowDown className="h-3.5 w-3.5 text-sky-400" />;
  };

  const tableHeaders: { label: string; field: SortField }[] = [
    { label: 'Name', field: 'name' },
    { label: 'Student ID', field: 'studentId' },
    { label: 'Roll No', field: 'rollNumber' },
    { label: 'Phone', field: 'phone' },
    { label: 'Seat', field: 'seatNumber' },
    { label: 'Monthly Fee', field: 'monthlyFee' },
    { label: 'Paid', field: 'paidAmount' },
    { label: 'Pending', field: 'status' },
    { label: 'Status', field: 'status' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Student Management"
        description="View, search, and manage all registered students."
        actions={
          <button
            onClick={() => navigate('/registration')}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-600 hover:to-cyan-600"
          >
            <UserPlus className="h-4 w-4" />
            New Student
          </button>
        }
      />

      <div className="mb-4">
        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, student ID, roll number or phone..."
          filters={[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'All', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Left', label: 'Left' },
              ],
            },
            {
              label: 'Seat',
              value: seatFilter,
              onChange: setSeatFilter,
              options: [
                { value: 'All', label: 'All Seats' },
                { value: 'Assigned', label: 'Assigned' },
                { value: 'Unassigned', label: 'Unassigned' },
              ],
            },
          ]}
        />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No students found"
          message="No students match your search or filters. Try adjusting your criteria or register a new student."
          icon={Users}
          action={
            <button
              onClick={() => navigate('/registration')}
              className="flex items-center gap-2 rounded-lg bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/30"
            >
              <UserPlus className="h-4 w-4" />
              Register New Student
            </button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-400">
                    {tableHeaders.map((h) => (
                      <th key={h.label} className="px-4 py-3">
                        <button
                          onClick={() => toggleSort(h.field)}
                          className="flex items-center gap-1.5 hover:text-slate-200"
                        >
                          {h.label}
                          <SortIcon field={h.field} />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((s) => {
                    const pending = s.monthlyFee - s.paidAmount;
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-white/5 transition hover:bg-white/5"
                      >
                        <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                        <td className="px-4 py-3 text-slate-400">{s.studentId}</td>
                        <td className="px-4 py-3 text-slate-400">{s.rollNumber}</td>
                        <td className="px-4 py-3 text-slate-400">{s.phone}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {s.seatNumber ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{formatCurrency(s.monthlyFee)}</td>
                        <td className="px-4 py-3 text-emerald-300">{formatCurrency(s.paidAmount)}</td>
                        <td className="px-4 py-3 text-amber-300">{formatCurrency(Math.max(pending, 0))}</td>
                        <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setDetailStudent(s)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-sky-500/15 hover:text-sky-300"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditStudent(s)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-amber-500/15 hover:text-amber-300"
                              title="Edit Student"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(s)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300"
                              title="Delete Student"
                            >
                              <Trash2 className="h-4 w-4" />
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
            {pageData.map((s) => {
              const pending = s.monthlyFee - s.paidAmount;
              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.studentId} · {s.rollNumber}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Phone:</span>{' '}
                      <span className="text-slate-300">{s.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Seat:</span>{' '}
                      <span className="text-slate-300">{s.seatNumber ?? '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Monthly:</span>{' '}
                      <span className="text-slate-300">{formatCurrency(s.monthlyFee)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Paid:</span>{' '}
                      <span className="text-emerald-300">{formatCurrency(s.paidAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Pending:</span>{' '}
                      <span className="text-amber-300">{formatCurrency(Math.max(pending, 0))}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setDetailStudent(s)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-slate-300 transition hover:bg-white/5"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      onClick={() => setEditStudent(s)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-slate-300 transition hover:bg-white/5"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="ml-2">
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <StudentDetailModal
        student={detailStudent}
        onClose={() => setDetailStudent(null)}
      />
      <StudentFormModal
        student={editStudent}
        onClose={() => setEditStudent(null)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Student"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This will also release their assigned seat. This action cannot be undone in the demo session.`}
        confirmLabel="Delete Student"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
