import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Student,
  Seat,
  Payment,
  BackgroundMode,
  AccentPalette,
  LibrarySettings,
  FeeRecord,
} from '@/types';
import {
  initialStudents,
  initialSeats,
  initialPayments,
  initialSettings,
  generateFeeRecords,
} from '@/data/mockData';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface LibraryContextValue {
  students: Student[];
  seats: Seat[];
  payments: Payment[];
  feeRecords: FeeRecord[];
  settings: LibrarySettings;
  toasts: Toast[];
  addStudent: (student: Student) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  assignSeat: (seatId: string, studentId: string) => void;
  releaseSeat: (seatId: string) => void;
  changeSeat: (fromSeatId: string, toSeatId: string) => void;
  addSeat: () => void;
  recordPayment: (
    studentId: string,
    amount: number,
    date: string,
    method: Payment['method'],
    referenceNumber?: string,
    notes?: string
  ) => void;
  updateSettings: (settings: Partial<LibrarySettings>) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

const BACKGROUND_MODE_STORAGE_KEY = 'digital-library:theme-mode';
const ACCENT_PALETTE_STORAGE_KEY = 'digital-library:accent-palette';

const paletteChoices: AccentPalette[] = ['lagoon', 'citrus', 'berry', 'terracotta', 'jade'];
function isBackgroundMode(value: string | null): value is BackgroundMode {
  return value === 'modern-grey' || value === 'galaxy' || value === 'random-color';
}
function isAccentPalette(value: string | null): value is AccentPalette {
  return paletteChoices.includes(value as AccentPalette);
}

function getInitialSettings(): LibrarySettings {
  if (typeof window === 'undefined') return initialSettings;

  try {
    const savedMode = window.localStorage.getItem(BACKGROUND_MODE_STORAGE_KEY);
    const oldMode = window.localStorage.getItem('digital-library:background-mode');
    const mode: BackgroundMode = isBackgroundMode(savedMode)
      ? savedMode
      : oldMode === 'mode2' ? 'galaxy'
      : oldMode === 'mode3' ? 'random-color'
      : 'modern-grey';
    const palette = window.localStorage.getItem(ACCENT_PALETTE_STORAGE_KEY);
    // Persist the migrated value so legacy video selections can never reappear.
    window.localStorage.setItem(BACKGROUND_MODE_STORAGE_KEY, mode);
    window.localStorage.removeItem('digital-library:background-mode');
    return {
      ...initialSettings,
      backgroundMode: mode,
      accentPalette: isAccentPalette(palette) ? palette : initialSettings.accentPalette,
    };
  } catch {
    // Keep the default mode if browser storage is unavailable.
  }

  return initialSettings;
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [settings, setSettings] = useState<LibrarySettings>(getInitialSettings);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const feeRecords = generateFeeRecords(students);

  const showToast = useCallback(
    (message: string, type: Toast['type'] = 'success') => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addStudent = useCallback((student: Student) => {
    setStudents((prev) => [...prev, student]);
  }, []);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setSeats((prev) =>
      prev.map((seat) =>
        seat.assignedStudentId === id
          ? {
              ...seat,
              status: 'Available',
              assignedStudentId: null,
              assignedStudentName: null,
              assignedStudentRoll: null,
            }
          : seat
      )
    );
  }, []);

  const assignSeat = useCallback(
    (seatId: string, studentId: string) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      setSeats((prev) =>
        prev.map((seat) => {
          if (seat.id === seatId && seat.status === 'Available') {
            return {
              ...seat,
              status: 'Occupied',
              assignedStudentId: student.id,
              assignedStudentName: student.name,
              assignedStudentRoll: student.rollNumber,
            };
          }
          // Release any previous seat this student had
          if (seat.assignedStudentId === studentId && seat.id !== seatId) {
            return {
              ...seat,
              status: 'Available',
              assignedStudentId: null,
              assignedStudentName: null,
              assignedStudentRoll: null,
            };
          }
          return seat;
        })
      );
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, seatNumber: seats.find((seat) => seat.id === seatId)?.seatNumber ?? null }
            : s
        )
      );
    },
    [students, seats]
  );

  const releaseSeat = useCallback((seatId: string) => {
    setSeats((prev) =>
      prev.map((seat) =>
        seat.id === seatId
          ? {
              ...seat,
              status: 'Available',
              assignedStudentId: null,
              assignedStudentName: null,
              assignedStudentRoll: null,
            }
          : seat
      )
    );
    const seat = seats.find((s) => s.id === seatId);
    if (seat?.assignedStudentId) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === seat.assignedStudentId
            ? { ...s, seatNumber: null }
            : s
        )
      );
    }
  }, [seats]);

  const changeSeat = useCallback(
    (fromSeatId: string, toSeatId: string) => {
      const fromSeat = seats.find((s) => s.id === fromSeatId);
      const toSeat = seats.find((s) => s.id === toSeatId);
      if (!fromSeat || !toSeat || toSeat.status !== 'Available') return;
      setSeats((prev) =>
        prev.map((seat) => {
          if (seat.id === fromSeatId) {
            return {
              ...seat,
              status: 'Available',
              assignedStudentId: null,
              assignedStudentName: null,
              assignedStudentRoll: null,
            };
          }
          if (seat.id === toSeatId) {
            return {
              ...seat,
              status: 'Occupied',
              assignedStudentId: fromSeat.assignedStudentId,
              assignedStudentName: fromSeat.assignedStudentName,
              assignedStudentRoll: fromSeat.assignedStudentRoll,
            };
          }
          return seat;
        })
      );
      if (fromSeat.assignedStudentId) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === fromSeat.assignedStudentId
              ? { ...s, seatNumber: toSeat.seatNumber }
              : s
          )
        );
      }
    },
    [seats]
  );

  const addSeat = useCallback(() => {
    setSeats((prev) => {
      const nextNum = prev.length + 1;
      return [
        ...prev,
        {
          id: `seat-${nextNum}`,
          seatNumber: nextNum,
          status: 'Available' as const,
          assignedStudentId: null,
          assignedStudentName: null,
          assignedStudentRoll: null,
        },
      ];
    });
    setSettings((prev) => ({ ...prev, totalSeats: prev.totalSeats + 1 }));
  }, []);

  const recordPayment = useCallback(
    (
      studentId: string,
      amount: number,
      date: string,
      method: Payment['method'],
      referenceNumber?: string,
      notes?: string
    ) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      const txnId = `TXN-2024-${String(payments.length + 1).padStart(3, '0')}`;
      const newPayment: Payment = {
        id: `p-${Date.now()}`,
        transactionId: txnId,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        paymentDate: date,
        amount,
        method,
        referenceNumber,
        notes,
      };
      setPayments((prev) => [...prev, newPayment]);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, paidAmount: s.paidAmount + amount }
            : s
        )
      );
    },
    [students, payments.length]
  );

  const updateSettings = useCallback((updates: Partial<LibrarySettings>) => {
    if (updates.backgroundMode || updates.accentPalette) {
      try {
        if (updates.backgroundMode) window.localStorage.setItem(BACKGROUND_MODE_STORAGE_KEY, updates.backgroundMode);
        if (updates.accentPalette) window.localStorage.setItem(ACCENT_PALETTE_STORAGE_KEY, updates.accentPalette);
      } catch {
        setSettings((prev) => ({ ...prev, ...updates }));
        showToast('Theme changed for this visit, but could not be saved in this browser.', 'error');
        return;
      }
    }

    setSettings((prev) => ({ ...prev, ...updates }));
  }, [showToast]);

  const value: LibraryContextValue = {
    students,
    seats,
    payments,
    feeRecords,
    settings,
    toasts,
    addStudent,
    updateStudent,
    deleteStudent,
    assignSeat,
    releaseSeat,
    changeSeat,
    addSeat,
    recordPayment,
    updateSettings,
    showToast,
    dismissToast,
  };

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
