import type { OAuthProviderPort } from '../../ports/oauth-provider.port.js'

export interface CreateOAuthAuthorizationUrlInput {
  state: string
  codeVerifier: string
}

export class CreateOAuthAuthorizationUrl {
  constructor(private readonly oauthProviderPort: OAuthProviderPort) {}

  createAuthorizationUrl(input: CreateOAuthAuthorizationUrlInput): URL {
    const state = input.state
    const codeVerifier = input.codeVerifier

    const authorizationURL = this.oauthProviderPort.createAuthorizationURL({
      state,
      codeVerifier,
    })

    return authorizationURL
  }
}
