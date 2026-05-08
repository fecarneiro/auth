export interface password {
  userId: string
  passwordHash: string
}

export interface passwordRepositoryPort {
  save(credential: password): Promise<void>
  findByUserId(userId: string): Promise<password | null>
}
