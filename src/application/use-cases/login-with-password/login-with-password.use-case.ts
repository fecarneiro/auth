import { AccountEmail } from '../../../domain/account-email.vo.js'
import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type { PasswordHasherPort } from '../../ports/password/password-hasher.port.js'
import type { SessionStorePort } from '../../ports/session/session-store.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import { InvalidCredentialsError } from './login-with-password.errors.js'

export interface LoginWithPasswordInput {
  email: string
  password: string
}

export interface LoginWithPasswordOutput {
  account: {
    id: string
    email: string
    name: string
  }
  sessionId: string
}

export class LoginWithPasswordUseCase {
  constructor(
    private readonly accountRepository: Pick<
      AccountRepositoryPort,
      'findByEmail'
    >,
    private readonly hash: Pick<PasswordHasherPort, 'compare'>,
    private readonly sessionIdGenerator: IdGeneratorPort,
    private readonly sessionStore: Pick<SessionStorePort, 'create'>,
  ) {}

  async execute(
    input: LoginWithPasswordInput,
  ): Promise<LoginWithPasswordOutput> {
    const email = AccountEmail.normalize(input.email)
    const account = await this.accountRepository.findByEmail(email)

    if (!account) throw new InvalidCredentialsError()

    const snapshot = account.snapshot()

    if (snapshot.passwordHash === null) throw new InvalidCredentialsError()

    const passwordMatches = await this.hash.compare(
      input.password,
      snapshot.passwordHash,
    )

    if (!passwordMatches) throw new InvalidCredentialsError()

    const sessionId = this.sessionIdGenerator.generate()

    await this.sessionStore.create({
      id: sessionId,
      accountId: snapshot.id,
    })

    return {
      account: {
        id: snapshot.id,
        email: snapshot.email,
        name: snapshot.name,
      },
      sessionId: sessionId,
    }
  }
}
