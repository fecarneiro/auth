import type { HashServicePort } from '../../ports/hash.service.port.js';
import type { PasswordCredentialRepositoryPort } from '../../ports/password-credential.repository.port.js';
import type { UserRepositoryPort } from '../../ports/user.repository.port.js';
import { InvalidCredentialsError } from './login.errors.js';

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
  private readonly userRepository: UserRepositoryPort;
  private readonly passwordCredentialRepository: PasswordCredentialRepositoryPort;
  private readonly hashService: HashServicePort;
  constructor(
    userRepository: UserRepositoryPort,
    passwordCredentialRepository: PasswordCredentialRepositoryPort,
    hashService: HashServicePort,
  ) {
    this.userRepository = userRepository;
    this.passwordCredentialRepository = passwordCredentialRepository;
    this.hashService = hashService;
  }

  async execute(input: LoginInput): Promise<LoginOutput> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new InvalidCredentialsError();

    const passwordCredential = await this.passwordCredentialRepository.findByUserId(user.id);

    if (!passwordCredential) throw new InvalidCredentialsError();

    const passwordMatches = await this.hashService.compare(
      input.password,
      passwordCredential.passwordHash,
    );

    if (!passwordMatches) throw new InvalidCredentialsError();

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
