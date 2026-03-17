---
description: Instructions for DTOs and request validation contracts.
applyTo: 'src/**/*.dto.ts'
---

## Context

These files define transport contracts and validation rules for the API layer.

## Rules

- Use class-validator decorators for input validation.
- Keep DTOs focused on request and response contracts.
- Add explicit property types and keep naming aligned with API payloads.
- Ensure DTO changes remain consistent with controller behavior and Swagger/OpenAPI.
- Keep validation rules clear and aligned with actual service expectations.

## Avoid

- Embedding business logic inside DTO classes.
- Adding ambiguous optional fields without clear semantics.
- Defining validation rules that conflict with runtime behavior.
