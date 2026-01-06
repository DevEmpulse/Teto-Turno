/**
 * Service Entity - Domain Layer
 * Represents a service offered by the business (e.g., Haircut, Beard Trim)
 */

export type ServiceStatus = 'active' | 'inactive' | 'archived';

export type ServiceCategory = 
  | 'haircut'
  | 'beard'
  | 'coloring'
  | 'treatment'
  | 'styling'
  | 'combo'
  | 'other';

export interface Service {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly category: ServiceCategory;
  readonly durationMinutes: number;
  readonly price: number; // Store in cents to avoid floating point issues
  readonly currency: string;
  readonly status: ServiceStatus;
  readonly imageUrl?: string;
  readonly sortOrder: number;
  readonly requiresDeposit: boolean;
  readonly depositAmount?: number; // In cents
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateServiceInput {
  businessId: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  currency?: string;
  imageUrl?: string;
  requiresDeposit?: boolean;
  depositAmount?: number;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  category?: ServiceCategory;
  durationMinutes?: number;
  price?: number;
  status?: ServiceStatus;
  imageUrl?: string;
  sortOrder?: number;
  requiresDeposit?: boolean;
  depositAmount?: number;
}

// Value Object: Format price for display
export function formatPrice(service: Pick<Service, 'price' | 'currency'>): string {
  const amount = service.price / 100;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: service.currency,
  }).format(amount);
}

// Value Object: Format duration for display
export function formatDuration(durationMinutes: number): string {
  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  }
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
}

// Domain logic: Check if service is available for booking
export function isServiceAvailable(service: Service): boolean {
  return service.status === 'active';
}

// Domain logic: Calculate deposit if required
export function getRequiredDeposit(service: Service): number {
  if (!service.requiresDeposit) {
    return 0;
  }
  return service.depositAmount ?? Math.round(service.price * 0.2); // Default 20%
}

