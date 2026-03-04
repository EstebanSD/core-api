# AI Module

## Overview

This project implements an AI module using Clean Architecture principles
within a NestJS application.\
The design focuses on separation of concerns, modularity, testability,
and infrastructure abstraction.

The module supports pluggable AI providers (e.g., Ollama, Mock) and
includes caching, metrics collection, and structured logging.

---

## Architectural Structure

The module follows a layered approach:

    src/ai
    ├── domain
    │   ├── ai-provider.interface.ts
    │   ├── ai-response.ts
    │   └── ai.tokens.ts
    ├── application
    │   └── use-cases
    ├── infrastructure
    │   ├── cache
    │   ├── metrics
    │   ├── providers
    │   └── ai-provider.factory.ts
    ├── ai.controller.ts
    ├── ai-metrics.controller.ts
    └── ai.module.ts

### Layers

- **Domain**
  - Defines core contracts and tokens.
  - No framework or infrastructure dependencies.
- **Application**
  - Contains use cases (business logic orchestration).
  - Depends only on domain abstractions.
- **Infrastructure**
  - Provider implementations (Ollama, Mock).
  - In-memory cache service (TTL-based).
  - Metrics service.
  - Factory responsible for provider instantiation.

---

## Key Design Decisions

### 1. Provider Abstraction

AI providers are resolved using a token (`AI_PROVIDER`) and a factory
pattern.\
This allows switching implementations via configuration without changing
use cases.

### 2. In-Memory TTL Cache

A dedicated `InMemoryAICacheService` was introduced to:

- Decouple caching from provider logic
- Allow reuse across providers
- Improve testability
- Keep the provider focused on AI orchestration

The cache: - Is in-memory - Uses TTL expiration - Does not implement LRU
or memory limits (intentionally minimal)

### 3. Metrics Isolation

`AIMetricsService` collects:

- Request counts
- Cache hits
- Errors
- Latency

Metrics are separated from provider logic to maintain single
responsibility.

### 4. Dependency Injection Strategy

- Infrastructure services are registered inside `AiModule`.
- `CustomLoggerService` is globally scoped.
- The provider is bound using a factory (`useFactory`) to avoid tight
  coupling.

---

## Configuration

Provider selection is controlled via configuration:

- `aiProvider` (e.g., "ollama", "mock")
- `aiModel`
- `aiApiKey`
- `ollamaBaseUrl`

---

## Testing Strategy

Unit tests target:

- Cache expiration behavior
- Use case logic with mocked providers
- Provider factory selection logic

The goal is to validate behavior at boundaries rather than
implementation details.

---

## Architectural Goals

- Maintain strict separation between layers
- Avoid unnecessary abstractions
- Keep infrastructure replaceable
- Optimize for clarity and testability
