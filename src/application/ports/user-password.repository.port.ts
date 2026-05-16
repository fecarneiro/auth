export interface UserPassword {
  userId: string
  passwordHash: string
}

export interface UserPasswordRepositoryPort {
  save(credential: UserPassword): Promise<void>
  findByUserId(userId: string): Promise<UserPassword | null>
}
