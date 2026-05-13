import { User } from '../../../domain/user.entity.js'
import type { HasherPort } from '../../ports/hasher.port.js'
import type { IdGeneratorPort } from '../../ports/id-generator.port.js'
import type { RegisterPort } from '../../ports/register.repository.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import { EmailAlreadyInUseError } from './register.errors.js'

export interface RegisterWithPasswordInput {
  email: string
  name: string
  password: string
}
export class RegisterUseCase {
  constructor(
    private readonly idGenerator: IdGeneratorPort,
    private readonly userRepository: UserRepositoryPort,
    private readonly hash: HasherPort,
    private readonly RegisterRepository: RegisterPort,
  ) {}

  async execute(input: RegisterWithPasswordInput): Promise<User> {
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

    return user
  }
}
