import { describe, expect, it } from 'vitest'
import { InvalidEmailError } from './account.errors.js'
import { AccountEmail } from './account-email.vo.js'

describe('AccountEmail', () => {
  describe('normalize', () => {
    it('should trim surrounding whitespace and lowercase', () => {
      expect(AccountEmail.normalize('  User@Example.COM  ')).toBe(
        'user@example.com',
      )
    })
  })

  describe('create', () => {
    it('should create a value object with the normalized email', () => {
      const email = AccountEmail.create('  User@Example.COM ')

      expect(email.value).toBe('user@example.com')
    })

    it.each([
      'plainaddress',
      'missing-at-sign.com',
      'user@no-dot',
      'user @example.com',
      'user@exa mple.com',
      '',
    ])('should reject the invalid email %j', (raw) => {
      expect(() => AccountEmail.create(raw)).toThrow(InvalidEmailError)
    })
  })

  describe('restore', () => {
    it('should rebuild the value object without re-validating', () => {
      const email = AccountEmail.restore('already-stored-value')

      expect(email.value).toBe('already-stored-value')
    })
  })
})
