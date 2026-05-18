import type { Account } from '../../../domain/account/account.entity.js'

export interface AccountRepositoryPort {
  findByEmail(email: string): Promise<Account | null>
  findById(id: string): Promise<Account | null>
}
