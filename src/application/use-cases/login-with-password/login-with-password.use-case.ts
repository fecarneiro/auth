import type { PasswordCredentialRepositoryPort } from '../../ports/password/password-credential.repository.port.js'
import type { PasswordHasherPort } from '../../ports/password/password-hasher.port.js'
import type { SessionStorePort } from '../../ports/session/session-store.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import type { UserRepositoryPort } from '../../ports/user/user.repository.port.js'
import { InvalidCredentialsError } from './login-with-password.errors.js'

export interface LoginWithPasswordInput {
  email: string
  password: string
}

export interface LoginWithPasswordOutput {
  user: {
    id: string
    email: string
    name: string
  }
  sessionId: string
}

export class LoginWithPasswordUseCase {
  constructor(
    private readonly userRepository: Pick<UserRepositoryPort, 'findByEmail'>,
    private readonly passwordRepository: Pick<
      PasswordCredentialRepositoryPort,
      'findByUserId'
    >,
    private readonly hash: Pick<PasswordHasherPort, 'compare'>,
    private readonly sessionIdGenerator: IdGeneratorPort,
    private readonly sessionStore: Pick<SessionStorePort, 'create'>,
  ) {}

  async execute(
    input: LoginWithPasswordInput,
  ): Promise<LoginWithPasswordOutput> {
    const email = input.email.trim().toLowerCase()
    const user = await this.userRepository.findByEmail(email)

    if (!user) throw new InvalidCredentialsError()

    const password = await this.passwordRepository.findByUserId(user.id)

    if (!password) throw new InvalidCredentialsError()

    const passwordMatches = await this.hash.compare(
      input.password,
      password.passwordHash,
    )

    if (!passwordMatches) throw new InvalidCredentialsError()

    const sessionId = this.sessionIdGenerator.generate()

    await this.sessionStore.create({
      id: sessionId,
      userId: user.id,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      sessionId: sessionId,
    }
  }
}
