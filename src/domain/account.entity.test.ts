import { describe, expect, it } from 'vitest'
import { Account } from './account.entity.js'
import {
  AccountAlreadyHasPasswordError,
  AccountMustHaveAuthenticationMethodError,
  InvalidEmailError,
  InvalidNameError,
  OAuthProviderAlreadyLinkedError,
} from './account.errors.js'

describe('Account', () => {
  describe('registerWithPassword', () => {
    it('should create a password account with normalized name and email', () => {
      const account = Account.registerWithPassword({
        id: 'account-1',
        email: '  User@Example.COM ',
        name: '  Jane Doe  ',
        passwordHash: 'hashed',
        createdAt: new Date('2026-01-01'),
      })

      const snapshot = account.snapshot()

      expect(snapshot).toEqual({
        id: 'account-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        createdAt: new Date('2026-01-01'),
        passwordHash: 'hashed',
        oauthConnections: [],
      })
      expect(account.hasPassword()).toBe(true)
    })

    it('should reject an invalid email', () => {
      expect(() =>
        Account.registerWithPassword({
          id: 'account-1',
          email: 'not-an-email',
          name: 'Jane Doe',
          passwordHash: 'hashed',
          createdAt: new Date('2026-01-01'),
        }),
      ).toThrow(InvalidEmailError)
    })

    it('should reject a name shorter than 2 characters', () => {
      expect(() =>
        Account.registerWithPassword({
          id: 'account-1',
          email: 'user@example.com',
          name: ' A ',
          passwordHash: 'hashed',
          createdAt: new Date('2026-01-01'),
        }),
      ).toThrow(InvalidNameError)
    })
  })

  describe('registerWithOAuth', () => {
    it('should create an OAuth-only account without a password', () => {
      const account = Account.registerWithOAuth({
        id: 'account-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        oauthConnection: { provider: 'google', providerUserId: 'google-1' },
        createdAt: new Date('2026-01-01'),
      })

      expect(account.hasPassword()).toBe(false)
      expect(account.hasOAuthProvider('google')).toBe(true)
      expect(account.snapshot().oauthConnections).toEqual([
        { provider: 'google', providerUserId: 'google-1' },
      ])
    })
  })

  describe('restore', () => {
    it('should rebuild an account with only a password', () => {
      const account = Account.restore({
        id: 'account-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        createdAt: new Date('2026-01-01'),
        passwordHash: 'hashed',
        oauthConnections: [],
      })

      expect(account.hasPassword()).toBe(true)
    })

    it('should rebuild an account with only an OAuth connection', () => {
      const account = Account.restore({
        id: 'account-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        createdAt: new Date('2026-01-01'),
        passwordHash: null,
        oauthConnections: [{ provider: 'google', providerUserId: 'google-1' }],
      })

      expect(account.hasOAuthProvider('google')).toBe(true)
    })

    it('should reject an account without any authentication method', () => {
      expect(() =>
        Account.restore({
          id: 'account-1',
          email: 'user@example.com',
          name: 'Jane Doe',
          createdAt: new Date('2026-01-01'),
          passwordHash: null,
          oauthConnections: [],
        }),
      ).toThrow(AccountMustHaveAuthenticationMethodError)
    })
  })

  describe('addPassword', () => {
    it('should add a password to an OAuth-only account', () => {
      const account = Account.registerWithOAuth({
        id: 'account-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        oauthConnection: { provider: 'google', providerUserId: 'google-1' },
        createdAt: new Date('2026-01-01'),
      })

      account.addPassword('hashed')

      expect(account.hasPassword()).toBe(true)
    })

    it('should reject adding a password when one already exists', () => {
      const account = Account.registerWithPassword({
        id: 'account-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        passwordHash: 'hashed',
        createdAt: new Date('2026-01-01'),
      })

      expect(() => account.addPassword('another')).toThrow(
        AccountAlreadyHasPasswordError,
      )
    })
  })

  describe('linkOAuth', () => {
    it('should link a new OAuth provider', () => {
      const account = Account.registerWithPassword({
        id: 'account-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        passwordHash: 'hashed',
        createdAt: new Date('2026-01-01'),
      })

      account.linkOAuth({ provider: 'github', providerUserId: 'github-1' })

      expect(account.hasOAuthProvider('github')).toBe(true)
    })

    it('should reject linking a provider that is already linked', () => {
      const account = Account.registerWithOAuth({
        id: 'account-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        oauthConnection: { provider: 'google', providerUserId: 'google-1' },
        createdAt: new Date('2026-01-01'),
      })

      expect(() =>
        account.linkOAuth({ provider: 'google', providerUserId: 'google-2' }),
      ).toThrow(OAuthProviderAlreadyLinkedError)
    })
  })

  describe('snapshot', () => {
    it('should detach the OAuth connections from the entity state', () => {
      const account = Account.registerWithOAuth({
        id: 'account-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        oauthConnection: { provider: 'google', providerUserId: 'google-1' },
        createdAt: new Date('2026-01-01'),
      })

      const snapshot = account.snapshot()
      account.linkOAuth({ provider: 'github', providerUserId: 'github-1' })

      expect(snapshot.oauthConnections).toHaveLength(1)
    })
  })
})
