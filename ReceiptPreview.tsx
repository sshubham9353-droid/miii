import Modal from './Modal';
import { useLibrary } from '@/context/LibraryContext';
import { formatCurrency, formatDate } from '@/utils/helpers';
import type { Payment } from '@/types';
import { Printer, Library } from 'lucide-react';

export default function ReceiptPreview({
  payment,
  open,
  onClose,
}: {
  payment: Payment | null;
  open: boolean;
  onClose: () => void;
}) {
  const { settings } = useLibrary();
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal open={open} onClose={onClose} title="Payment Receipt" maxWidth="max-w-md">
      <div className="space-y-4">
        <div
          id="receipt-print"
          className="rounded-xl border border-white/10 bg-slate-950/80 p-6"
        >
          {/* Header */}
          <div className="flex flex-col items-center border-b border-white/10 pb-4 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500">
              <Library className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-white">{settings.libraryName}</h3>
            <p className="text-xs text-slate-400">{settings.address}</p>
            <p className="text-xs text-slate-400">{settings.contactNumber}</p>
          </div>

          {/* Receipt details */}
          <div className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500">Receipt</span>
              <span className="text-sm font-semibold text-sky-300">{payment.transactionId}</span>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Student Name" value={payment.studentName} />
              <Row label="Roll Number" value={payment.rollNumber} />
              <Row label="Payment Date" value={formatDate(payment.paymentDate)} />
              <Row label="Payment Method" value={payment.method} />
              {payment.referenceNumber && (
                <Row label="Reference Number" value={payment.referenceNumber} />
              )}
              {payment.notes && <Row label="Notes" value={payment.notes} />}
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm font-medium text-slate-300">Amount Paid</span>
            <span className="text-xl font-bold text-emerald-300">{formatCurrency(payment.amount)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/30"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
        </div>

        <p className="text-xs text-slate-500">
          This is a demo receipt. No real payment has been processed.
        </p>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-200">{value}</span>
    </div>
  );
}
