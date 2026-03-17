# Plan de Implementación

## Gestor ICE MVP (NestJS + TypeScript)

Fecha: 11 de marzo de 2026

## 1. Objetivo del plan

Definir una hoja de ruta ejecutable para implementar el MVP del Gestor ICE en NestJS, minimizando riesgo y manteniendo consistencia con:

- Arquitectura modular definida.
- Contrato OpenAPI.
- Reglas de negocio ICE.

Este plan no incluye código, solo fases, tareas, entregables y criterios de salida.

## 2. Alcance del plan

Incluye:

- Preparación del proyecto y convenciones.
- Implementación incremental por capacidades (CRUD, ICE manual, IA, robustez).
- Validaciones, errores y testing mínimo.
- Preparación para persistencia intercambiable (puerto + adaptador inicial Prisma/SQLite).

No incluye:

- Frontend.
- Despliegue cloud productivo.
- Observabilidad avanzada.

## 3. Principios de ejecución

- Vertical slices: cada fase deja funcionalidad usable.
- Contrato primero: OpenAPI como referencia de comportamiento.
- Regla de oro: dominio ICE aislado de infraestructura.
- Persistencia desacoplada: aplicación depende de puerto, no de ORM.
- Definition of Done por fase para evitar deuda acumulada.

## 4. Dependencias y prerrequisitos

- Node.js LTS y npm.
- Nest CLI.
- Prisma CLI.
- SQLite local.
- API key del proveedor IA (Gemini o equivalente).
- Variables de entorno base:
  - PORT
  - DATABASE_URL
  - GEMINI_API_KEY
  - GEMINI_MODEL
  - AI_TIMEOUT_MS

## 5. Fases de implementación (bloque principal)

Este bloque concentra exclusivamente la ejecución técnica del MVP.

### 5.1 Fase 0: Arranque técnico y estructura base

Objetivo:

- Dejar el esqueleto listo con estructura modular y convenciones de proyecto.

Tareas:

1. Inicializar proyecto NestJS con TypeScript.
2. Crear estructura de módulos: tasks, ice, ai.
3. Crear estructura de infraestructura para persistencia con adaptador Prisma.
4. Definir convenciones:
   - nomenclatura DTOs
   - manejo de errores
   - validación de configuración
5. Configurar ValidationPipe global y filtro global de excepciones.

Entregables:

- Proyecto compila y arranca.
- Estructura de carpetas alineada con arquitectura.
- Configuración de entorno validada al inicio.

Criterio de salida:

- El servicio inicia sin errores con entorno mínimo.

Criterios de validación:

1. La aplicación inicia con `npm run start:dev` sin errores de bootstrap.
2. La validación de variables de entorno falla de forma controlada si falta una variable obligatoria.
3. El filtro global de excepciones responde el formato estándar (`statusCode`, `error`, `message`).
4. La estructura de carpetas coincide con la arquitectura acordada.

### 5.2 Fase 1: Contrato de persistencia y adaptador inicial

Objetivo:

- Preparar base de datos y abstraer persistencia para evitar acoplamiento futuro.

Tareas:

1. Definir TaskRepositoryPort con operaciones mínimas:
   - create
   - findById
   - findAll(sort?)
   - update
   - delete
2. Implementar adaptador PrismaTaskRepository.
3. Modelar entidad Task en schema Prisma.
4. Generar migración inicial SQLite.
5. Configurar inyección de dependencia en TasksModule para usar el puerto.

Entregables:

- Puerto de persistencia definido.
- Adaptador Prisma/SQLite operativo.
- Migración inicial aplicada.

Criterio de salida:

- Se puede crear y consultar una tarea a través del repositorio sin exponer Prisma fuera del adaptador.

Criterios de validación:

1. `TasksService` depende del puerto de repositorio, no de `PrismaService`.
2. El adaptador Prisma implementa todas las operaciones definidas en el contrato.
3. La migración inicial se aplica correctamente y crea la estructura esperada.
4. Ningún módulo fuera de infraestructura importa componentes de Prisma directamente.

### 5.3 Fase 2: CRUD de tareas (sin ICE avanzado)

Objetivo:

- Entregar endpoints CRUD base de Task según OpenAPI.

Tareas:

1. Implementar DTOs CreateTask, UpdateTask, ListTasksQuery.
2. Implementar TasksController y TasksService para:
   - POST /tasks
   - GET /tasks
   - GET /tasks/:id
   - PATCH /tasks/:id
   - DELETE /tasks/:id
3. Validar reglas de campos:
   - title (3..120)
   - description (max 200)
   - status enum
4. Estandarizar errores 400 y 404 con formato común.

Entregables:

- CRUD funcional completo.
- Manejo de validación y not found consistente.

Criterio de salida:

- Todos los endpoints CRUD responden con los códigos esperados por OpenAPI.

Criterios de validación:

1. `POST /tasks` valida `title` y `description` según contrato.
2. `GET /tasks/:id`, `PATCH /tasks/:id` y `DELETE /tasks/:id` devuelven 404 cuando no existe la tarea.
3. `PATCH /tasks/:id` permite actualización parcial sin romper campos no enviados.
4. El formato de errores 400/404 es consistente en todos los endpoints CRUD.

### 5.4 Fase 3: Dominio ICE manual

Objetivo:

- Implementar reglas ICE en lógica pura y aplicación manual por endpoint.

Tareas:

1. Implementar IceService con:
   - validateRange
   - calculateScore
   - clampValues
2. Implementar TasksIceController para:
   - POST /tasks/:id/ice/manual
3. Implementar caso de uso TasksService.applyManualIce:
   - resolver task por id
   - validar y calcular score
   - persistir impact/confidence/effort/iceScore/iceSource
4. Incorporar recalculo en PATCH cuando cambian campos ICE.

Entregables:

- Endpoint manual ICE funcional.
- Recalculo automático en actualización parcial.

Criterio de salida:

- `iceScore` siempre consistente tras cambios manuales de ICE.

Criterios de validación:

1. `POST /tasks/:id/ice/manual` rechaza valores fuera de 1..10.
2. El cálculo aplica exactamente la fórmula definida y retorna entero redondeado.
3. `PATCH /tasks/:id` recalcula score cuando cambian `impact`, `confidence` o `effort`.
4. `iceSource` queda en `manual` tras asignación manual.

### 5.5 Fase 4: Priorización por score ICE

Objetivo:

- Exponer listado priorizado por ICE.

Tareas:

1. Extender listTasks para soportar `sort=ice`.
2. Resolver orden descendente por `iceScore` en repositorio.
3. Asegurar fallback a orden por createdAt cuando no hay sort.

Entregables:

- GET /tasks?sort=ice operativo.

Criterio de salida:

- Listado priorizado devuelve tareas de mayor a menor score.

Criterios de validación:

1. `GET /tasks?sort=ice` ordena estrictamente en descendente por `iceScore`.
2. `GET /tasks` sin query mantiene orden por defecto (createdAt).
3. La ordenación se mantiene estable ante tareas con score iguales (criterio secundario documentado).
4. El endpoint conserva tiempo de respuesta aceptable con volumen de prueba del curso.

### 5.6 Fase 5: Integración IA para estimación ICE

Objetivo:

- Integrar proveedor IA para estimar ICE desde description.

Tareas:

1. Implementar AiService como adaptador HTTP:
   - prompt JSON estricto
   - timeout configurable
   - parseo estructural de respuesta
2. Implementar TasksService.estimateIceWithAi:
   - cargar description desde Task
   - solicitar estimación al AiService
   - normalizar/clamp con IceService
   - calcular iceScore
   - persistir valores ICE + metadatos IA
3. Implementar endpoint:
   - POST /tasks/:id/ice/estimate
4. Mapear errores externos a `AI_UNAVAILABLE` (502).

Entregables:

- Flujo IA completo funcional con persistencia de sugerencia.

Criterio de salida:

- Estimación IA devuelve 200 en camino feliz y 502 en fallos controlados.

Criterios de validación:

1. `POST /tasks/:id/ice/estimate` devuelve 404 si la tarea no existe.
2. En respuesta válida del proveedor IA, la tarea se actualiza con valores ICE, `iceScore`, `iceSource=ai` y metadatos IA.
3. Si hay timeout o payload inválido, la API devuelve 502 con `AI_UNAVAILABLE`.
4. El clamp de valores IA se aplica en IceService, no en AiService.

### 5.7 Fase 6: Calidad mínima y robustez

Objetivo:

- Asegurar estabilidad del MVP antes de cierre.

Tareas:

1. Unit tests de IceService:
   - fórmula
   - redondeo
   - rangos
   - effort inválido
2. E2E tests críticos:
   - CRUD base
   - ICE manual
   - ICE estimate (éxito + 502)
   - sort=ice
3. Revisar manejo de errores y mensajes consistentes.
4. Revisar configuración final de entorno y defaults seguros.

Entregables:

- Suite mínima de tests ejecutable.
- Checklist de robustez completado.

Criterio de salida:

- Pruebas críticas en verde y criterios funcionales del MVP cumplidos.

Criterios de validación:

1. Los tests unitarios de IceService cubren fórmula, redondeo y validaciones de rango.
2. Los e2e críticos cubren CRUD, ICE manual, estimate IA y priorización.
3. No existen regresiones funcionales frente al contrato OpenAPI.
4. El proyecto puede ejecutarse de extremo a extremo con una configuración local documentada.

## 6. Material complementario (fuera del bloque de fases)

### 6.1 Backlog técnico recomendado (post-MVP)

1. Repositorio alternativo in-memory para tests de aplicación sin DB.
2. Segundo adaptador persistencia (ejemplo: PostgreSQL).
3. Idempotencia y control de concurrencia en operaciones de estimación IA.
4. Observabilidad básica:
   - logs estructurados
   - correlación request-id
5. Hardening del adaptador IA:
   - retries con backoff
   - circuit breaker sencillo

### 6.2 Riesgos por fase y mitigación

- Riesgo: acoplar servicio de aplicación a Prisma.
  - Mitigación: revisar imports y restringir acceso a Prisma al adaptador.

- Riesgo: regresiones en fórmula ICE por cambios rápidos.
  - Mitigación: tests unitarios tempranos en Fase 3.

- Riesgo: respuesta IA inconsistente.
  - Mitigación: parseo estricto + clamp + error 502 controlado.

- Riesgo: crecer en complejidad antes de cerrar MVP.
  - Mitigación: no abrir alcance fuera de fases definidas.

### 6.3 Matriz de definición de terminado (DoD)

Una fase se considera terminada cuando:

1. Endpoints de la fase responden según contrato esperado.
2. Validaciones y errores de la fase son consistentes.
3. Se registran decisiones técnicas relevantes.
4. Tests de la fase pasan en local.
5. No se rompe comportamiento de fases anteriores.

### 6.4 Cronograma sugerido (curso)

- Semana 1:
  - Fase 0 + Fase 1
- Semana 2:
  - Fase 2 + Fase 3
- Semana 3:
  - Fase 4 + Fase 5
- Semana 4:
  - Fase 6 + cierre

Nota:

- Este cronograma es orientativo; ajustar según ritmo del curso y disponibilidad.

## 7. Resultado esperado

Al finalizar el plan, el equipo dispone de una API NestJS MVP que:

- Cumple CRUD de tareas.
- Calcula y persiste ICE manual.
- Estima ICE con IA y maneja errores externos.
- Prioriza por `iceScore`.
- Permite evolucionar a otro almacenamiento con cambios acotados al adaptador de persistencia.
