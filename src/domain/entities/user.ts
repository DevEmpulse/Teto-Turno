/**
 * User Entity - Domain Layer
 * Represents a user in the system (Client or Admin/Staff)
 */

export type UserRole = 'client' | 'admin' | 'staff' | 'owner';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string;
  readonly avatarUrl?: string;
  readonly businessId?: string; // For staff/admin, the business they belong to
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLoginAt?: Date;
  readonly emailVerifiedAt?: Date;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  businessId?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  status?: UserStatus;
}

// Value Object for full name display
export function getFullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

// Value Object for user initials
export function getInitials(user: Pick<User, 'firstName' | 'lastName'>): string {
  const first = user.firstName.charAt(0).toUpperCase();
  const last = user.lastName.charAt(0).toUpperCase();
  return `${first}${last}`;
}

// Domain logic: Check if user can manage business
export function canManageBusiness(user: User): boolean {
  return user.role === 'admin' || user.role === 'owner';
}

// Domain logic: Check if user can view appointments
export function canViewAppointments(user: User): boolean {
  return user.role !== 'client' || user.status === 'active';
}

