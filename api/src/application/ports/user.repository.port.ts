import type { User } from '../../domain/user.entity.js';

export interface UserRepositoryPort {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
