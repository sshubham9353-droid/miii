export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function generateStudentId(existing: string[]): string {
  const count = existing.length + 1;
  return `LIB-2024-${String(count).padStart(3, '0')}`;
}

export function generateRollNumber(existing: string[]): string {
  const count = existing.length + 1;
  return `R${String(count).padStart(3, '0')}`;
}
