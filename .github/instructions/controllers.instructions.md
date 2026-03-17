---
description: Instructions for NestJS controllers in this project.
applyTo: 'src/**/*.controller.ts'
---

## Context

These files define HTTP routes and request/response handling for the API.

## Rules

- Keep controllers thin and delegate business logic to services.
- Use DTOs for input validation and transformation.
- Add explicit parameter and return types to public methods.
- Keep route definitions consistent with the existing REST API design.
- Ensure controller behavior stays aligned with Swagger/OpenAPI documentation.

## Avoid

- Accessing the database directly from controllers.
- Embedding complex business rules in route handlers.
- Leaving temporary or debug-only endpoints in the public API.
