import { InvalidCredentialsError } from './auth.errors.js';
import type { HashServicePort } from './ports/hash.service.port.js';
import type { PasswordCredentialRepositoryPort } from './ports/password-credential.repository.port.js';
import type { UserRepositoryPort } from './ports/user.repository.port.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export class LoginUseCase {
  constructor(
    private userRepository: UserRepositoryPort,
    private passwordCredentialRepository: PasswordCredentialRepositoryPort,
    private hashService: HashServicePort,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) throw new InvalidCredentialsError();

    const credential = await this.passwordCredentialRepository.findByUserId(
      user.id,
    );

    if (!credential) throw new InvalidCredentialsError();

    const isPasswordValid = await this.hashService.compare(
      input.password,
      credential.passwordHash,
    );

    if (!isPasswordValid) throw new InvalidCredentialsError();

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
