/**
 * Staff Entity - Domain Layer
 * Represents an employee/professional of the business
 */

export type StaffStatus = 'active' | 'inactive' | 'on_leave';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Saturday = 6

export interface TimeSlot {
  readonly startTime: string; // Format: "HH:mm" (24h)
  readonly endTime: string;   // Format: "HH:mm" (24h)
}

export interface WorkingHours {
  readonly dayOfWeek: DayOfWeek;
  readonly isWorking: boolean;
  readonly slots: TimeSlot[]; // Can have multiple slots (e.g., morning and afternoon)
}

export interface Staff {
  readonly id: string;
  readonly userId: string;
  readonly businessId: string;
  readonly title?: string; // e.g., "Senior Barber"
  readonly bio?: string;
  readonly status: StaffStatus;
  readonly workingHours: WorkingHours[];
  readonly serviceIds: string[]; // Services this staff can perform
  readonly breakDurationMinutes: number; // Time between appointments
  readonly maxDailyAppointments?: number;
  readonly color: string; // For calendar display
  readonly sortOrder: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateStaffInput {
  userId: string;
  businessId: string;
  title?: string;
  bio?: string;
  workingHours?: WorkingHours[];
  serviceIds?: string[];
  breakDurationMinutes?: number;
  color?: string;
}

export interface UpdateStaffInput {
  title?: string;
  bio?: string;
  status?: StaffStatus;
  workingHours?: WorkingHours[];
  serviceIds?: string[];
  breakDurationMinutes?: number;
  maxDailyAppointments?: number;
  color?: string;
  sortOrder?: number;
}

// Default working hours (Monday to Friday, 9am-6pm)
export function getDefaultWorkingHours(): WorkingHours[] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    dayOfWeek: day as DayOfWeek,
    isWorking: day >= 1 && day <= 5, // Mon-Fri
    slots: day >= 1 && day <= 5 
      ? [{ startTime: '09:00', endTime: '18:00' }]
      : [],
  }));
}

// Domain logic: Check if staff is working on a specific day
export function isWorkingOnDay(staff: Staff, dayOfWeek: DayOfWeek): boolean {
  const schedule = staff.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
  return schedule?.isWorking ?? false;
}

// Domain logic: Get working slots for a specific day
export function getWorkingSlotsForDay(staff: Staff, dayOfWeek: DayOfWeek): TimeSlot[] {
  const schedule = staff.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
  if (!schedule?.isWorking) {
    return [];
  }
  return schedule.slots;
}

// Domain logic: Check if staff can perform a service
export function canPerformService(staff: Staff, serviceId: string): boolean {
  return staff.serviceIds.includes(serviceId);
}

// Domain logic: Check if staff is available for booking
export function isStaffAvailable(staff: Staff): boolean {
  return staff.status === 'active';
}

// Parse time string to minutes since midnight
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

// Format minutes since midnight to time string
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

