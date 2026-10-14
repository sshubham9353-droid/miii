export type StudentStatus = 'Active' | 'Inactive' | 'Left';

export type SeatStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';

export type FeeStatus = 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue';

export type BackgroundMode = 'modern-grey' | 'galaxy' | 'random-color';
export type AccentPalette = 'lagoon' | 'citrus' | 'berry' | 'terracotta' | 'jade';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  rollNumber: string;
  phone: string;
  altPhone?: string;
  seatNumber: number | null;
  monthlyFee: number;
  paidAmount: number;
  registrationDate: string;
  joiningDate: string;
  feeDueDate: string;
  status: StudentStatus;
  notes?: string;
}

export interface Seat {
  id: string;
  seatNumber: number;
  status: SeatStatus;
  assignedStudentId: string | null;
  assignedStudentName: string | null;
  assignedStudentRoll: string | null;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  seatNumber: number | null;
  monthlyFee: number;
  amountPaid: number;
  outstandingBalance: number;
  dueDate: string;
  status: FeeStatus;
}

export interface Payment {
  id: string;
  transactionId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface LibrarySettings {
  libraryName: string;
  address: string;
  contactNumber: string;
  totalSeats: number;
  defaultMonthlyFee: number;
  currency: string;
  backgroundMode: BackgroundMode;
  accentPalette?: AccentPalette;
}
