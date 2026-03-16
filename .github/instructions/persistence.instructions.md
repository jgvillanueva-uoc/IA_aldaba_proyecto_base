---
description: Instructions for Prisma and persistence adapters.
applyTo: "src/infrastructure/persistence/**/*.ts"
---

## Context
These files implement persistence concerns and database access through Prisma and repository adapters.

## Rules
- Keep persistence logic inside the infrastructure layer.
- Use Prisma through the existing repository and service abstractions.
- Keep mappings between database entities and application contracts explicit and readable.
- Preserve separation between persistence details and business logic.
- Prefer readable query construction over overly compact database code.

## Avoid
- Leaking Prisma-specific details into controllers.
- Mixing HTTP or transport concerns with persistence code.
- Returning raw persistence models when the application expects mapped contracts.
