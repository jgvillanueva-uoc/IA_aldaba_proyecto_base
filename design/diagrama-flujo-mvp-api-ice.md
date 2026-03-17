# Diagrama de Flujo Funcional

## Gestor de Tareas ICE (Backend NestJS + IA remota)

Este diagrama describe los procesos principales del backend para CRUD de tareas, estimacion ICE manual y por IA, priorizacion, y manejo de errores de la API remota.

```mermaid
flowchart TD
    A[Inicio: cliente invoca API] --> B{Operacion solicitada}

    B -->|POST /tasks| C[Validar DTO CreateTask]
    C -->|Invalido| C1[400 Validation Error]
    C -->|Valido| D[Persistir Task en SQLite con Prisma]
    D --> E[201 Created + payload Task]

    B -->|GET /tasks| F{sort=ice?}
    F -->|No| G[Listar tareas por createdAt]
    F -->|Si| H[Listar tareas por iceScore desc]
    G --> I[200 OK lista tareas]
    H --> I

    B -->|GET /tasks/:id| J[Buscar tarea por id]
    J -->|No existe| J1[404 Not Found]
    J -->|Existe| J2[200 OK detalle tarea]

    B -->|PATCH /tasks/:id| K[Validar DTO UpdateTask]
    K -->|Invalido| K1[400 Validation Error]
    K -->|Valido| L[Buscar tarea por id]
    L -->|No existe| L1[404 Not Found]
    L -->|Existe| M{Cambio en impact/confidence/effort?}
    M -->|Si| N[Recalcular iceScore]
    M -->|No| O[Actualizar campos sin recalculo]
    N --> P[Persistir actualizacion]
    O --> P
    P --> Q[200 OK tarea actualizada]

    B -->|DELETE /tasks/:id| R[Buscar tarea por id]
    R -->|No existe| R1[404 Not Found]
    R -->|Existe| S[Eliminar tarea]
    S --> T[204 No Content]

    B -->|POST /tasks/:id/ice/manual| U[Validar DTO ICE manual]
    U -->|Invalido| U1[400 Validation Error]
    U -->|Valido| V[Buscar tarea por id]
    V -->|No existe| V1[404 Not Found]
    V -->|Existe| W[Aplicar impact/confidence/effort]
    W --> X[Calcular iceScore]
    X --> Y[Set iceSource=manual]
    Y --> Z[Persistir y responder 200 OK]

    B -->|POST /tasks/:id/ice/estimate| AA[Buscar tarea por id]
    AA -->|No existe| AA1[404 Not Found]
    AA -->|Existe| AB[Tomar description de Task]
    AB --> AC[Construir prompt JSON estricto]
    AC --> AD[Llamar API remota IA (timeout 8s)]

    AD -->|Falla red/timeout| AE[Mapear a 502 AI_UNAVAILABLE]
    AD -->|Respuesta| AF[Parsear JSON y validar esquema]
    AF -->|Invalido| AG[502 AI_UNAVAILABLE respuesta invalida]
    AF -->|Valido| AH[Normalizar y clamp 1..10]
    AH --> AI[Calcular iceScore sugerido]
    AI --> AJ[Persistir sugerencia y metadatos IA]
    AJ --> AK[Set iceSource=ai]
    AK --> AL[200 OK tarea con ICE sugerido]

    style AE fill:#ffe5e5,stroke:#cc0000,color:#111
    style AG fill:#ffe5e5,stroke:#cc0000,color:#111
    style C1 fill:#fff2cc,stroke:#c8a600,color:#111
    style K1 fill:#fff2cc,stroke:#c8a600,color:#111
    style U1 fill:#fff2cc,stroke:#c8a600,color:#111
    style J1 fill:#f2f2f2,stroke:#666,color:#111
    style L1 fill:#f2f2f2,stroke:#666,color:#111
    style R1 fill:#f2f2f2,stroke:#666,color:#111
    style V1 fill:#f2f2f2,stroke:#666,color:#111
    style AA1 fill:#f2f2f2,stroke:#666,color:#111
```

## Notas funcionales

- El calculo de `iceScore` se aplica siempre que cambien `impact`, `confidence` o `effort`.
- La integracion con IA se encapsula para poder reemplazar proveedor sin afectar el modulo ICE.
- Los errores de IA externa se transforman en error de dominio controlado (`AI_UNAVAILABLE`).
- La priorizacion usa `GET /tasks?sort=ice` con orden descendente por score.
