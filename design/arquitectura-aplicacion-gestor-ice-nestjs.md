# Arquitectura de la Aplicación

## Gestor ICE MVP (NestJS + TypeScript)

Fecha: 11 de marzo de 2026

## 1. Objetivo y alcance técnico

Definir una arquitectura simple, modular y mantenible para una API REST en NestJS que permita:

- CRUD de tareas.
- Cálculo ICE manual.
- Estimación ICE con IA remota.
- Priorización por score ICE.

Esta arquitectura está pensada para un MVP de curso, priorizando claridad y buenas prácticas básicas de backend con TypeScript.

### 1.1 Incluye

- API HTTP en NestJS.
- Arquitectura de persistencia desacoplada mediante puertos y adaptadores.
- Implementación inicial local con SQLite + Prisma.
- Integración con un proveedor de IA remoto para estimación ICE.
- Validaciones de entrada y manejo de errores controlado.

### 1.2 No incluye

- Frontend web o móvil.
- Multi-tenant avanzado.
- RBAC complejo.
- Integraciones externas adicionales (Jira, Slack, etc.).
- Microservicios, colas o arquitectura distribuida.

## 2. Principios de diseño

- Separación por módulos de dominio.
- Dependencia unidireccional: Tasks → Ice → Ai (nunca al revés).
- Contratos HTTP estables y alineados con OpenAPI.
- Reglas ICE (cálculo, clamp, validación) centralizadas en IceService como lógica pura.
- TasksModule como único dueño de la entidad Task y orquestador de persistencia.
- Persistencia abstraída mediante puertos; la aplicación no depende del ORM ni del motor concreto.
- Los adaptadores de persistencia implementan capacidades del contrato, no decisiones de negocio.
- Integración IA encapsulada para permitir reemplazo por mock o proveedor alternativo.
- AiService limitado a comunicación HTTP; no aplica reglas de dominio.

## 3. Vista de arquitectura

Arquitectura en capas dentro de un monolito modular NestJS:

1. Capa de entrada (HTTP): controllers y DTOs.
2. Capa de servicios: orquestación (TasksService) y lógica pura (IceService, AiService).
3. Capa de puertos: contratos de persistencia y de integración externa.
4. Capa de infraestructura: adaptadores concretos (Prisma/SQLite hoy, otros mañana) y adaptador HTTP de IA remota.

### 3.1 Flujo de alto nivel

1. El cliente llama un endpoint.
2. El controller valida request (DTO + pipes).
3. El servicio de aplicación ejecuta el caso de uso.
4. Si aplica, se recalcula ICE en el servicio de dominio.
5. Si aplica, se invoca IA vía adaptador.
6. Se persiste usando un puerto de repositorio.
7. Se responde al cliente en formato de contrato OpenAPI.

## 4. Estructura de carpetas propuesta

```text
proyecto/
  src/
    main.ts
    app.module.ts

    config/
      configuration.ts
      env.validation.ts

    common/
      filters/
        http-exception.filter.ts
      exceptions/
        domain.exception.ts
      constants/
        error-codes.ts
      utils/
        clamp.util.ts

    modules/
      tasks/
        tasks.module.ts
        tasks.controller.ts
        tasks-ice.controller.ts   # sub-controller para /tasks/:id/ice/*
        tasks.service.ts
        ports/
          task-repository.port.ts
        dto/
          create-task.dto.ts
          update-task.dto.ts
          list-tasks-query.dto.ts
          manual-ice.dto.ts

      ice/
        ice.module.ts
        ice.service.ts              # lógica pura, sin controller ni acceso a DB
        models/
          ice-estimation.model.ts

      ai/
        ai.module.ts
        ai.service.ts               # solo HTTP + parseo, sin clamp ni reglas ICE
        providers/
          gemini.provider.ts
        dto/
          ai-estimation-response.dto.ts

    infrastructure/
      persistence/
        prisma/
          prisma.module.ts
          prisma.service.ts
          prisma-task.repository.ts

  prisma/
    schema.prisma
    migrations/

  test/
    app.e2e-spec.ts
    tasks.e2e-spec.ts
    ice.e2e-spec.ts
```

Nota: los nombres son guía de diseño. La idea clave es que el puerto viva cerca del dominio de tareas y el adaptador concreto viva en infraestructura.

## 5. Módulos y responsabilidades

## 5.1 TasksModule

Dueño exclusivo de la entidad Task, su persistencia y todos los endpoints bajo `/tasks`.

Importa: IceModule, AiModule.
Depende de: `TaskRepositoryPort`.

Controllers:

- `TasksController` — CRUD y listado (`/tasks`, `/tasks/:id`).
- `TasksIceController` — Endpoints ICE (`/tasks/:id/ice/manual`, `/tasks/:id/ice/estimate`). Vive en el mismo módulo para reutilizar el prefijo de ruta `:id` sin duplicar lógica de resolución de Task.

Funciones principales:

- CRUD completo de tareas.
- Listado priorizado por score con query `sort=ice`.
- Orquestación de operaciones ICE: busca la tarea, delega cálculo/estimación a IceService o AiService, y persiste el resultado vía repositorio.
- Recalcular `iceScore` cuando se actualizan campos ICE vía `PATCH`.

Endpoints:

- `POST /tasks`
- `GET /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/:id/ice/manual`
- `POST /tasks/:id/ice/estimate`

## 5.2 IceModule

Módulo de lógica pura ICE. No tiene controller, no accede a base de datos, no conoce la entidad Task.

Exporta: IceService.

Funciones principales:

- Cálculo de `iceScore` a partir de valores numéricos.
- Validación de rango (1..10).
- Clamp y normalización de valores ICE (incluidos los provenientes de IA).

No tiene endpoints propios. TasksModule lo consume como dependencia.

## 5.3 AiModule

Responsable de integración HTTP con proveedor de IA remoto. No aplica reglas de dominio ICE.

Exporta: AiService.

Funciones principales:

- Construcción de prompt con formato JSON estricto.
- Llamada HTTP con timeout configurable.
- Parseo y validación estructural del payload de respuesta.
- Mapeo de errores técnicos (timeout, red, payload inválido) a error de dominio `AI_UNAVAILABLE`.

Lo que NO hace:

- No aplica clamp ni normalización de valores ICE (eso es responsabilidad de IceService).
- No conoce la entidad Task ni accede a base de datos.

## 6. Servicios principales

## 6.1 TasksService

Orquestador principal. No accede al ORM directamente; depende de un puerto de repositorio.

Casos de uso CRUD:

- `createTask(data)`
- `listTasks(sort?)`
- `getTaskById(id)`
- `updateTask(id, data)`
- `deleteTask(id)`

Casos de uso ICE (orquestación):

- `applyManualIce(taskId, impact, confidence, effort)` — busca tarea, delega cálculo a IceService, persiste.
- `estimateIceWithAi(taskId)` — busca tarea, llama a AiService con la description, pasa resultado crudo a IceService para clamp y cálculo, persiste con `iceSource=ai`.

Regla clave:

- Si en `updateTask` cambian `impact`, `confidence` o `effort`, delegar recálculo a `IceService.calculateScore()` antes de persistir.

Dependencia técnica esperada:

- `TaskRepositoryPort`, no `PrismaService`.

## 6.2 IceService

Lógica pura sin efectos secundarios. No accede a base de datos ni conoce la entidad Task.

Métodos:

- `calculateScore(impact, confidence, effort)` — aplica fórmula y devuelve entero.
- `clampValues(raw)` — normaliza valores a rango 1..10 (usado para salida de IA).
- `validateRange(impact, confidence, effort)` — lanza error si fuera de rango.

Reglas clave:

- `effort` nunca puede ser 0.
- Rango permitido 1..10.
- Fórmula:

`iceScore = round((impact * confidence) / effort * 10)`

Este servicio es fácilmente testeable de forma unitaria al no tener dependencias de infraestructura.

## 6.3 AiService

Adaptador HTTP puro. No aplica reglas ICE.

Métodos:

- `estimateIce(description)` — envía prompt al proveedor y devuelve payload crudo parseado.

Comportamiento esperado:

- Retorna objeto crudo parseado con:
  - impact (número sin clamp)
  - confidence (número sin clamp)
  - effort (número sin clamp)
  - aiJustification
  - aiDescription (opcional)
- El clamp y la validación de rango los aplicará IceService después.
- Si el proveedor falla o responde payload estructuralmente inválido, lanza error de dominio para respuesta 502.

## 6.4 TaskRepositoryPort

Contrato de persistencia de la entidad Task.

Objetivo:

- Permitir cambiar SQLite + Prisma por Postgres, MongoDB, API externa o almacenamiento en memoria sin reescribir `TasksService`.

Operaciones mínimas del contrato:

- `create(taskData)`
- `findById(id)`
- `findAll(sort?)`
- `update(id, taskData)`
- `delete(id)`

Responsabilidades del puerto:

- Resolver lectura y escritura de Task.
- Garantizar el orden cuando `sort=ice` sea solicitado por la aplicación.
- Ocultar detalles de ORM, SQL, índices o formato del almacenamiento.

Responsabilidades que NO debe asumir:

- No calcular `iceScore`.
- No aplicar reglas ICE.
- No decidir semántica HTTP.

## 7. Modelo de datos y persistencia

Entidad principal: Task

Campos funcionales:

- id (uuid)
- title
- description
- aiDescription (nullable)
- status (TODO | IN_PROGRESS | DONE)
- dueDate (nullable)
- impact
- confidence
- effort
- iceScore
- iceSource (manual | ai)
- aiJustification (nullable)
- lastAiEstimatedAt (nullable)
- createdAt
- updatedAt

### 7.1 Reglas de persistencia

- `createdAt` y `updatedAt` automáticos.
- `iceScore` es un dato derivado calculado por la aplicación antes de persistir.
- La implementación actual lo almacena como entero para facilitar ordenación y consulta.
- Si en el futuro otra persistencia requiere una estrategia distinta, el comportamiento observable de la API debe mantenerse estable.
- En estimación IA exitosa:
  - actualizar valores ICE
  - set `iceSource=ai`
  - set `lastAiEstimatedAt`
- En asignación manual:
  - actualizar valores ICE
  - set `iceSource=manual`

### 7.2 Índices recomendados

- En la implementación Prisma/SQLite:
  - índice por `createdAt` para listado por defecto.
  - índice por `iceScore` para priorización.

Nota de diseño:

- Los índices no forman parte del contrato de aplicación; son una optimización del adaptador concreto.

### 7.3 Estrategia de extensibilidad

- La aplicación asume un único contrato de repositorio para Task.
- Cada nueva persistencia implementa el mismo puerto y registra su adaptador en el contenedor de NestJS.
- El cambio de persistencia no debe alterar:
  - formato de respuestas
  - reglas de negocio ICE
  - semántica de ordenación `sort=ice`
  - errores funcionales (`NOT_FOUND`, `VALIDATION_ERROR`, etc.)

Persistencias futuras viables:

- PostgreSQL manteniendo Prisma.
- MongoDB con repositorio alternativo.
- Repositorio en memoria para tests.
- Adaptador contra API externa, si la tarea vive fuera del servicio.

## 8. Mapeo de endpoints a componentes

| Endpoint                     | Controller         | Servicio principal                                      | Resultado       |
| ---------------------------- | ------------------ | ------------------------------------------------------- | --------------- |
| POST /tasks                  | TasksController    | TasksService.createTask                                 | 201             |
| GET /tasks                   | TasksController    | TasksService.listTasks                                  | 200             |
| GET /tasks/:id               | TasksController    | TasksService.getTaskById                                | 200 / 404       |
| PATCH /tasks/:id             | TasksController    | TasksService.updateTask                                 | 200 / 400 / 404 |
| DELETE /tasks/:id            | TasksController    | TasksService.deleteTask                                 | 204 / 404       |
| POST /tasks/:id/ice/manual   | TasksIceController | TasksService.applyManualIce → IceService                | 200 / 400 / 404 |
| POST /tasks/:id/ice/estimate | TasksIceController | TasksService.estimateIceWithAi → AiService + IceService | 200 / 404 / 502 |

## 9. Validación y manejo de errores

Estrategia recomendada:

- Validación de DTOs con class-validator y ValidationPipe global.
- Filtro global de excepciones para estandarizar el formato:
  - statusCode
  - error
  - message

Errores funcionales clave:

- `VALIDATION_ERROR` -> 400
- `NOT_FOUND` -> 404
- `AI_UNAVAILABLE` -> 502

## 10. Configuración y entorno

Variables de entorno:

- `PORT`
- `DATABASE_URL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `AI_TIMEOUT_MS`

Recomendación:

- Validar variables al arranque para fail-fast y evitar errores en runtime.

## 11. Estrategia de testing mínima

Pruebas unitarias:

- IceService:
  - cálculo de score
  - redondeo correcto
  - validación de rango
  - caso effort inválido

Pruebas e2e:

- CRUD completo de tareas.
- `POST /tasks/:id/ice/manual`.
- `POST /tasks/:id/ice/estimate`:
  - camino feliz con mock de IA
  - falla de IA con respuesta 502
- `GET /tasks?sort=ice` orden descendente.

## 12. Decisiones arquitectónicas

- Monolito modular NestJS para velocidad de entrega y claridad pedagógica.
- Dependencia unidireccional Tasks → Ice → Ai para evitar ciclos y simplificar testing.
- TasksModule como único orquestador; la persistencia se consume vía puerto, no vía ORM concreto.
- Dos controllers en TasksModule (`TasksController` + `TasksIceController`) para agrupar todos los endpoints bajo `/tasks/:id` sin romper el prefijo de ruta.
- IceService centraliza toda regla de dominio ICE (cálculo, clamp, validación), incluyendo normalización de respuestas de IA.
- AiService limitado a comunicación HTTP: no aplica reglas de negocio.
- Prisma + SQLite como primer adaptador por simplicidad de desarrollo local.
- Puerto `TaskRepositoryPort` para permitir nuevas persistencias sin modificar la lógica de aplicación.
- Adaptador de IA desacoplado para permitir cambio de proveedor o mock sin tocar reglas ICE.

## 13. Riesgos y mitigaciones

Riesgo: latencia o cuota del proveedor IA gratuito.
Mitigación: timeout configurable y error controlado `AI_UNAVAILABLE`.

Riesgo: respuestas IA no estructuradas.
Mitigación: prompt con JSON estricto + validación de esquema + normalización de salida.

Riesgo: complejidad para alumnado inicial.
Mitigación: responsabilidades simples por módulo y límites técnicos claros de MVP.

## 14. Resultado esperado del MVP

La API se considera arquitectónicamente completa cuando:

- Expone CRUD funcional de tareas.
- Calcula y persiste ICE manual correctamente.
- Estima ICE con IA y persiste metadatos.
- Permite priorización por score ICE.
- Maneja errores de validación, no encontrado y proveedor IA de forma consistente.
