/**
 * Business Entity - Domain Layer
 * Represents a business/establishment in the system
 */

export type BusinessStatus = 'active' | 'inactive' | 'suspended' | 'pending_setup';

export type BusinessType = 
  | 'barbershop'
  | 'salon'
  | 'spa'
  | 'clinic'
  | 'studio'
  | 'other';

export interface BusinessHours {
  readonly dayOfWeek: number; // 0-6 (Sunday-Saturday)
  readonly isOpen: boolean;
  readonly openTime: string;  // "HH:mm"
  readonly closeTime: string; // "HH:mm"
}

export interface BusinessAddress {
  readonly street: string;
  readonly number: string;
  readonly apartment?: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

export interface BusinessSettings {
  readonly allowOnlineBooking: boolean;
  readonly requireConfirmation: boolean;
  readonly minAdvanceBookingHours: number;
  readonly maxAdvanceBookingDays: number;
  readonly cancellationPolicyHours: number;
  readonly sendReminders: boolean;
  readonly reminderHoursBefore: number;
  readonly defaultCurrency: string;
  readonly timezone: string;
}

export interface Business {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly slug: string; // URL-friendly identifier
  readonly type: BusinessType;
  readonly status: BusinessStatus;
  readonly description?: string;
  readonly logoUrl?: string;
  readonly coverImageUrl?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly website?: string;
  readonly address?: BusinessAddress;
  readonly businessHours: BusinessHours[];
  readonly settings: BusinessSettings;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateBusinessInput {
  ownerId: string;
  name: string;
  slug: string;
  type: BusinessType;
  description?: string;
  phone?: string;
  email?: string;
  address?: BusinessAddress;
}

export interface UpdateBusinessInput {
  name?: string;
  type?: BusinessType;
  status?: BusinessStatus;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: BusinessAddress;
  businessHours?: BusinessHours[];
  settings?: Partial<BusinessSettings>;
}

// Default business settings
export function getDefaultBusinessSettings(): BusinessSettings {
  return {
    allowOnlineBooking: true,
    requireConfirmation: false,
    minAdvanceBookingHours: 2,
    maxAdvanceBookingDays: 30,
    cancellationPolicyHours: 24,
    sendReminders: true,
    reminderHoursBefore: 24,
    defaultCurrency: 'ARS',
    timezone: 'America/Argentina/Buenos_Aires',
  };
}

// Default business hours (Monday-Saturday 9am-7pm)
export function getDefaultBusinessHours(): BusinessHours[] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    dayOfWeek: day,
    isOpen: day >= 1 && day <= 6, // Mon-Sat
    openTime: '09:00',
    closeTime: '19:00',
  }));
}

// Domain logic: Check if business is accepting bookings
export function isBusinessAcceptingBookings(business: Business): boolean {
  return (
    business.status === 'active' &&
    business.settings.allowOnlineBooking
  );
}

// Domain logic: Check if business is open on a specific day
export function isBusinessOpenOnDay(business: Business, dayOfWeek: number): boolean {
  const hours = business.businessHours.find((h) => h.dayOfWeek === dayOfWeek);
  return hours?.isOpen ?? false;
}

// Value Object: Format full address
export function formatBusinessAddress(address: BusinessAddress): string {
  const parts = [
    `${address.street} ${address.number}`,
    address.apartment,
    `${address.city}, ${address.state}`,
    address.postalCode,
  ].filter(Boolean);
  return parts.join(', ');
}

// Generate slug from business name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .trim();
}

