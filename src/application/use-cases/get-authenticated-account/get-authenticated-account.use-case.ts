import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import { AuthenticatedAccountNotFoundError } from './get-authenticated-account.errors.js'

export interface GetAuthenticatedAccountUseCaseInput {
  accountId: string
}

export interface GetAuthenticatedAccountUseCaseOutput {
  id: string
  email: string
  name: string
}

export class GetAuthenticatedAccountUseCase {
  constructor(
    private readonly accountRepository: Pick<AccountRepositoryPort, 'findById'>,
  ) {}

  async execute(
    input: GetAuthenticatedAccountUseCaseInput,
  ): Promise<GetAuthenticatedAccountUseCaseOutput> {
    const account = await this.accountRepository.findById(input.accountId)

    if (!account) {
      throw new AuthenticatedAccountNotFoundError()
    }

    const snapshot = account.snapshot()

    return {
      id: snapshot.id,
      email: snapshot.email,
      name: snapshot.name,
    }
  }
}
