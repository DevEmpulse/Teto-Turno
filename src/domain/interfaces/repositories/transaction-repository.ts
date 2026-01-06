/**
 * Transaction Repository Interface - Domain Layer
 * Defines the contract for transaction data operations
 */

import type {
  Transaction,
  CreateTransactionInput,
  TransactionType,
  TransactionStatus,
} from '@/domain/entities/transaction';

export interface TransactionFilters {
  businessId?: string;
  clientId?: string;
  staffId?: string;
  appointmentId?: string;
  type?: TransactionType | TransactionType[];
  status?: TransactionStatus | TransactionStatus[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface TransactionSummary {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  transactionCount: number;
  averageTransactionValue: number;
}

export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByFilters(filters: TransactionFilters): Promise<Transaction[]>;
  findByAppointmentId(appointmentId: string): Promise<Transaction[]>;
  findByBusinessIdAndDateRange(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]>;
  create(input: CreateTransactionInput): Promise<Transaction>;
  updateStatus(id: string, status: TransactionStatus): Promise<Transaction>;
  refund(transactionId: string, amount: number, reason: string): Promise<Transaction>;
  getSummary(businessId: string, startDate: Date, endDate: Date): Promise<TransactionSummary>;
  getDailyRevenue(businessId: string, date: Date): Promise<number>;
  getMonthlyRevenue(businessId: string, year: number, month: number): Promise<number>;
}

