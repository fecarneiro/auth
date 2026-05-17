import { User } from '../../../domain/user.entity.js'
import type { PasswordHasherPort } from '../../ports/password/password-hasher.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import type { UserRepositoryPort } from '../../ports/user/user.repository.port.js'
import type { UserRegistrationRepositoryPort } from '../../ports/user/user-registration.repository.port.js'
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
    private readonly userRepository: Pick<UserRepositoryPort, 'findByEmail'>,
    private readonly hash: Pick<PasswordHasherPort, 'hash'>,
    private readonly userRegistrationRepository: Pick<
      UserRegistrationRepositoryPort,
      'createWithPassword'
    >,
  ) {}

  async execute(
    input: RegisterWithPasswordUseCaseInput,
  ): Promise<RegisterWithPasswordUseCaseOutput> {
    const email = input.email.trim().toLowerCase()
    const existingUser = await this.userRepository.findByEmail(email)

    if (existingUser) throw new EmailAlreadyInUseError()

    const id = this.idGenerator.generate()

    const user = User.create({
      id,
      email: input.email,
      name: input.name,
    })

    const hashedPassword = await this.hash.hash(input.password)

    await this.userRegistrationRepository.createWithPassword({
      user,
      passwordCredential: {
        userId: user.id,
        passwordHash: hashedPassword,
      },
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }
  }
}
