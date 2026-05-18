# Auth - Hexagonal Architecture

A Node.js and TypeScript authentication API built with Hexagonal Architecture principles.

Auth provides a clean foundation for account registration, password login, OAuth authentication, and session management while keeping business rules independent from frameworks, databases, ORMs, and external libraries.

## About

This project implements a backend authentication flow focused on clear separation between domain rules, application use cases, and infrastructure details.

The domain is centered around `Account`.

An account represents an application identity. Password credentials and OAuth connections are authentication methods linked to that account, not separate user identities.

Technical details such as HTTP routing, database access, password hashing, OAuth providers, and session storage are connected through adapters instead of being embedded in the application core.

## Features

| Feature | Description |
| --- | --- |
| Account registration with password | Creates an account and stores a password credential securely. |
| Account login with password | Validates account credentials and creates a session. |
| Continue with Google | Single OAuth entry point: logs in a known identity, registers it on first contact. |
| OAuth account linking | Connects an OAuth provider to the account the caller is authenticated as. |
| Session management | Issues and invalidates server-side sessions. |
| Password hashing | Stores password hashes instead of plain text passwords. |
| Persistent authentication methods | Stores password credentials and OAuth connections separately from account data. |
| Centralized error handling | Maps domain and application errors to HTTP responses. |
| Hexagonal boundaries | Keeps domain and application code independent from infrastructure details. |

## Tech Stack

| Tool | Purpose |
| --- | --- |
| Node.js | JavaScript runtime |
| TypeScript | Static typing |
| Express | HTTP server and routing |
| PostgreSQL | Relational database |
| Drizzle ORM | Database schema and persistence |
| Redis | Session storage |
| bcrypt | Password hashing |
| Arctic | OAuth / OpenID Connect client |
| Vitest | Unit testing |
| Biome | Formatting and linting |
| pnpm | Package management |

## Architecture

This project follows Hexagonal Architecture to keep the application core independent from external details.

The codebase is organized from the inside out:

```txt
Domain
  <- Application
      <- Infrastructure
          <- Frameworks / Drivers
```

### Domain

The domain contains the core authentication model.

```txt
Account
  ├── email
  ├── name
  ├── password credential?
  └── OAuth connections[]
```

Main domain rules:

* An account must have at least one authentication method.
* An account can have at most one password credential.
* An account cannot link the same OAuth provider twice.
* Account email is normalized and validated by a value object.
* Authentication methods are modeled separately from account identity.

### Application

Application use cases orchestrate workflows and depend on ports.

Examples:

* Register account with password
* Login with password
* Authenticate with OAuth (login or first-contact register)
* Link an OAuth provider to an account
* Logout
* Create session
* Persist account credentials

Use cases do not depend directly on Express, Drizzle, Redis, bcrypt, Arctic, or PostgreSQL.

### Infrastructure

Infrastructure contains adapters for external details:

* Express routes and controllers
* Drizzle repositories
* PostgreSQL schemas
* bcrypt password hashing
* Redis session store
* OAuth provider integration
* Runtime configuration
* Manual dependency composition

## Decisions

Some decisions in this project are intentionally simple to keep the architecture clear without adding abstractions too early.

| Decision                                                      | Reason                                                                                                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Account` is the aggregate root                               | Authentication revolves around one internal identity that may have multiple authentication methods.                                              |
| Password credentials are stored separately                    | A password is only one authentication method. Its absence should not affect the account identity model.                                          |
| OAuth connections are stored separately                       | OAuth provider identities are external login methods linked to an internal account.                                                              |
| OAuth identities are never linked implicitly                  | An OAuth identity is connected to an existing account only through an explicit, authenticated request. A matching verified provider email is not treated as proof of ownership of a pre-existing local account, which closes an account pre-hijacking vector. |
| A single "Continue with Google" entry point                   | At the OAuth callback there is no meaningful login/register distinction until the identity is looked up. One use case logs in known identities and registers them on first contact.                                          |
| An email collision rejects the OAuth sign-up                  | If a verified provider email already belongs to an account, the callback responds 409. The user signs in with the original method and links the provider explicitly.                                                          |
| No explicit inbound ports                                     | Use cases already expose clear application APIs through their `execute` methods. Adding inbound interfaces now would duplicate contracts.        |
| HTTP controllers are inbound adapters                         | Controllers translate Express requests into use case inputs and HTTP responses. Express remains outside the application core.                    |
| Manual composition is used as the composition root            | Dependencies are wired explicitly instead of using a DI container. The current dependency graph is small enough to keep object creation visible. |
| Sessions use an absolute TTL                                  | A session is valid for a fixed window from login (30 min) and is not refreshed on activity. Lifetime stays bounded and predictable, capping how long a stolen session is useful. Sliding expiration with an absolute cap is a documented future evolution. |

## Project Structure

```txt
src/
├── domain/
│   ├── account.entity.ts        # Account aggregate + OAuthProvider / OAuthConnection types
│   ├── account-email.vo.ts
│   └── account.errors.ts
├── application/
│   ├── ports/
│   │   ├── account/
│   │   ├── oauth/
│   │   ├── password/
│   │   ├── session/
│   │   └── shared/
│   └── use-cases/
│       ├── register-with-password/
│       ├── login-with-password/
│       ├── authenticate-with-oauth/
│       ├── link-oauth-provider/
│       ├── get-authenticated-account/
│       └── logout/
├── infrastructure/
│   ├── composition/
│   ├── config/
│   ├── crypto/
│   ├── database/
│   │   ├── repositories/
│   │   └── schemas/
│   ├── http/
│   │   ├── controllers/
│   │   ├── cookie/
│   │   ├── errors/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── oauth/
│   └── session/
```

| Path                             | Responsibility                                                             |
| -------------------------------- | -------------------------------------------------------------------------- |
| `src/domain`                     | Core entities, value objects, domain rules, and domain errors.             |
| `src/application/use-cases`      | Application workflows such as registration, login, OAuth, and logout.      |
| `src/application/ports`          | Contracts required by use cases to access external capabilities.           |
| `src/infrastructure/http`        | Express routes, controllers, middlewares, cookies, and HTTP error mapping. |
| `src/infrastructure/database`    | Drizzle database connection, schemas, and repository implementations.      |
| `src/infrastructure/session`     | Session storage adapters.                                                  |
| `src/infrastructure/crypto`      | Cryptography adapters, such as password hashing.                           |
| `src/infrastructure/oauth`       | OAuth provider adapters.                                                   |
| `src/infrastructure/composition` | Composition layer that wires use cases to concrete implementations.        |
| `src/infrastructure/config`      | Runtime configuration and environment variable loading.                    |

## Database Model

```txt
accounts
  id
  email
  name
  created_at

account_passwords
  account_id
  password_hash

account_oauth_connections
  id
  account_id
  provider
  provider_user_id
```

Important constraints:

* `accounts.email` is unique.
* `account_passwords.account_id` is the primary key.
* `(provider, provider_user_id)` is unique.
* `(account_id, provider)` is unique.
* Password and OAuth rows cascade when the account is deleted.

## API

| Method | Path                    | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| POST   | `/auth/register`        | Register an account with password    |
| POST   | `/auth/login`           | Login with email and password        |
| POST   | `/auth/logout`          | Logout the current session           |
| GET    | `/auth/me`              | Get the authenticated account        |
| GET    | `/auth/google`          | Continue with Google (login or register) |
| GET    | `/auth/google/link`     | Link Google to the authenticated account |
| GET    | `/auth/google/callback` | Handle Google OAuth callback         |
| GET    | `/health`               | Health check                         |

### OAuth flows

Both Google endpoints are browser redirect flows and depend on the user
completing Google's consent screen.

**Continue with Google (`GET /auth/google`)** — a single entry point:

* a known Google identity logs in;
* an unknown identity with a new email registers a new account;
* an unknown identity whose email already belongs to an account is rejected
  with `409` (identities are never linked implicitly).

**Link a provider (`GET /auth/google/link`)** — connects Google to an
existing account:

* the user must already be authenticated; a valid session is required, so
  sign in with the original method first, then start the link flow;
* the authenticated session identifies the target account, so the Google
  email does **not** need to match the account email;
* a Google identity already connected to another account is rejected with
  `409`.

## Getting Started

### Requirements

* Node.js >= 24
* pnpm >= 10
* PostgreSQL database
* Redis server

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values. Redis uses the default local connection (`redis://localhost:6379`); `REDIS_URL` is not wired yet.

```env
DATABASE_URL=postgresql://user:password@localhost:5432/auth

PORT=3000
NODE_ENV=development

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Database

Generate and apply database migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

For local development, you can also push the schema directly:

```bash
pnpm db:push
```

### Development

```bash
pnpm dev
```

The server starts at:

```txt
http://localhost:3000
```

### Tests

```bash
pnpm test
```

### Type Check

```bash
pnpm typecheck
```

### Lint and Format

```bash
pnpm check
pnpm check:fix
```

## Security

This project follows basic security practices for authentication workflows:

* Passwords are never stored in plain text.
* Password hashing is handled through a dedicated application port.
* Authentication errors avoid revealing whether the email or password is incorrect.
* OAuth sign-up requires a verified provider email; linking to an existing account requires an authenticated session, not email matching.
* The OAuth flow uses PKCE and a `state` parameter validated at the callback, protecting against CSRF and authorization-code interception.
* Sessions have an absolute server-side TTL; a session cannot be kept alive indefinitely by activity.
* Sessions are issued server-side and stored outside the domain model.
* Domain and application rules are kept independent from HTTP, database, OAuth provider SDKs, and cryptography details.
* Environment variables are used for runtime configuration.

## Current Limitations

The current implementation does not include:

* Email verification for password registration.
* Password reset flow.
* Refresh tokens.
* Session revocation (logout from all devices) and sliding expiration.
* Rate limiting.
* CSRF protection.
* Account deletion.
* Account unlinking for OAuth providers.
* Multiple OAuth providers fully implemented.
* Integration tests for HTTP and database adapters.
