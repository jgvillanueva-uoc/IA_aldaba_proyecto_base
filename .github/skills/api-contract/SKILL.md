---
name: api-contract
description: "Use when: adding an endpoint, removing a route, changing a DTO, fixing a contract, updating Swagger/OpenAPI, making unit or e2e tests pass for an endpoint. Enforces a complete end-to-end review: controller → DTOs → service → port/repository → Swagger → tests → final verification (lint, test, build)."
argument-hint: "Endpoint o DTO afectado: añadir / quitar / cambiar / verificar"
---

# api-contract — API Contract Verification & Change Workflow

Garantiza que al tocar una ruta o un contrato HTTP **nada quede roto**. Aplica tanto para implementar un cambio nuevo como para auditar el estado actual de una ruta existente.

El flujo siempre es: **leer primero → auditar → reportar hallazgos → corregir → verificar**.

---

## When to Use

Invoca este skill cuando el usuario diga:

- "añade este endpoint" / "add this endpoint"
- "quita esta ruta" / "remove this route"
- "cambia este DTO" / "change this DTO"
- "corrige este contrato" / "fix this contract"
- "actualiza Swagger" / "update Swagger"
- "haz que pasen los tests e2e de este endpoint"
- "verifica que no se ha roto nada en esta ruta"
- "revisa el endpoint X"

---

## Guided Flow

Si la petición es ambigua, aclara en este orden antes de empezar:

1. **¿Qué ruta o DTO está implicado?** (ruta HTTP, método, nombre de archivo)
2. **¿Es un cambio nuevo o una auditoría?** (implementar vs verificar estado actual)
3. **¿Hay breaking change?** (forma del request/response, campos requeridos, códigos de estado)

Si los archivos son visibles en el contexto, infiere las respuestas sin preguntar.

---

## Phase 1 — Read & Audit (SIEMPRE PRIMERO)

**Lee todos los ficheros afectados antes de tocar nada.** Construye una imagen del estado actual chequeando cada capa con las preguntas de auditoría.

### 1.1 Controller

Lee el handler de la ruta en `src/**/*.controller.ts`.

| Pregunta | Problema si → |
|---|---|
| ¿El handler usa DTOs tipados para input y output? | Usa `any`, tipos inline o cast explícito |
| ¿Los imports de DTOs son imports de módulo (no inline)? | `import(...)` inline dentro del decorador o parámetro |
| ¿El handler delega en el servicio sin lógica propia? | Contiene queries, cálculos o acceso a repo directo |
| ¿Los decoradores Swagger (`@ApiResponse`, `@ApiQuery`, `@ApiParam`) están presentes y correctos? | Faltan, están desactualizados o no coinciden con la firma |
| ¿El constructor está al principio de la clase y los métodos después? | Métodos antes del constructor |
| ¿No hay rutas huérfanas (sin método de servicio correspondiente)? | Ruta definida pero sin servicio que la respalde |

### 1.2 DTOs

Lee cada DTO referenciado por esa ruta en `src/**/*.dto.ts`.

| Pregunta | Problema si → |
|---|---|
| ¿Todas las propiedades de input tienen decorador `class-validator`? | Propiedad sin `@IsString`, `@IsOptional`, `@IsIn`, etc. |
| ¿Todas las propiedades tienen tipo explícito (no `any`)? | Tipo implícito o `any` |
| ¿Cada propiedad tiene `@ApiProperty` o `@ApiPropertyOptional`? | Falta decorador Swagger en algún campo |
| ¿Los DTOs no exportados o no usados han sido eliminados? | DTO declarado pero sin referencias |

### 1.3 Service

Lee el método de servicio en `src/**/*.service.ts`.

| Pregunta | Problema si → |
|---|---|
| ¿El método tiene tipos explícitos en parámetros y retorno? | `any`, tipos inferidos ambiguos, retorno sin tipo |
| ¿El método lanza excepciones concretas en errores esperados? | Retorna `null` / `undefined` silenciosamente, errores no tipados |
| ¿La firma es consistente con lo que el controller espera? | El controller pasa parámetros que el servicio no acepta o ignora |

### 1.4 Port / Repository

Lee `src/**/ports/*.ts` y `src/infrastructure/persistence/**/*.ts` solo si la ruta toca persistencia.

| Pregunta | Problema si → |
|---|---|
| ¿El método existe en el puerto (interfaz)? | El servicio llama a un método que no está declarado en el puerto |
| ¿El adaptador Prisma implementa todos los métodos del puerto? | Método en interfaz sin implementación en el adaptador |
| ¿El adaptador no propaga tipos Prisma al servicio? | Retorna `PrismaClient` o tipos crudos de Prisma fuera de la capa infra |

### 1.5 Swagger / OpenAPI

Lee `openapi/gestor-tareas-ice-mvp.openapi.yaml`.

| Pregunta | Problema si → |
|---|---|
| ¿El path existe en el YAML al nivel correcto de indentación? | Path anidado dentro de otro path en lugar de ser hermano |
| ¿El método HTTP, parámetros y request body coinciden con el controller? | Método, parámetros o schema distintos a la implementación real |
| ¿Los códigos de respuesta documentados son los que el controller emite? | Falta 400, 404 o 502; o hay códigos obsoletos |
| ¿No hay paths obsoletos en el YAML que ya no existen en el controller? | Path documentado sin handler correspondiente |

### 1.6 Tests

Lee `src/**/*.spec.ts` y `test/**/*.e2e-spec.ts`.

| Pregunta | Problema si → |
|---|---|
| ¿Existe al menos un test unitario para el método de servicio? | No hay `describe` / `it` que cubra ese método |
| ¿Los mocks del repositorio reflejan la firma actual del puerto? | Mock con métodos que ya no existen o sin métodos nuevos |
| ¿Existe al menos un test e2e para ese endpoint? | No hay test e2e para happy path ni para error esperado |
| ¿Los tests e2e cubren: happy path, 400 (validación), 404 (si aplica)? | Solo hay happy path |

---

## Phase 2 — Audit Report

**Antes de modificar nada**, emite un informe con el resultado de la auditoría:

```
## Audit Report — <ruta> <método>

### Hallazgos
| Capa        | Estado | Detalle |
|-------------|--------|---------|
| Controller  | ✅ / ❌ | ... |
| DTOs        | ✅ / ❌ | ... |
| Service     | ✅ / ❌ | ... |
| Port/Repo   | ✅ / ❌ / N/A | ... |
| Swagger     | ✅ / ❌ | ... |
| Unit tests  | ✅ / ❌ | ... |
| E2E tests   | ✅ / ❌ | ... |

### Acción requerida
- [ ] <problema 1 y capa>
- [ ] <problema 2 y capa>
```

Si todas las capas son ✅ y no hay cambio que implementar, el informe lo dice explícitamente y no se modifica nada.

---

## Phase 3 — Fix

Aplica las correcciones identificadas en Phase 2, una capa a la vez, en este orden:

1. **Controller** — corregir imports, reorganizar estructura, actualizar decoradores Swagger.
2. **DTOs** — añadir decoradores faltantes, tipos explícitos, `@ApiProperty`.
3. **Service** — alinear firma con controller y puerto, añadir tipos de retorno.
4. **Port / Repository** — actualizar interfaz y adaptador Prisma si aplica.
5. **Swagger YAML** — corregir indentación, paths, schemas, códigos de respuesta.
6. **Unit tests** — actualizar mocks y aserciones para reflejar la firma actual.
7. **E2E tests** — añadir o corregir escenarios del endpoint.

Reglas de corrección:
- Mínimo cambio necesario. No refactorizar más allá del hallazgo.
- No eliminar tests para quitar fallos; corregir el código o el mock.
- No suprimir reglas de lint.
- Dejar imports de módulo limpios (nunca `import(...)` inline en parámetros).

---

## Phase 4 — Final Verification

No dar la tarea por terminada hasta que esto pase:

```bash
npm run verify
```

Si no existe, ejecutar individualmente:

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

Si algún paso falla, volver a Phase 3 y corregir. Repetir hasta verde.

---

## Layer Map — Quick Reference

| Cambio | Capas a tocar |
|---|---|
| Nuevo endpoint | Controller → DTO → Service → (Port si DB) → Swagger → Unit test → E2E test |
| Quitar endpoint | Controller → Service → (Port si DB) → Swagger → Unit test → E2E test → Borrar DTOs huérfanos |
| Cambiar request DTO | DTO → Controller (decorador) → Service (firma) → Swagger → Unit test → E2E test |
| Cambiar response DTO | DTO → Controller (tipo retorno) → Service (tipo retorno) → Swagger → Unit test → E2E test |
| Corregir contrato / status code | Controller → Swagger → E2E test |
| Solo actualizar Swagger | Decoradores controller → YAML |
| Arreglar e2e roto | E2E test → Controller → DTO → Service → (Port si DB) |
| Auditoría / verificación | Phase 1 → Phase 2 → Phase 3 solo si hay hallazgos → Phase 4 |

---

## Project Conventions

- Estructura de módulos: `src/modules/<name>/`, con controller, service, DTOs y subcarpeta `ports/`.
- Puerto (interfaz): `src/modules/<name>/ports/task-repository.port.ts`.
- Adaptador Prisma: `src/infrastructure/persistence/prisma/`.
- Controllers principales: `tasks.controller.ts`, `tasks-ice.controller.ts`.
- Swagger habilitado solo en entornos no productivos (ver `src/main.ts`).
- `ValidationPipe` es global — los DTOs con `class-validator` se validan automáticamente.
- Logging con `NestJS Logger`; nunca `console.log`.
- Configuración y secretos vía variables de entorno (`src/config/configuration.ts`).

---

## Anti-patterns to Avoid

- Leer un solo fichero y asumir el estado general — siempre auditar todas las capas.
- Modificar ficheros sin haber emitido primero el Audit Report.
- Cambiar un DTO sin actualizar sus decoradores `@ApiProperty`.
- Añadir un método de servicio sin test unitario.
- Actualizar la ruta en el controller sin actualizar el YAML de OpenAPI.
- Dar la tarea por terminada antes de que `npm run verify` pase en verde.
- Borrar un test que falla en lugar de corregir el código subyacente.
