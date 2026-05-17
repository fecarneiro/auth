import type { OAuthClientPort } from '../../ports/oauth-client.port.js'

export interface StartOAuthLoginUseCaseInput {
  scopes: string[]
}

export interface StartOAuthLoginUseCaseOutput {
  authorizationUrl: URL
  state: string
  codeVerifier: string
}

export class StartOAuthLoginUseCase {
  constructor(private readonly oauthClient: OAuthClientPort) {}

  execute(input: StartOAuthLoginUseCaseInput): StartOAuthLoginUseCaseOutput {
    const state = this.oauthClient.generateState()
    const codeVerifier = this.oauthClient.generateCodeVerifier()

    const authorizationUrl = this.oauthClient.createAuthorizationURL({
      state,
      codeVerifier,
      scopes: input.scopes,
    })

    return {
      authorizationUrl,
      state,
      codeVerifier,
    }
  }
}
