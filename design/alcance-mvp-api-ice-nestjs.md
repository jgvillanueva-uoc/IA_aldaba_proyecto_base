# Alcance Funcional MVP

## API Gestor de Tareas Inteligente con ICE (NestJS, sin frontend)

## 1. Objetivo del MVP

Construir una API REST sencilla en NestJS para gestionar tareas y priorizarlas con modelo ICE, incluyendo una capacidad de IA para estimar Impacto, Confianza y Esfuerzo a partir de una descripción textual.

Este MVP está pensado para un curso de NestJS, por lo que prioriza:

- Simplicidad de implementación.
- Separación clara por módulos.
- Buenas prácticas básicas (DTOs, validación, servicios, guards opcionales).
- Costo cero o bajo usando una API de IA gratuita (por ejemplo, Hugging Face Inference API en plan gratuito).

## 2. Alcance incluido (In Scope)

### 2.1 Gestión de tareas (CRUD)

- Crear tarea.
- Listar tareas.
- Obtener detalle de tarea.
- Actualizar tarea.
- Eliminar tarea.

Campos mínimos de tarea:

- id
- title
- description (texto libre, máx. 200 chars; usado también como input para la estimación IA)
- aiDescription (texto libre, máx. 200 chars; descripción enriquecida devuelta por la API de IA remota)
- status (`TODO`, `IN_PROGRESS`, `DONE`)
- dueDate (opcional)
- iceSource (`manual`, `ai`)
- aiJustification (texto corto; justificación de la estimación IA)
- createdAt
- updatedAt

### 2.2 Modelo ICE

- Cada tarea tiene atributos ICE:
- impact (1-10)
- confidence (1-10)
- effort (1-10)
- iceScore (calculado)

Fórmula del MVP:

`iceScore = round((impact * confidence) / effort * 10)`

Escala de resultado: 0 a 100, entero sin decimales.

Reglas:

- effort nunca puede ser 0.
- Resultado redondeado al entero más cercano.
- Si se actualiza impact, confidence o effort, se recalcula iceScore automáticamente.

### 2.3 Estimación ICE con IA desde descripción

- Endpoint para estimar ICE a partir de la descripción de la tarea.
- El servicio IA devuelve una propuesta de `impact`, `confidence`, `effort` y `aiJustification` (breve justificación).
- El usuario puede aceptar la estimación y guardarla en la tarea.

Flujo simple recomendado:

1. Usuario envía texto de descripción.
2. API llama a proveedor IA gratuito.
3. API normaliza respuesta al formato interno.
4. API devuelve sugerencia ICE.
5. Usuario confirma y persiste.

### 2.4 Priorización

- Endpoint para listar tareas ordenadas por `iceScore` descendente (`GET /tasks?sort=ice`).
- Sin filtros adicionales en el MVP.

### 2.5 Historial mínimo (opcional si hay tiempo)

- Guardar timestamp de la última estimación IA.
- Guardar origen del ICE (`manual` o `ai_suggested`).

## 3. Fuera de alcance (Out of Scope)

- Frontend web o móvil.
- Multi-tenant complejo.
- RBAC avanzado.
- Automatizaciones complejas (reglas, webhooks).
- Integraciones con Jira/Slack/Calendar.
- Analítica avanzada o dashboards BI.
- Entrenamiento de modelos propios.

## 4. Diseño técnico simplificado (NestJS)

## 4.1 Módulos sugeridos

- `tasks` (CRUD + priorización)
- `ice` (cálculo + validaciones + estimación IA)
- `ai` (adaptador al proveedor externo)

## 4.2 Persistencia

Persistencia única: **SQLite + Prisma**.

- Un solo fichero `.db` local, sin servidor de base de datos.
- Prisma como ORM: tipado, migraciones simples y buena integración con NestJS.

### Modelo de datos mínimo

- Task

Task incluye:

- Campos base (ver §2.1).
- impact, confidence, effort, iceScore.

## 4.3 Integración IA gratuita (sugerencia práctica)

Proveedor: **Google Gemini API (Developer / Free Tier)**.

Implementación directa con `AiService`:

1. Construir prompt con instrucción de formato JSON estricto.
2. Llamar a la API con `fetch` o `axios`.
3. Parsear y validar JSON de respuesta.
4. Aplicar clamps (1-10) sobre impact, confidence, effort.
5. Devolver objeto tipado `IceEstimation`.

Manejo de errores:

- Timeout de 8s.
- Si la llamada falla o la respuesta no es válida, devolver error estructurado:
  ```json
  { "statusCode": 502, "error": "AI_UNAVAILABLE", "message": "<detalle>" }
  ```

## 5. Endpoints MVP (contrato funcional)

### Tasks

- `POST /tasks`
- `GET /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

### ICE

- `POST /tasks/:id/ice/manual` (asignar valores ICE manualmente)
- `POST /tasks/:id/ice/estimate` (estimar ICE con IA usando la `description` de la tarea)
- `GET /tasks?sort=ice` (listar tareas ordenadas por iceScore desc)

## 6. Reglas de validación

- title: requerido, 3-120 chars.
- description: requerido, texto libre, máx. 200 chars (también usado como input para la IA).
- impact/confidence/effort: enteros 1-10.
- status: enum permitido.
- aiDescription: opcional, texto libre, máx. 200 chars (campo escrito por la IA).
- aiJustification: opcional, texto libre, máx. 200 chars.

## 7. Criterios de aceptación del MVP

### Criterio A: CRUD funcional

- Se crean, consultan, actualizan y eliminan tareas correctamente.

### Criterio B: ICE manual

- API calcula `iceScore` correctamente con la fórmula definida.

### Criterio C: ICE con IA

- Dada una descripción, la API devuelve una sugerencia válida (`impact`, `confidence`, `effort`, `aiJustification`).
- Si se acepta, se persiste en la tarea.

### Criterio D: Priorización

- El endpoint priorizado devuelve tareas ordenadas por score de mayor a menor.

### Criterio E: Manejo de error básico

- Si falla la IA externa, la API responde con error controlado o fallback documentado.

## 8. Historias de usuario mínimas

1. Como estudiante, quiero crear tareas para practicar el CRUD en NestJS.
2. Como estudiante, quiero calcular ICE manual para entender el modelo.
3. Como estudiante, quiero estimar ICE con IA desde una descripción para automatizar priorización.
4. Como estudiante, quiero ver mi lista priorizada para decidir qué tarea hacer primero.

## 9. Plan de implementación por fases (curso)

### Fase 1

- Bootstrapping NestJS.
- CRUD Tasks.

### Fase 2

- ICE manual + fórmula + validaciones.
- Endpoint de priorización.

### Fase 3

- Integración Google Gemini API.
- Endpoint `POST /tasks/:id/ice/estimate`.
- Persistencia de sugerencia en tarea.

### Fase 4 (si hay tiempo)

- Tests E2E de endpoints críticos.

## 10. Definición de simpleza para este curso

El MVP se considera "simple" si cumple:

- Menos de 4 módulos NestJS.
- Máximo 2 entidades principales.
- Un solo proveedor IA.
- Sin colas, sin microservicios, sin frontend.
- Despliegue local con `.env` y una base SQLite.

## 11. Variables de entorno sugeridas

- `PORT`
- `DATABASE_URL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (ej. `gemini-1.5-flash`)
- `AI_TIMEOUT_MS`

## 12. Riesgos y mitigaciones

- Riesgo: cuota o latencia de Gemini free tier.
- Mitigación: timeout de 8s + error estructurado `AI_UNAVAILABLE`.

- Riesgo: salida IA no estructurada.
- Mitigación: prompt con formato JSON estricto + validación de esquema.

- Riesgo: complejidad para alumnos principiantes.
- Mitigación: separar módulo `ai` y dejar intercambiable por mock.

## 13. Entregable esperado del MVP

Una API NestJS ejecutable localmente que permita:

- CRUD de tareas.
- Cálculo ICE manual.
- Estimación ICE por IA desde descripción.
- Lista priorizada por score ICE.

Con esto tienes un MVP pedagógico, funcional y suficientemente simple para un curso práctico de NestJS.
