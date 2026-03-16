---
description: Coding instructions for this project: enforce clean code, strict typing, and linting compliance in all code generation, review, and answers.
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

## Coding Guidelines

- Always follow clean code principles: use meaningful names, keep functions small, avoid code duplication, and ensure code is easy to read and maintain.
- Enforce strict typing in all TypeScript code. Avoid use of `any`, prefer explicit interfaces and types, and leverage TypeScript's type system for safety.
- All code must comply with the project's linting rules. Run lint checks before considering code complete, and fix all linting errors and warnings.
- Prefer early returns, avoid deeply nested logic, and use dependency injection as per NestJS best practices.
- Document public methods and complex logic with concise comments or JSDoc when appropriate.
- Remove unused code, variables, and imports.
- Ensure all DTOs, services, and controllers use explicit types for parameters and return values.
- Validate that all code changes are consistent with the architectural and implementation plans.