export interface PasswordCredentialRepositoryPort {
  findByUserId(
    userId: string,
  ): Promise<{ userId: string; passwordHash: string } | null>;
}
