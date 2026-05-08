export interface Password {
  userId: string
  passwordHash: string
}

export interface PasswordRepositoryPort {
  save(credential: Password): Promise<void>
  findByUserId(userId: string): Promise<Password | null>
}
