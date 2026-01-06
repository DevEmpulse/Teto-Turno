/**
 * Domain Entities - Barrel Export
 */

// User
export * from './user';
export type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserRole,
  UserStatus,
} from './user';

// Service
export * from './service';
export type {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceStatus,
  ServiceCategory,
} from './service';

// Staff
export * from './staff';
export type {
  Staff,
  CreateStaffInput,
  UpdateStaffInput,
  StaffStatus,
  DayOfWeek,
  TimeSlot,
  WorkingHours,
} from './staff';

// Appointment
export * from './appointment';
export type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  CancelAppointmentInput,
  AppointmentStatus,
  CancellationReason,
} from './appointment';

// Transaction
export * from './transaction';
export type {
  Transaction,
  CreateTransactionInput,
  RefundTransactionInput,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from './transaction';

// Business
export * from './business';
export type {
  Business,
  CreateBusinessInput,
  UpdateBusinessInput,
  BusinessStatus,
  BusinessType,
  BusinessHours,
  BusinessAddress,
  BusinessSettings,
} from './business';

