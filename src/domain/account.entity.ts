import {
  AccountAlreadyHasPasswordError,
  AccountMustHaveAuthenticationMethodError,
  InvalidNameError,
  OAuthProviderAlreadyLinkedError,
} from './account.errors.js'
import { AccountEmail } from './account-email.vo.js'

export const oauthProviders = ['google', 'github'] as const
export type OAuthProvider = (typeof oauthProviders)[number]

export type OAuthConnection = {
  provider: OAuthProvider
  providerUserId: string
}

type RegisterWithPasswordProps = {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: Date
}

type RegisterWithOAuthProps = {
  id: string
  email: string
  name: string
  oauthConnection: OAuthConnection
  createdAt: Date
}

type RestoreAccountProps = {
  id: string
  email: string
  name: string
  createdAt: Date
  passwordHash: string | null
  oauthConnections: OAuthConnection[]
}

export type AccountSnapshot = {
  id: string
  email: string
  name: string
  createdAt: Date
  passwordHash: string | null
  oauthConnections: ReadonlyArray<OAuthConnection>
}

export class Account {
  private constructor(
    readonly id: string,
    readonly email: AccountEmail,
    readonly name: string,
    readonly createdAt: Date,
    private passwordHash: string | null,
    private oauthConnections: OAuthConnection[],
  ) {}

  static registerWithPassword(props: RegisterWithPasswordProps): Account {
    return new Account(
      props.id,
      AccountEmail.create(props.email),
      normalizeAccountName(props.name),
      props.createdAt,
      props.passwordHash,
      [],
    )
  }

  static registerWithOAuth(props: RegisterWithOAuthProps): Account {
    return new Account(
      props.id,
      AccountEmail.create(props.email),
      normalizeAccountName(props.name),
      props.createdAt,
      null,
      [props.oauthConnection],
    )
  }

  static restore(props: RestoreAccountProps): Account {
    if (!props.passwordHash && props.oauthConnections.length === 0) {
      throw new AccountMustHaveAuthenticationMethodError()
    }

    return new Account(
      props.id,
      AccountEmail.restore(props.email),
      props.name,
      props.createdAt,
      props.passwordHash,
      props.oauthConnections,
    )
  }

  hasPassword(): boolean {
    return this.passwordHash !== null
  }

  hasOAuthProvider(provider: OAuthProvider): boolean {
    return this.oauthConnections.some((conn) => conn.provider === provider)
  }

  addPassword(passwordHash: string): void {
    if (this.passwordHash) {
      throw new AccountAlreadyHasPasswordError()
    }

    this.passwordHash = passwordHash
  }

  linkOAuth(oauthConnection: OAuthConnection): void {
    if (this.hasOAuthProvider(oauthConnection.provider)) {
      throw new OAuthProviderAlreadyLinkedError()
    }

    this.oauthConnections.push(oauthConnection)
  }

  snapshot(): AccountSnapshot {
    return {
      id: this.id,
      email: this.email.value,
      name: this.name,
      createdAt: this.createdAt,
      passwordHash: this.passwordHash,
      oauthConnections: this.oauthConnections.map((conn) => ({ ...conn })),
    }
  }
}

function normalizeAccountName(raw: string): string {
  const name = raw.trim()

  if (name.length < 2) {
    throw new InvalidNameError()
  }

  return name
}
