# API Examples

Ejemplos rapidos de requests y responses para la API de Gestor ICE.

## Root

### GET /

```http
GET / HTTP/1.1
Host: localhost:3000
```

```json
"Hello World!"
```

## Tasks

### POST /tasks

```http
POST /tasks HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Implement priority endpoint",
  "description": "Expose a route to list tasks ordered by ICE score",
  "status": "TODO"
}
```

```json
{
  "id": "cm8x123task001",
  "title": "Implement priority endpoint",
  "description": "Expose a route to list tasks ordered by ICE score",
  "status": "TODO",
  "impact": null,
  "confidence": null,
  "effort": null,
  "iceScore": null,
  "iceSource": null,
  "createdAt": "2026-03-17T10:00:00.000Z",
  "updatedAt": "2026-03-17T10:00:00.000Z"
}
```

### GET /tasks

```http
GET /tasks?sort=ice HTTP/1.1
Host: localhost:3000
```

```json
[
  {
    "id": "cm8x123task002",
    "title": "Add Swagger docs",
    "description": "Document API endpoints and payloads",
    "status": "IN_PROGRESS",
    "impact": 8,
    "confidence": 7,
    "effort": 3,
    "iceScore": 186,
    "iceSource": "MANUAL",
    "createdAt": "2026-03-17T09:00:00.000Z",
    "updatedAt": "2026-03-17T09:15:00.000Z"
  }
]
```

### GET /tasks/priority

```http
GET /tasks/priority?order=desc HTTP/1.1
Host: localhost:3000
```

```json
[
  {
    "id": "cm8x123task002",
    "title": "Add Swagger docs",
    "description": "Document API endpoints and payloads",
    "status": "IN_PROGRESS",
    "impact": 8,
    "confidence": 7,
    "effort": 3,
    "iceScore": 186,
    "iceSource": "MANUAL",
    "createdAt": "2026-03-17T09:00:00.000Z",
    "updatedAt": "2026-03-17T09:15:00.000Z"
  },
  {
    "id": "cm8x123task003",
    "title": "Refine README",
    "description": "Replace Nest starter docs with project-specific onboarding",
    "status": "TODO",
    "impact": null,
    "confidence": null,
    "effort": null,
    "iceScore": null,
    "iceSource": null,
    "createdAt": "2026-03-17T10:20:00.000Z",
    "updatedAt": "2026-03-17T10:20:00.000Z"
  }
]
```

### GET /tasks/:id

```http
GET /tasks/cm8x123task002 HTTP/1.1
Host: localhost:3000
```

```json
{
  "id": "cm8x123task002",
  "title": "Add Swagger docs",
  "description": "Document API endpoints and payloads",
  "status": "IN_PROGRESS",
  "impact": 8,
  "confidence": 7,
  "effort": 3,
  "iceScore": 186,
  "iceSource": "MANUAL",
  "createdAt": "2026-03-17T09:00:00.000Z",
  "updatedAt": "2026-03-17T09:15:00.000Z"
}
```

### PATCH /tasks/:id

```http
PATCH /tasks/cm8x123task002 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "status": "DONE",
  "impact": 9,
  "confidence": 8,
  "effort": 3
}
```

```json
{
  "id": "cm8x123task002",
  "title": "Add Swagger docs",
  "description": "Document API endpoints and payloads",
  "status": "DONE",
  "impact": 9,
  "confidence": 8,
  "effort": 3,
  "iceScore": 216,
  "iceSource": "MANUAL",
  "createdAt": "2026-03-17T09:00:00.000Z",
  "updatedAt": "2026-03-17T10:35:00.000Z"
}
```

### DELETE /tasks/:id

```http
DELETE /tasks/cm8x123task002 HTTP/1.1
Host: localhost:3000
```

Response: `204 No Content`

## ICE

### POST /tasks/:id/ice/manual

```http
POST /tasks/cm8x123task002/ice/manual HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "impact": 8,
  "confidence": 7,
  "effort": 3
}
```

```json
{
  "id": "cm8x123task002",
  "title": "Add Swagger docs",
  "description": "Document API endpoints and payloads",
  "status": "IN_PROGRESS",
  "impact": 8,
  "confidence": 7,
  "effort": 3,
  "iceScore": 186,
  "iceSource": "MANUAL",
  "createdAt": "2026-03-17T09:00:00.000Z",
  "updatedAt": "2026-03-17T09:15:00.000Z"
}
```

### POST /tasks/:id/ice/estimate

```http
POST /tasks/cm8x123task002/ice/estimate HTTP/1.1
Host: localhost:3000
```

```json
{
  "id": "cm8x123task002",
  "title": "Add Swagger docs",
  "description": "Document API endpoints and payloads",
  "status": "IN_PROGRESS",
  "impact": 7,
  "confidence": 8,
  "effort": 2,
  "iceScore": 224,
  "iceSource": "AI",
  "createdAt": "2026-03-17T09:00:00.000Z",
  "updatedAt": "2026-03-17T09:20:00.000Z"
}
```

## Error example

### 400 ValidationError

```json
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "order must be one of the following values: asc, desc",
  "timestamp": "2026-03-17T10:40:00.000Z",
  "path": "/tasks/priority?order=invalid"
}
```

### 404 NotFoundError

```json
{
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "Task not found",
  "timestamp": "2026-03-17T10:41:00.000Z",
  "path": "/tasks/cm8x999missing"
}
```

### 502 AiUnavailableError

```json
{
  "statusCode": 502,
  "error": "AI_UNAVAILABLE",
  "message": "Gemini API key is not configured",
  "timestamp": "2026-03-17T10:42:00.000Z",
  "path": "/tasks/cm8x123task002/ice/estimate"
}
```