# Prompt: Verify OpenAPI and Swagger Alignment

## Task
Analyze the NestJS project and check that the OpenAPI contract (openapi/gestor-tareas-ice-mvp.openapi.yaml) and Swagger documentation are up-to-date and correct. Report any discrepancies between the OpenAPI file, controller routes, DTOs, and actual API behavior.

## Inputs
- openapi/gestor-tareas-ice-mvp.openapi.yaml
- All controller files in src/modules/
- All DTO files in src/modules/
- Project conventions (REST, error shape, DTO validation)

## Output
- List of endpoints missing or mismatched between OpenAPI and code
- DTO validation mismatches
- Error response shape inconsistencies
- Suggestions for fixes (update OpenAPI, controller, DTO, or Swagger decorators)

## Example invocation
"Check if the OpenAPI contract and Swagger docs match the implemented endpoints and DTOs. List any differences and propose fixes."
