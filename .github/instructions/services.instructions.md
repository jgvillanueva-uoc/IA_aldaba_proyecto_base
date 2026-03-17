---
description: Instructions for application services and business logic.
applyTo: 'src/**/*.service.ts'
---

## Context

These files contain business logic, orchestration, and coordination between modules and adapters.

## Rules

- Keep business logic in services, not in controllers.
- Prefer small, focused methods with a single responsibility.
- Use dependency injection consistently following NestJS patterns.
- Add explicit parameter and return types to public methods.
- Throw consistent framework or domain exceptions when operations fail.

## Avoid

- Mixing transport-layer concerns with business logic.
- Using `any` when a specific type or interface can be defined.
- Creating large methods with multiple unrelated responsibilities.
