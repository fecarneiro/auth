import { User } from '../../../domain/user.entity.js'
import type { HashServicePort } from '../../ports/hash.service.port.js'
import type { IdGeneratorPort } from '../../ports/id-generator.port.js'
import type { PasswordCredentialRepositoryPort } from '../../ports/password-credential.repository.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import { EmailAlreadyInUseError } from './register-user.errors.js'

export interface RegisterUserInput {
  email: string
  name: string
  password: string
}

export interface RegisterUserOutput {
  user: {
    id: string
    email: string
    name: string
    createdAt: Date
  }
}

export class RegisterUserUseCase {
  private readonly idGenerator: IdGeneratorPort
  private readonly userRepository: UserRepositoryPort
  private readonly hashService: HashServicePort
  private readonly passwordCredentialRepository: PasswordCredentialRepositoryPort

  constructor(
    idGenerator: IdGeneratorPort,
    userRepository: UserRepositoryPort,
    hashService: HashServicePort,
    passwordCredentialRepository: PasswordCredentialRepositoryPort,
  ) {
    this.idGenerator = idGenerator
    this.userRepository = userRepository
    this.hashService = hashService
    this.passwordCredentialRepository = passwordCredentialRepository
  }

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = input.email.trim().toLowerCase()
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) throw new EmailAlreadyInUseError()

    const id = this.idGenerator.generate()

    const user = User.create({
      id,
      email: input.email,
      name: input.name,
    })

    const hashedPassword = await this.hashService.hash(input.password)

    await this.userRepository.save(user)

    await this.passwordCredentialRepository.save({
      userId: id,
      passwordHash: hashedPassword,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    }
  }
}
