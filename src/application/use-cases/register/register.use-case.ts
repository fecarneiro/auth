import { User } from '../../../domain/user.entity.js'
import type { HasherPort } from '../../ports/hasher.port.js'
import type { IdGeneratorPort } from '../../ports/id-generator.port.js'
import type { RegisterPort } from '../../ports/register.repository.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import { EmailAlreadyInUseError } from './register.errors.js'

export interface RegisterInput {
  email: string
  name: string
  password: string
}

export interface RegisterOutput {
  id: string
  email: string
  name: string
  createdAt: Date
}

export class RegisterUseCase {
  constructor(
    private readonly idGenerator: Pick<IdGeneratorPort, 'generate'>,
    private readonly userRepository: Pick<UserRepositoryPort, 'findByEmail'>,
    private readonly hash: Pick<HasherPort, 'hash'>,
    private readonly RegisterRepository: Pick<RegisterPort, 'save'>,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
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

    const userData = {
      user: user,
      passwordHash: hashedPassword,
    }

    await this.RegisterRepository.save(userData)

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }
  }
}
