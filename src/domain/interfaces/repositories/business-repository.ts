/**
 * Business Repository Interface - Domain Layer
 * Defines the contract for business data operations
 */

import type {
  Business,
  CreateBusinessInput,
  UpdateBusinessInput,
  BusinessStatus,
} from '@/domain/entities/business';

export interface BusinessRepository {
  findById(id: string): Promise<Business | null>;
  findBySlug(slug: string): Promise<Business | null>;
  findByOwnerId(ownerId: string): Promise<Business[]>;
  findByStatus(status: BusinessStatus): Promise<Business[]>;
  create(input: CreateBusinessInput): Promise<Business>;
  update(id: string, input: UpdateBusinessInput): Promise<Business>;
  delete(id: string): Promise<void>;
  isSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
}

