import { Account } from '../../../domain/account/account.entity.js'
import { AccountEmail } from '../../../domain/account/account-email.vo.js'
import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type { AccountRegistrationRepositoryPort } from '../../ports/account/account-registration.repository.port.js'
import type { PasswordHasherPort } from '../../ports/password/password-hasher.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import { EmailAlreadyInUseError } from './register-with-password.errors.js'

export interface RegisterWithPasswordUseCaseInput {
  email: string
  name: string
  password: string
}

export interface RegisterWithPasswordUseCaseOutput {
  id: string
  email: string
  name: string
  createdAt: Date
}

export class RegisterWithPasswordUseCase {
  constructor(
    private readonly idGenerator: Pick<IdGeneratorPort, 'generate'>,
    private readonly accountRepository: Pick<
      AccountRepositoryPort,
      'findByEmail'
    >,
    private readonly hash: Pick<PasswordHasherPort, 'hash'>,
    private readonly accountRegistrationRepository: Pick<
      AccountRegistrationRepositoryPort,
      'createWithPassword'
    >,
  ) {}

  async execute(
    input: RegisterWithPasswordUseCaseInput,
  ): Promise<RegisterWithPasswordUseCaseOutput> {
    const email = AccountEmail.create(input.email)

    const existing = await this.accountRepository.findByEmail(email.value)
    if (existing) throw new EmailAlreadyInUseError()

    const id = this.idGenerator.generate()
    const passwordHash = await this.hash.hash(input.password)

    const account = Account.registerWithPassword({
      id,
      email: email.value,
      name: input.name,
      passwordHash,
      createdAt: new Date(),
    })

    const snapshot = account.snapshot()

    await this.accountRegistrationRepository.createWithPassword({
      account: snapshot,
    })

    return {
      id: snapshot.id,
      email: snapshot.email,
      name: snapshot.name,
      createdAt: snapshot.createdAt,
    }
  }
}
