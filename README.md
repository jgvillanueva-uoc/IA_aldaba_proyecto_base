# Gestor ICE API

Backend NestJS para gestionar tareas priorizadas con la metodologia ICE.

El proyecto expone una API REST para:

- crear, consultar, actualizar y eliminar tareas
- asignar valores ICE manualmente
- estimar ICE mediante Gemini
- listar tareas ordenadas por prioridad ICE

## Stack

- NestJS 11
- TypeScript
- Prisma
- SQLite
- class-validator / class-transformer
- Swagger UI en entornos no productivos
- Jest + Supertest

## Funcionalidad principal

- CRUD de tareas bajo `/tasks`
- ICE manual bajo `/tasks/:id/ice/manual`
- Estimacion ICE por IA bajo `/tasks/:id/ice/estimate`
- Listado priorizado bajo `/tasks/priority`
- Validacion global de DTOs con `ValidationPipe`
- Manejo centralizado de errores HTTP

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Variables soportadas:

- `PORT`: puerto HTTP de la API. Default `3000`
- `DATABASE_URL`: URL de Prisma. Default `file:./dev.db`
- `GEMINI_API_KEY`: clave de Gemini. Obligatoria solo para estimacion por IA
- `GEMINI_MODEL`: modelo Gemini. Default `gemini-1.5-flash`
- `AI_TIMEOUT_MS`: timeout de llamadas a IA. Default `8000`

Plantilla recomendada: `.env.example`

Ejemplo de configuracion local:

```bash
export PORT=3000
export DATABASE_URL="file:./dev.db"
export GEMINI_API_KEY="tu_clave"
export GEMINI_MODEL="gemini-1.5-flash"
export AI_TIMEOUT_MS=8000
```

### 3. Generar cliente Prisma y aplicar migraciones

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

### 4. Iniciar la API

```bash
npm run start:dev
```

Si `NODE_ENV` no es `production`, Swagger UI queda disponible en `/api`.

## Scripts utiles

```bash
npm run start:dev
npm run build
npm run lint
npm run test
npm run test:e2e
npm run verify
npm run prisma:generate
npm run prisma:migrate:dev
```

## Endpoints

### Tareas

- `POST /tasks`: crear tarea
- `GET /tasks`: listar tareas
- `GET /tasks/priority`: listar tareas por `iceScore`
- `GET /tasks/:id`: obtener detalle
- `PATCH /tasks/:id`: actualizar tarea
- `DELETE /tasks/:id`: eliminar tarea

### ICE

- `POST /tasks/:id/ice/manual`: asignar ICE manual
- `POST /tasks/:id/ice/estimate`: estimar ICE mediante IA

## Modelo de datos

La entidad principal es `Task`, con estos campos relevantes:

- `id`
- `title`
- `description`
- `status`
- `impact`
- `confidence`
- `effort`
- `iceScore`
- `iceSource`
- `createdAt`
- `updatedAt`

La persistencia actual usa SQLite mediante Prisma.

## Arquitectura

La aplicacion sigue una estructura modular con separacion por capas:

- `src/modules/tasks`: contratos HTTP, orquestacion de tareas y endpoints ICE
- `src/modules/ice`: reglas de calculo ICE
- `src/modules/ai`: integracion con Gemini
- `src/infrastructure/persistence/prisma`: adaptador Prisma
- `src/config`: carga y validacion de configuracion

Documentacion complementaria disponible en el repositorio:

- `design/arquitectura-aplicacion-gestor-ice-nestjs.md`
- `design/plan-implementacion-gestor-ice-nestjs.md`
- `openapi/gestor-tareas-ice-mvp.openapi.yaml`
- `docs/development.md`
- `docs/api-examples.md`

## Calidad y validacion

Antes de cerrar cambios, el flujo esperado es:

```bash
npm run verify
```

Ese script ejecuta, en orden:

1. `npm run format`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

## Flujo Git

El repositorio usa un flujo simplificado basado en `dev` y `main`.

- las ramas de trabajo salen de `dev`
- las PR de funcionalidad apuntan a `dev`
- `main` queda reservado para integracion final y release

Detalles completos en `CONTRIBUTING.md`.
