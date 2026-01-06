/**
 * Appointment Repository Interface - Domain Layer
 * Defines the contract for appointment data operations
 */

import type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentStatus,
} from '@/domain/entities/appointment';

export interface AppointmentFilters {
  businessId?: string;
  clientId?: string;
  staffId?: string;
  serviceId?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByFilters(filters: AppointmentFilters): Promise<Appointment[]>;
  findByClientId(clientId: string): Promise<Appointment[]>;
  findByStaffId(staffId: string): Promise<Appointment[]>;
  findByBusinessIdAndDate(businessId: string, date: Date): Promise<Appointment[]>;
  findByStaffIdAndDateRange(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]>;
  findUpcoming(businessId: string, limit?: number): Promise<Appointment[]>;
  create(input: CreateAppointmentInput): Promise<Appointment>;
  update(id: string, input: UpdateAppointmentInput): Promise<Appointment>;
  cancel(id: string, reason: string, cancelledBy: string): Promise<Appointment>;
  confirm(id: string): Promise<Appointment>;
  complete(id: string): Promise<Appointment>;
  markNoShow(id: string): Promise<Appointment>;
  countByBusinessIdAndDateRange(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number>;
}

