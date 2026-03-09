# core-api

Central modular backend powering multiple independent applications
(portfolio, AI features, future projects) from a single deploy.

This project follows a **modular monolith architecture** built with
NestJS and MongoDB, designed to host multiple bounded domains while
operating under infrastructure constraints.

---

## Architecture Overview

### Why a Modular Monolith?

Render's free tier provides a single free service per account. Instead
of fragmenting infrastructure across multiple accounts or introducing
premature microservices, this backend consolidates multiple logical
applications into one runtime.

Each domain remains isolated at the application layer, with clear
boundaries and minimal cross-domain coupling.

See `docs/architecture.md` for detailed architectural decisions.

---

## Domains

### Portfolio

Handles public portfolio data:

- Projects
- Experience
- Skills
- About information

Uses its own MongoDB database.

---

### AI Module

Abstracted AI provider layer supporting:

- Mock provider (local testing)
- OpenAI provider
- Ollama (local LLM runtime)

Designed to be provider-agnostic and easily extensible.

---

### Future Domains

The architecture supports additional bounded contexts without structural
changes to the runtime.

---

## Infrastructure

- NestJS
- MongoDB Atlas (multi-database strategy)
- Mongoose
- JWT Authentication (access + refresh tokens)
- Pluggable Storage Providers:
  - local
  - cloudinary
- Environment validation via Joi
- Strict TypeScript configuration

---

## Deployment Strategy

Single Render service.

Build phase: - Install dependencies (including dev) - TypeScript
compilation

Runtime phase: - Compiled JavaScript only (`dist/`) - No TypeScript
execution in production

---

## Environment Configuration

Key variables:

PORT\
BASE_URL\
NODE_ENV

JWT_SECRET\
JWT_ACCESS_TOKEN_EXPIRES_IN (seconds)\
JWT_REFRESH_TOKEN_EXPIRES_IN (seconds)

MONGO_URI\
MONGO_DB_AUTH\
MONGO_DB_PORTFOLIO

STORAGE_PROVIDER

Example:

JWT_ACCESS_TOKEN_EXPIRES_IN=900\
JWT_REFRESH_TOKEN_EXPIRES_IN=604800

---

## Storage Providers

Supported providers:

- local (default) --- filesystem storage
- cloudinary --- remote asset management

To enable Cloudinary:

STORAGE_PROVIDER=cloudinary\
CLOUDINARY_CLOUD_NAME=your-cloud-name\
CLOUDINARY_API_KEY=your-api-key\
CLOUDINARY_API_SECRET=your-api-secret

---

## Getting Started

### 1. Clone the repository

git clone https://github.com/EstebanSD/core-api.git\
cd core-api

### 2. Install dependencies

npm install

### 3. Configure environment

cp .env.example .env.development

Edit credentials accordingly.

### 4. Run in development

npm run dev

---

## Security Considerations

- JWT-based authentication
- Role-based access
- Environment schema validation
- Storage provider abstraction
- Domain isolation within a single runtime

---

## License

[MIT](LICENSE)
