import { InvalidEmailError } from './account.errors.js'

export class AccountEmail {
  private constructor(readonly value: string) {}

  static normalize(raw: string): string {
    return raw.trim().toLowerCase()
  }

  static create(raw: string): AccountEmail {
    const normalized = AccountEmail.normalize(raw)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!regex.test(normalized)) throw new InvalidEmailError()

    return new AccountEmail(normalized)
  }

  static restore(value: string): AccountEmail {
    return new AccountEmail(value)
  }
}
