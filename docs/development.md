# Desarrollo Local y API

Esta guia resume el flujo operativo para trabajar sobre Gestor ICE sin tener que recorrer todo el codigo fuente.

## Variables de entorno

Plantilla base: `.env.example`

| Variable | Obligatoria | Default | Uso |
|---|---|---|---|
| `PORT` | No | `3000` | Puerto HTTP de la aplicacion |
| `DATABASE_URL` | No | `file:./dev.db` | Conexion de Prisma |
| `GEMINI_API_KEY` | No | - | Necesaria para `POST /tasks/:id/ice/estimate` |
| `GEMINI_MODEL` | No | `gemini-1.5-flash` | Modelo Gemini usado por el proveedor |
| `AI_TIMEOUT_MS` | No | `8000` | Timeout de integracion AI |

## Flujo de arranque local

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
```

## Swagger

- Disponible en `/api` cuando `NODE_ENV !== production`
- La configuracion se monta en `src/main.ts`
- El contrato OpenAPI manual del repositorio vive en `openapi/gestor-tareas-ice-mvp.openapi.yaml`

## Endpoints disponibles

### CRUD de tareas

| Metodo | Ruta | Descripcion |
|---|---|---|
| `POST` | `/tasks` | Crea una tarea |
| `GET` | `/tasks` | Lista tareas; acepta `sort=ice` |
| `GET` | `/tasks/:id` | Recupera una tarea |
| `PATCH` | `/tasks/:id` | Actualiza una tarea |
| `DELETE` | `/tasks/:id` | Elimina una tarea |

### Priorizacion ICE

| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/tasks/priority` | Lista tareas ordenadas por `iceScore`; acepta `order=asc|desc` |
| `POST` | `/tasks/:id/ice/manual` | Aplica valores ICE manuales y persiste `iceScore` |
| `POST` | `/tasks/:id/ice/estimate` | Solicita estimacion a Gemini y persiste el resultado |

## Comportamiento de validacion y errores

- La API usa `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`
- Los DTOs controlan la validacion de entrada mediante `class-validator`
- El filtro HTTP centraliza la forma de respuesta de errores
- Si falta `GEMINI_API_KEY`, la estimacion AI responde como fallo de proveedor externo

## Estructura relevante

```text
src/
  config/
  common/
  infrastructure/persistence/prisma/
  modules/
    ai/
    ice/
    tasks/
test/
openapi/
design/
```

## Scripts de trabajo

| Script | Uso |
|---|---|
| `npm run start:dev` | Desarrollo con watch |
| `npm run test` | Tests unitarios |
| `npm run test:e2e` | Tests e2e |
| `npm run lint` | Lint con autofix |
| `npm run build` | Compilacion NestJS |
| `npm run verify` | Validacion completa antes de cerrar cambios |

## Criterio de calidad recomendado

Antes de fusionar cambios:

```bash
npm run verify
```

Si el cambio toca endpoints o contratos HTTP, revisar tambien:

- controller afectado
- DTOs relacionados
- servicio
- puerto/repositorio si aplica
- Swagger/OpenAPI
- tests unitarios y e2e afectados

## Referencias utiles

- `README.md`
- `.env.example`
- `CONTRIBUTING.md`
- `docs/api-examples.md`
- `design/alcance-mvp-api-ice-nestjs.md`
- `design/arquitectura-aplicacion-gestor-ice-nestjs.md`
- `design/plan-implementacion-gestor-ice-nestjs.md`