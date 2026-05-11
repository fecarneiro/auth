import type { HasherPort } from '../../ports/hasher.port.js'
import type { PasswordRepositoryPort } from '../../ports/password.repository.port.js'
import type {
  SessionData,
  SessionStorePort,
} from '../../ports/session-store.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import { InvalidCredentialsError } from './login-use-case.errors.js'

export interface LoginInput {
  email: string
  password: string
}

export interface LoginOutput {
  user: {
    id: string
    email: string
    name: string
  }
  sessionId: string
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: Pick<UserRepositoryPort, 'findByEmail'>,
    private readonly passwordRepository: Pick<
      PasswordRepositoryPort,
      'findByUserId'
    >,
    private readonly hash: Pick<HasherPort, 'compare'>,
    private readonly sessionStore: Pick<SessionStorePort, 'set'>,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
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

    const sessionData: SessionData = {
      userId: user.id,
    }

    const newSessionId = await this.sessionStore.set(sessionData)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      sessionId: newSessionId,
    }
  }
}
