import { User } from '../../../domain/user.entity.js'
import type { HashServicePort } from '../../ports/hash.service.port.js'
import type { IdGeneratorPort } from '../../ports/id-generator.port.js'
import type { RegisterWithPasswordRepositoryPort } from '../../ports/register-with-password.repository.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import { EmailAlreadyInUseError } from './register-with-password.errors.js'

export interface RegisterWithPasswordInput {
  email: string
  name: string
  password: string
}

export interface RegisterWithPasswordOutput {
  user: {
    id: string
    email: string
    name: string
    createdAt: Date
  }
}

export class RegisterWithPasswordUseCase {
  constructor(
    private readonly idGenerator: IdGeneratorPort,
    private readonly userRepository: UserRepositoryPort,
    private readonly hashService: HashServicePort,
    private readonly registerWithPasswordRepository: RegisterWithPasswordRepositoryPort,
  ) {}

  async execute(
    input: RegisterWithPasswordInput,
  ): Promise<RegisterWithPasswordOutput> {
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

    const credential = {
      user: user,
      passwordHash: hashedPassword,
    }

    await this.registerWithPasswordRepository.save(credential)

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
