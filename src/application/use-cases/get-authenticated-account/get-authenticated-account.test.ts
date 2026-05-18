import { describe, expect, it, vi } from 'vitest'
import { Account } from '../../../domain/account.entity.js'
import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import { AuthenticatedAccountNotFoundError } from './get-authenticated-account.errors.js'
import {
  GetAuthenticatedAccountUseCase,
  type GetAuthenticatedAccountUseCaseInput,
} from './get-authenticated-account.use-case.js'

function makeSut() {
  const account = Account.restore({
    id: 'account-1',
    email: 'user@example.com',
    name: 'User Example',
    createdAt: new Date('2026-01-01'),
    passwordHash: 'hashed-password',
    oauthConnections: [],
  })

  const accountRepository: Pick<AccountRepositoryPort, 'findById'> = {
    findById: vi.fn(async () => account),
  }

  const sut = new GetAuthenticatedAccountUseCase(accountRepository)

  return { sut, account, accountRepository }
}

describe('GetAuthenticatedAccountUseCase', () => {
  it('should return the public account fields for a valid session', async () => {
    const { sut } = makeSut()

    const input: GetAuthenticatedAccountUseCaseInput = {
      accountId: 'account-1',
    }

    const output = await sut.execute(input)

    expect(output).toEqual({
      id: 'account-1',
      email: 'user@example.com',
      name: 'User Example',
    })
  })

  it('should fail when the session points to an account that no longer exists', async () => {
    const { sut, accountRepository } = makeSut()

    vi.mocked(accountRepository.findById).mockResolvedValueOnce(null)

    await expect(sut.execute({ accountId: 'missing' })).rejects.toThrow(
      AuthenticatedAccountNotFoundError,
    )
  })
})
