# Copilot Instructions

## Project Context

This repository is a NestJS backend written in TypeScript.
It uses Prisma for persistence, class-validator for DTO validation, and Swagger for OpenAPI documentation in non-production environments.
Favor maintainable, strongly typed, production-ready code that fits the existing modular architecture.

## General Coding Rules

- Follow clean code principles: use meaningful names, keep functions small, avoid code duplication, and ensure code is easy to read and maintain.
- Use strict TypeScript types and avoid `any` unless there is a clear, explicit justification.
- Prefer meaningful names, small functions, early returns, and simple control flow over deeply nested logic.
- Keep changes minimal and consistent with the existing code style and module boundaries.
- Remove unused imports, variables, and dead code.
- Add concise JSDoc or short comments only when they improve understanding of non-obvious logic.

## NestJS Conventions

- Keep controllers thin and move business logic into services.
- Use dependency injection following NestJS patterns.
- Add explicit parameter and return types to public methods.
- Use DTOs for request validation and transformation.
- Keep exception handling consistent with the existing project error model.

## API Conventions

- Keep routes consistent, predictable, and REST-oriented.
- Ensure Swagger/OpenAPI stays aligned with controllers, DTOs, and actual API behavior.
- Preserve the existing API error response shape.
- Do not leave temporary endpoints, debug routes, or obsolete contract surfaces in the application.

## Persistence Rules

- Use Prisma through the existing infrastructure and repository layer.
- Do not leak persistence details into controllers.
- Keep mappings between Prisma entities and application contracts explicit and easy to follow.

## Logging And Errors

- Prefer NestJS `Logger` over `console.log`.
- Do not swallow exceptions silently; unexpected failures should be traceable.
- When integrating with external services, keep enough context in logs to diagnose request failures without exposing secrets.

## Testing And Quality

- Generated code must comply with the project's linting and formatting rules.
- Respect the linting rules already defined in the project and ensure generated code fits the existing style.
- When behavior changes, add or update unit and e2e tests as appropriate.
- Favor code that passes `npm run verify` with minimal follow-up work.

## Security And Configuration

- Never hardcode secrets, API keys, or credentials in tracked files.
- Use environment variables for runtime configuration.
- Respect existing `.env`, `.env.example`, and `.gitignore` conventions.
