/**
 * Staff Repository Interface - Domain Layer
 * Defines the contract for staff data operations
 */

import type { Staff, CreateStaffInput, UpdateStaffInput, StaffStatus } from '@/domain/entities/staff';

export interface StaffRepository {
  findById(id: string): Promise<Staff | null>;
  findByUserId(userId: string): Promise<Staff | null>;
  findByBusinessId(businessId: string): Promise<Staff[]>;
  findByBusinessIdAndStatus(businessId: string, status: StaffStatus): Promise<Staff[]>;
  findByServiceId(businessId: string, serviceId: string): Promise<Staff[]>;
  create(input: CreateStaffInput): Promise<Staff>;
  update(id: string, input: UpdateStaffInput): Promise<Staff>;
  delete(id: string): Promise<void>;
  addServiceToStaff(staffId: string, serviceId: string): Promise<void>;
  removeServiceFromStaff(staffId: string, serviceId: string): Promise<void>;
}

