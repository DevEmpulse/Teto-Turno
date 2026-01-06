/**
 * User Repository Interface - Domain Layer
 * Defines the contract for user data operations
 */

import type { User, CreateUserInput, UpdateUserInput, UserRole } from '@/domain/entities/user';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByBusinessId(businessId: string): Promise<User[]>;
  findByRole(role: UserRole): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
}

