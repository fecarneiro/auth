export interface PasswordCredential {
  userId: string;
  passwordHash: string;
}

export interface PasswordCredentialRepositoryPort {
  findByUserId(userId: string): Promise<PasswordCredential | null>;
  save(credential: PasswordCredential): Promise<void>;
}
