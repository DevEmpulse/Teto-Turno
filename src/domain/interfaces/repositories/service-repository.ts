/**
 * Service Repository Interface - Domain Layer
 * Defines the contract for service data operations
 */

import type {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceCategory,
  ServiceStatus,
} from '@/domain/entities/service';

export interface ServiceRepository {
  findById(id: string): Promise<Service | null>;
  findByBusinessId(businessId: string): Promise<Service[]>;
  findByBusinessIdAndStatus(businessId: string, status: ServiceStatus): Promise<Service[]>;
  findByCategory(businessId: string, category: ServiceCategory): Promise<Service[]>;
  create(input: CreateServiceInput): Promise<Service>;
  update(id: string, input: UpdateServiceInput): Promise<Service>;
  delete(id: string): Promise<void>;
  updateSortOrder(id: string, sortOrder: number): Promise<void>;
}

