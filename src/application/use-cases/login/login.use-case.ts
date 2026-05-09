import type { HashServicePort } from '../../ports/hash.service.port.js'
import type { PasswordRepositoryPort } from '../../ports/password.repository.port.js'
import type { SessionService } from '../../ports/session.repository.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import { InvalidCredentialsError } from './login.errors.js'

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
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordRepository: PasswordRepositoryPort,
    private readonly hashService: HashServicePort,
    private readonly sessionService: SessionService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const email = input.email.trim().toLowerCase()
    const user = await this.userRepository.findByEmail(email)

    if (!user) throw new InvalidCredentialsError()

    const password = await this.passwordRepository.findByUserId(user.id)

    if (!password) throw new InvalidCredentialsError()

    const passwordMatches = await this.hashService.compare(
      input.password,
      password.passwordHash,
    )

    if (!passwordMatches) throw new InvalidCredentialsError()

    await this.sessionService.set(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  }
}
