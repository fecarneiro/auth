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
| OAuth registration | Creates an account from a verified OAuth identity. |
| OAuth login | Logs in an account through an existing OAuth connection. |
| OAuth account linking | Links an OAuth provider to an existing account when the provider email is verified. |
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
* Register with OAuth
* Login with OAuth
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
| OAuth provider email must be verified before linking by email | Linking an OAuth identity to an existing account by email is only safe when the provider confirms ownership of that email.                       |
| Login with OAuth does not auto-register                       | Login and registration have different semantics. Login requires an existing OAuth connection.                                                    |
| OAuth registration links a verified email to an existing account | If the provider verifies the email and an account with that email already exists, registration links the OAuth identity to that account and signs in, instead of failing. Unverified or unknown emails create a new account. |
| No explicit inbound ports                                     | Use cases already expose clear application APIs through their `execute` methods. Adding inbound interfaces now would duplicate contracts.        |
| HTTP controllers are inbound adapters                         | Controllers translate Express requests into use case inputs and HTTP responses. Express remains outside the application core.                    |
| Manual composition is used as the composition root            | Dependencies are wired explicitly instead of using a DI container. The current dependency graph is small enough to keep object creation visible. |

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
│       ├── register-with-oauth/
│       ├── login-with-oauth/
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
| GET    | `/auth/google/register` | Start Google OAuth registration flow |
| GET    | `/auth/google/login`    | Start Google OAuth login flow        |
| GET    | `/auth/google/callback` | Handle Google OAuth callback         |
| GET    | `/health`               | Health check                         |

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
* OAuth registration/linking requires a verified provider email.
* Sessions are issued server-side and stored outside the domain model.
* Domain and application rules are kept independent from HTTP, database, OAuth provider SDKs, and cryptography details.
* Environment variables are used for runtime configuration.

## Current Limitations

The current implementation does not include:

* Email verification for password registration.
* Password reset flow.
* Refresh tokens.
* Rate limiting.
* CSRF protection.
* Account deletion.
* Account unlinking for OAuth providers.
* Multiple OAuth providers fully implemented.
* Integration tests for HTTP and database adapters.
