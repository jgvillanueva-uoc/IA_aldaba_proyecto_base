/**
 * Creates workflow labels and the six implementation issues from the project plan.
 */
const API_BASE_URL = 'https://api.github.com';

/**
 * Returns repository owner and name from GitHub Actions environment.
 * @returns {{ owner: string, repo: string }} Parsed repository coordinates.
 */
function getRepositoryContext() {
  const repository = process.env.GITHUB_REPOSITORY ?? '';
  const [owner, repo] = repository.split('/');

  if (!owner || !repo) {
    throw new Error('GITHUB_REPOSITORY is missing or invalid.');
  }

  return { owner, repo };
}

/**
 * Returns the GitHub token required to call the REST API.
 * @returns {string} Token string from workflow environment.
 */
function getToken() {
  const token = process.env.GITHUB_TOKEN ?? '';

  if (!token) {
    throw new Error('GITHUB_TOKEN is missing.');
  }

  return token;
}

/**
 * Executes a GitHub REST API request.
 * @param {string} path Relative API path.
 * @param {RequestInit} [options] Optional fetch configuration.
 * @returns {Promise<Response>} Fetch response object.
 */
async function githubRequest(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers ?? {});
  headers.set('Accept', 'application/vnd.github+json');
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-GitHub-Api-Version', '2022-11-28');

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

/**
 * Ensures a label exists in the repository.
 * @param {{ owner: string, repo: string }} repoContext Repository coordinates.
 * @param {{ name: string, color: string, description: string }} label Label definition.
 * @returns {Promise<void>} Resolves when the label exists.
 */
async function ensureLabel(repoContext, label) {
  const getResponse = await githubRequest(
    `/repos/${repoContext.owner}/${repoContext.repo}/labels/${encodeURIComponent(label.name)}`,
  );

  if (getResponse.ok) {
    return;
  }

  if (getResponse.status !== 404) {
    throw new Error(`Unable to read label ${label.name}. Status: ${getResponse.status}`);
  }

  const createResponse = await githubRequest(`/repos/${repoContext.owner}/${repoContext.repo}/labels`, {
    method: 'POST',
    body: JSON.stringify(label),
  });

  if (!createResponse.ok) {
    const body = await createResponse.text();
    throw new Error(`Unable to create label ${label.name}. Status: ${createResponse.status}. Body: ${body}`);
  }
}

/**
 * Lists all existing issues in the repository.
 * @param {{ owner: string, repo: string }} repoContext Repository coordinates.
 * @returns {Promise<Array<{ title: string }>>} Existing issues metadata.
 */
async function listExistingIssues(repoContext) {
  const response = await githubRequest(
    `/repos/${repoContext.owner}/${repoContext.repo}/issues?state=all&per_page=100`,
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to list issues. Status: ${response.status}. Body: ${body}`);
  }

  return response.json();
}

/**
 * Creates an issue if an issue with the same title does not already exist.
 * @param {{ owner: string, repo: string }} repoContext Repository coordinates.
 * @param {Array<{ title: string }>} existingIssues Existing issues list.
 * @param {{ title: string, body: string, assignees: string[], labels: string[] }} issue Issue payload.
 * @returns {Promise<void>} Resolves when the issue exists or has been created.
 */
async function ensureIssue(repoContext, existingIssues, issue) {
  const alreadyExists = existingIssues.some((currentIssue) => currentIssue.title === issue.title);

  if (alreadyExists) {
    console.log(`Issue already exists: ${issue.title}`);
    return;
  }

  const response = await githubRequest(`/repos/${repoContext.owner}/${repoContext.repo}/issues`, {
    method: 'POST',
    body: JSON.stringify(issue),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to create issue ${issue.title}. Status: ${response.status}. Body: ${body}`);
  }
}

/**
 * Builds the six implementation issues requested by the project manager flow.
 * @returns {Array<{ title: string, body: string, assignees: string[], labels: string[] }>} Issue definitions.
 */
function buildIssues() {
  return [
    {
      title: 'Fase 1: contrato de persistencia y adaptador inicial',
      labels: ['todo'],
      assignees: ['jorgegvillanueva'],
      body: `## Contexto
Fase 1 del plan de implementación del Gestor ICE MVP en NestJS + TypeScript.

Objetivo de la fase:
Preparar base de datos y abstraer persistencia para evitar acoplamiento futuro.

## Tarea a realizar
Implementar el bloque completo de persistencia inicial:
- Definir TaskRepositoryPort con operaciones mínimas: create, findById, findAll(sort?), update y delete.
- Implementar adaptador PrismaTaskRepository.
- Modelar entidad Task en schema Prisma.
- Generar migración inicial SQLite.
- Configurar inyección de dependencia en TasksModule para usar el puerto.

## Checklist
- [ ] Definir TaskRepositoryPort con operaciones CRUD mínimas
- [ ] Implementar PrismaTaskRepository
- [ ] Modelar Task en schema Prisma
- [ ] Generar migración inicial SQLite
- [ ] Configurar inyección del puerto en TasksModule

## Criterios de validación
- [ ] TasksService depende del puerto de repositorio, no de PrismaService
- [ ] El adaptador Prisma implementa todas las operaciones definidas en el contrato
- [ ] La migración inicial se aplica correctamente y crea la estructura esperada
- [ ] Ningún módulo fuera de infraestructura importa componentes de Prisma directamente

## Criterio de salida
Se puede crear y consultar una tarea a través del repositorio sin exponer Prisma fuera del adaptador.`,
    },
    {
      title: 'Fase 2: CRUD de tareas base',
      labels: ['todo'],
      assignees: ['jorgegvillanueva'],
      body: `## Contexto
Fase 2 del plan de implementación del Gestor ICE MVP en NestJS + TypeScript.

Objetivo de la fase:
Entregar endpoints CRUD base de Task según OpenAPI.

## Tarea a realizar
Implementar el CRUD base de tareas:
- Implementar DTOs CreateTask, UpdateTask y ListTasksQuery.
- Implementar TasksController y TasksService para POST /tasks, GET /tasks, GET /tasks/:id, PATCH /tasks/:id y DELETE /tasks/:id.
- Validar reglas de campos: title (3..120), description (max 200), status enum.
- Estandarizar errores 400 y 404 con formato común.

## Checklist
- [ ] Implementar DTOs CreateTask, UpdateTask y ListTasksQuery
- [ ] Implementar endpoints CRUD en TasksController/TasksService
- [ ] Validar title, description y status según contrato
- [ ] Estandarizar errores 400 y 404

## Criterios de validación
- [ ] POST /tasks valida title y description según contrato
- [ ] GET /tasks/:id, PATCH /tasks/:id y DELETE /tasks/:id devuelven 404 cuando no existe la tarea
- [ ] PATCH /tasks/:id permite actualización parcial sin romper campos no enviados
- [ ] El formato de errores 400/404 es consistente en todos los endpoints CRUD

## Criterio de salida
Todos los endpoints CRUD responden con los códigos esperados por OpenAPI.`,
    },
    {
      title: 'Fase 3: dominio ICE manual',
      labels: ['todo'],
      assignees: ['jorgegvillanueva'],
      body: `## Contexto
Fase 3 del plan de implementación del Gestor ICE MVP en NestJS + TypeScript.

Objetivo de la fase:
Implementar reglas ICE en lógica pura y aplicación manual por endpoint.

## Tarea a realizar
Implementar el flujo completo de ICE manual:
- Implementar IceService con validateRange, calculateScore y clampValues.
- Implementar TasksIceController para POST /tasks/:id/ice/manual.
- Implementar TasksService.applyManualIce para resolver task, validar, calcular score y persistir impact/confidence/effort/iceScore/iceSource.
- Incorporar recálculo en PATCH cuando cambian campos ICE.

## Checklist
- [ ] Implementar IceService con validateRange, calculateScore y clampValues
- [ ] Implementar endpoint POST /tasks/:id/ice/manual
- [ ] Implementar caso de uso TasksService.applyManualIce
- [ ] Recalcular iceScore en PATCH cuando cambien campos ICE

## Criterios de validación
- [ ] POST /tasks/:id/ice/manual rechaza valores fuera de 1..10
- [ ] El cálculo aplica exactamente la fórmula definida y retorna entero redondeado
- [ ] PATCH /tasks/:id recalcula score cuando cambian impact, confidence o effort
- [ ] iceSource queda en manual tras asignación manual

## Criterio de salida
iceScore siempre consistente tras cambios manuales de ICE.`,
    },
    {
      title: 'Fase 4: priorización por score ICE',
      labels: ['todo'],
      assignees: ['jorgegvillanueva'],
      body: `## Contexto
Fase 4 del plan de implementación del Gestor ICE MVP en NestJS + TypeScript.

Objetivo de la fase:
Exponer listado priorizado por ICE.

## Tarea a realizar
Implementar el listado priorizado:
- Extender listTasks para soportar sort=ice.
- Resolver orden descendente por iceScore en repositorio.
- Asegurar fallback a orden por createdAt cuando no hay sort.

## Checklist
- [ ] Soportar query sort=ice en listTasks
- [ ] Resolver orden descendente por iceScore en repositorio
- [ ] Asegurar fallback por createdAt cuando no hay sort

## Criterios de validación
- [ ] GET /tasks?sort=ice ordena estrictamente en descendente por iceScore
- [ ] GET /tasks sin query mantiene orden por defecto (createdAt)
- [ ] La ordenación se mantiene estable ante tareas con score iguales
- [ ] El endpoint conserva tiempo de respuesta aceptable con volumen de prueba del curso

## Criterio de salida
Listado priorizado devuelve tareas de mayor a menor score.`,
    },
    {
      title: 'Fase 5: integración IA para estimación ICE',
      labels: ['todo'],
      assignees: ['jorgegvillanueva'],
      body: `## Contexto
Fase 5 del plan de implementación del Gestor ICE MVP en NestJS + TypeScript.

Objetivo de la fase:
Integrar proveedor IA para estimar ICE desde description.

## Tarea a realizar
Implementar el flujo completo de estimación IA:
- Implementar AiService como adaptador HTTP con prompt JSON estricto, timeout configurable y parseo estructural.
- Implementar TasksService.estimateIceWithAi para cargar description, solicitar estimación, normalizar/clamp con IceService, calcular iceScore y persistir valores ICE + metadatos IA.
- Implementar endpoint POST /tasks/:id/ice/estimate.
- Mapear errores externos a AI_UNAVAILABLE (502).

## Checklist
- [ ] Implementar AiService como adaptador HTTP
- [ ] Implementar TasksService.estimateIceWithAi
- [ ] Implementar endpoint POST /tasks/:id/ice/estimate
- [ ] Mapear errores externos a AI_UNAVAILABLE (502)

## Criterios de validación
- [ ] POST /tasks/:id/ice/estimate devuelve 404 si la tarea no existe
- [ ] En respuesta válida del proveedor IA, la tarea se actualiza con valores ICE, iceScore, iceSource=ai y metadatos IA
- [ ] Si hay timeout o payload inválido, la API devuelve 502 con AI_UNAVAILABLE
- [ ] El clamp de valores IA se aplica en IceService, no en AiService

## Criterio de salida
Estimación IA devuelve 200 en camino feliz y 502 en fallos controlados.`,
    },
    {
      title: 'Fase 6: calidad mínima y robustez',
      labels: ['todo'],
      assignees: ['jorgegvillanueva'],
      body: `## Contexto
Fase 6 del plan de implementación del Gestor ICE MVP en NestJS + TypeScript.

Objetivo de la fase:
Asegurar estabilidad del MVP antes de cierre.

## Tarea a realizar
Completar la fase de calidad mínima:
- Crear unit tests de IceService para fórmula, redondeo, rangos y effort inválido.
- Crear E2E tests críticos: CRUD base, ICE manual, ICE estimate (éxito + 502) y sort=ice.
- Revisar manejo de errores y mensajes consistentes.
- Revisar configuración final de entorno y defaults seguros.

## Checklist
- [ ] Crear unit tests de IceService
- [ ] Crear E2E tests críticos del MVP
- [ ] Revisar consistencia de errores y mensajes
- [ ] Revisar configuración final y defaults seguros

## Criterios de validación
- [ ] Los tests unitarios de IceService cubren fórmula, redondeo y validaciones de rango
- [ ] Los e2e críticos cubren CRUD, ICE manual, estimate IA y priorización
- [ ] No existen regresiones funcionales frente al contrato OpenAPI
- [ ] El proyecto puede ejecutarse de extremo a extremo con una configuración local documentada

## Criterio de salida
Pruebas críticas en verde y criterios funcionales del MVP cumplidos.`,
    },
  ];
}

/**
 * Main entry point for label and issue bootstrap.
 * @returns {Promise<void>} Resolves when labels and issues have been ensured.
 */
async function main() {
  const repoContext = getRepositoryContext();
  const labels = [
    { name: 'todo', color: '0E8A16', description: 'Workflow status: todo' },
    { name: 'doing', color: 'FBCA04', description: 'Workflow status: doing' },
    { name: 'done', color: '5319E7', description: 'Workflow status: done' },
  ];

  for (const label of labels) {
    await ensureLabel(repoContext, label);
  }

  const existingIssues = await listExistingIssues(repoContext);
  const issues = buildIssues();

  for (const issue of issues) {
    await ensureIssue(repoContext, existingIssues, issue);
  }
}

await main();
