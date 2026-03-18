# Architecture Documentation

## Architectural Style

This project follows a **Modular Monolith** pattern.

It is not a microservices system. All domains run in a single Node.js
process, but maintain strict logical separation.

---

## Motivation

Render's free tier allows a single free service per account.

Instead of: - Creating multiple accounts - Introducing premature
microservices - Increasing operational complexity

The decision was to host multiple bounded contexts within a single
deployable unit.

This keeps infrastructure simple while preserving clear domain
boundaries.

---

## High-Level Structure

    src/
      domains/
        portfolio/
        ai/
        ...
      libs/
      auth/
      config/

Each domain contains:

- Controllers
- Services
- Schemas
- DTOs
- Internal logic

Domains do not directly depend on each other. Shared functionality is
placed in `libs/`.

---

## Database Strategy

MongoDB Atlas is used with multiple logical databases:

- Auth database
- Portfolio database
- (Future databases per domain)

Database selection is dynamic at connection level.

This enforces logical separation at persistence layer without requiring
separate clusters.

---

## Authentication Model

- JWT Access Token
- JWT Refresh Token
- Role-based access control

Tokens are stateless and signed using a shared secret.

Expiration values are defined in seconds for determinism.

---

## Storage Layer

The storage system follows a provider pattern.

Interface-based abstraction:

- Local provider (filesystem)
- Cloudinary provider

New providers (e.g., S3) can be added without modifying business logic.

---

## AI Module Design

AI functionality is abstracted behind a provider interface.

Supported implementations:

- Mock (testing)
- OpenAI
- Ollama (local LLM)

The domain does not depend on any specific vendor.

This prevents vendor lock-in and enables future extension.

---

## Build & Runtime Separation

Build phase: - TypeScript compilation - Full dependency installation
(including dev)

Runtime phase: - Compiled JavaScript only - No TypeScript execution - No
development tooling

This reduces production footprint and risk surface.

---

## Trade-Off Analysis

### Benefits

- Low infrastructure cost
- Simplified deployment
- Clear domain separation
- Extensible architecture

### Limitations

- Single process scaling
- No independent domain deployment
- Shared runtime failure domain

For the current project scope, these trade-offs are acceptable.

---

## Evolution Path

If scaling requirements increase, possible transitions include:

1.  Extracting domains into independent services
2.  Introducing message-based communication
3.  Moving to container orchestration

The current modular structure facilitates that evolution.
