export interface PasswordCredential {
  userId: string
  passwordHash: string
}

export interface PasswordCredentialRepositoryPort {
  save(credential: PasswordCredential): Promise<void>
  findByUserId(userId: string): Promise<PasswordCredential | null>
}
