# Auth - Hexagonal Architecture

A Node.js and TypeScript authentication API built with Hexagonal Architecture principles.

Auth provides a clean foundation for user registration and login while keeping business rules independent from frameworks, databases, ORMs, and external libraries.

## About

This project implements a backend authentication flow focused on clear separation between domain rules, application use cases, and infrastructure details.

The current scope includes user creation, credential persistence, password hashing, and login validation. Technical details such as HTTP routing, database access, and cryptography are connected through adapters instead of being embedded in the application core.

## Features

| Feature | Description |
| --- | --- |
| User registration | Creates users and stores password credentials securely. |
| User login | Validates user credentials and returns authenticated user data. |
| Password hashing | Stores password hashes instead of plain text passwords. |
| Persistent credentials | Separates user data from password credentials. |
| Centralized error handling | Maps application and domain errors to HTTP responses. |
| Hexagonal boundaries | Keeps domain and application code independent from infrastructure details. |

## Tech Stack

| Tool | Purpose |
| --- | --- |
| Node.js | JavaScript runtime |
| TypeScript | Static typing |
| Express | HTTP server and routing |
| PostgreSQL | Relational database |
| Drizzle ORM | Database schema and persistence |
| bcrypt | Password hashing |
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

## Decisions

Some decisions in this project are intentionally simple to keep the architecture clear without adding abstractions too early.

| Decision | Reason |
| --- | --- |
| No explicit inbound ports | Use cases already expose a clear application API through their `execute` methods. Adding inbound port interfaces now would duplicate contracts without a real need. |
| HTTP controllers are inbound adapters | Controllers translate Express requests into use case inputs and HTTP responses. Express remains outside the application core. |
| Password credentials are stored separately from users | A user represents an application identity. A password is only one authentication method. Keeping password credentials separate makes room for other methods such as OAuth without coupling them to the user entity. |
| Credential validation is separate from authentication issuing | Validating an email and password is not the same responsibility as issuing a session, token, or OAuth-based identity. These flows can evolve independently. |
| Manual composition is used as the composition root | Dependencies are wired explicitly in `src/composition` instead of being resolved by a DI container. The current dependency graph is small enough to keep object creation simple and visible. |

## Project Structure

```txt
src/
├── application/
│   ├── ports/
│   └── use-cases/
├── config/
├── domain/
├── composition/
├── infrastructure/
│   ├── auth/
│   ├── crypto/
│   ├── database/
│   └── http/
├── app.ts
└── server.ts
```

| Path | Responsibility |
| --- | --- |
| `src/domain` | Core entities, domain rules, and domain errors. |
| `src/application/use-cases` | Application workflows such as registration and login. |
| `src/application/ports` | Contracts required by use cases to access external capabilities. |
| `src/infrastructure/http` | Express routes, controllers, middlewares, and HTTP error mapping. |
| `src/infrastructure/database` | Drizzle database connection, schemas, and repository implementations. |
| `src/infrastructure/crypto` | Cryptography-related adapters, such as password hashing. |
| `src/composition` | Composition layer that wires use cases to concrete implementations. |
| `src/config` | Runtime configuration and environment variable loading. |
| `src/app.ts` | Express application setup. |
| `src/server.ts` | HTTP server startup. |

## Getting Started

### Requirements

- Node.js >= 24 < 25
- pnpm >= 10 < 11
- PostgreSQL database

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/auth
PORT=3000
NODE_ENV=development
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

The server will start at:

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

## Configuration

The application reads configuration from environment variables.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string used by Drizzle and the database client. |
| `PORT` | No | `3000` | HTTP server port. |
| `NODE_ENV` | No | `development` | Runtime environment. |

## API

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Validate credentials |
| GET | `/health` | Health check |

## Security

This project follows basic security practices for authentication workflows:

- Passwords are never stored in plain text.
- Password hashing is handled through a dedicated application port.
- Authentication errors avoid revealing whether the email or password is incorrect.
- Domain and application rules are kept independent from HTTP, database, and cryptography details.
- Environment variables are used for runtime configuration.

The current implementation does not include session management, JWT issuing, refresh tokens, rate limiting, password reset, or email verification.

## What's Next?

Planned improvements:
- Add unit of work(transaction) for user + password
- Add better validation to variables that always validate cases as string with happy paths
- Add session or token issuing after successful login.
- Add authenticated route protection.
- Add refresh token support.
- Add logout flow.
- Add password reset flow.
- Add email verification flow.
- Add OAuth authentication support.
- Add integration tests for HTTP and database adapters.
- Add Docker setup for local PostgreSQL development.
