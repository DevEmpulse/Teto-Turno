/**
 * Transaction Entity - Domain Layer
 * Represents a financial transaction in the system
 */

export type TransactionType = 
  | 'payment'      // Client payment for service
  | 'refund'       // Refund to client
  | 'deposit'      // Deposit for booking
  | 'adjustment'   // Manual adjustment
  | 'tip';         // Tip for staff

export type TransactionStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'transfer'
  | 'mercadopago'
  | 'other';

export interface Transaction {
  readonly id: string;
  readonly businessId: string;
  readonly appointmentId?: string;
  readonly clientId?: string;
  readonly staffId?: string;
  readonly type: TransactionType;
  readonly status: TransactionStatus;
  readonly amount: number; // In cents
  readonly currency: string;
  readonly paymentMethod: PaymentMethod;
  readonly description?: string;
  readonly reference?: string; // External payment reference
  readonly metadata?: Record<string, unknown>;
  readonly processedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateTransactionInput {
  businessId: string;
  appointmentId?: string;
  clientId?: string;
  staffId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  description?: string;
  reference?: string;
}

export interface RefundTransactionInput {
  transactionId: string;
  amount: number; // Amount to refund (can be partial)
  reason: string;
}

// Value Object: Format amount for display
export function formatTransactionAmount(
  transaction: Pick<Transaction, 'amount' | 'currency' | 'type'>
): string {
  const amount = transaction.amount / 100;
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: transaction.currency,
  }).format(amount);
  
  // Add sign based on type
  const isNegative = transaction.type === 'refund';
  return isNegative ? `-${formatted}` : formatted;
}

// Domain logic: Check if transaction can be refunded
export function canRefundTransaction(transaction: Transaction): boolean {
  return (
    transaction.type === 'payment' &&
    (transaction.status === 'completed' || transaction.status === 'partially_refunded')
  );
}

// Domain logic: Calculate remaining refundable amount
export function getRemainingRefundableAmount(
  originalTransaction: Transaction,
  refunds: Transaction[]
): number {
  if (!canRefundTransaction(originalTransaction)) {
    return 0;
  }
  
  const totalRefunded = refunds
    .filter((t) => t.type === 'refund' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return Math.max(0, originalTransaction.amount - totalRefunded);
}

// Value Object: Get transaction type display info
export function getTransactionTypeInfo(type: TransactionType): {
  label: string;
  icon: string;
  color: string;
} {
  const typeMap: Record<TransactionType, { label: string; icon: string; color: string }> = {
    payment: { label: 'Pago', icon: 'cash', color: 'text-green-600' },
    refund: { label: 'Reembolso', icon: 'refund', color: 'text-red-600' },
    deposit: { label: 'Depósito', icon: 'deposit', color: 'text-blue-600' },
    adjustment: { label: 'Ajuste', icon: 'adjust', color: 'text-yellow-600' },
    tip: { label: 'Propina', icon: 'star', color: 'text-purple-600' },
  };
  return typeMap[type];
}

// Value Object: Get status display info
export function getTransactionStatusInfo(status: TransactionStatus): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusMap: Record<TransactionStatus, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    completed: { label: 'Completado', color: 'text-green-600', bgColor: 'bg-green-100' },
    failed: { label: 'Fallido', color: 'text-red-600', bgColor: 'bg-red-100' },
    refunded: { label: 'Reembolsado', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    partially_refunded: { label: 'Reembolso Parcial', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  };
  return statusMap[status];
}

