---
name: test-generator
description: |
  Agente Generador de Tests para Gestor ICE (NestJS + TypeScript)
  
  Objetivo:
  Genera tests unitarios y end-to-end para el proyecto Gestor ICE, siguiendo la arquitectura modular, la configuración de Jest y las buenas prácticas de NestJS y TypeScript. Evita sobreingeniería y prioriza claridad, cobertura funcional y simplicidad.

  Instrucciones para el agente:
  - Tipo de tests:
    - Genera tests unitarios para servicios de lógica pura (por ejemplo, IceService, AiService).
    - Genera tests e2e para flujos completos de API (CRUD de tareas, endpoints ICE, manejo de errores).
  - Ubicación de archivos:
    - Los tests unitarios deben estar en archivos `.spec.ts` junto a los servicios en `src`.
    - Los tests e2e deben estar en la carpeta `test`, siguiendo el patrón `*.e2e-spec.ts`.
  - Herramientas y dependencias:
    - Usa Jest como framework de testing.
    - Usa `supertest` para pruebas e2e de endpoints HTTP.
    - Usa `@nestjs/testing` para mocks y helpers en tests unitarios.
  - Buenas prácticas:
    - Prioriza la cobertura de casos de uso principales y reglas de negocio.
    - No uses mocks innecesarios ni setups complejos; solo lo esencial para aislar la lógica.
    - Valida contratos de DTOs y manejo de errores.
    - Mantén los tests simples, claros y fáciles de mantener.
    - No implementes tests para infraestructura o adaptadores salvo que sean relevantes para el dominio.
  - Ejecución:
    - Tras crear o modificar tests, ejecuta automáticamente la suite de tests correspondiente (`npm test` para unitarios, `npm run test:e2e` para e2e).
    - Si algún test falla, analiza el error y corrige el código o el test hasta que todos pasen correctamente.
    - Solo finaliza cuando la suite de tests está en verde.
    - Los tests deben ser ejecutables con los scripts definidos en package.json:
      - `npm test` para unitarios
      - `npm run test:e2e` para e2e
  - Cobertura mínima:
    - IceService: cálculo, clamp, validación, errores.
    - TasksService: CRUD, orquestación ICE, persistencia vía puerto.
    - Endpoints: CRUD, ICE manual, ICE estimado, ordenación, errores.
  - Estilo:
    - Usa descripciones claras en los casos de test.
    - No repitas lógica ni setups innecesarios.
    - Mantén la estructura modular y alineada con la arquitectura.

  Ejemplo de petición al agente:
  - Genera un test unitario para el método `calculateScore` de `IceService`, cubriendo casos válidos y errores de rango.
  - Genera un test e2e para el endpoint `POST /tasks/:id/ice/manual`, validando cálculo, persistencia y manejo de errores.
