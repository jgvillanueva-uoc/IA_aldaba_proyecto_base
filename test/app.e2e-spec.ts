/**
 * Covers end-to-end behavior for task listing and ICE prioritization.
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';

interface TaskResponse {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  readonly impact: number | null;
  readonly confidence: number | null;
  readonly effort: number | null;
  readonly iceScore: number | null;
  readonly iceSource: 'MANUAL' | 'AI' | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Returns the HTTP server handle with the type expected by supertest.
 * @param app Initialized Nest application.
 * @returns HTTP server instance compatible with supertest request helpers.
 */
function getHttpServer(app: INestApplication): App {
  return app.getHttpServer() as App;
}

/**
 * Creates a Nest application configured like the production bootstrap.
 * @returns Initialized Nest application and Prisma facade for test cleanup.
 */
async function createTestApplication(): Promise<{
  readonly app: INestApplication;
  readonly prismaService: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();

  return {
    app,
    prismaService: app.get(PrismaService),
  };
}

/**
 * Creates one task through the public HTTP API.
 * @param app Initialized Nest application.
 * @param title Task title used for identification in assertions.
 * @returns Created task payload returned by the API.
 */
async function createTask(
  app: INestApplication,
  title: string,
): Promise<TaskResponse> {
  const response = await request(getHttpServer(app))
    .post('/tasks')
    .send({
      title,
      description: `${title} description`,
    })
    .expect(201);

  return response.body as TaskResponse;
}

/**
 * Assigns manual ICE values to an existing task using the public API.
 * @param app Initialized Nest application.
 * @param id Task identifier.
 * @param impact ICE impact value.
 * @param confidence ICE confidence value.
 * @param effort ICE effort value.
 */
async function applyManualIce(
  app: INestApplication,
  id: string,
  impact: number,
  confidence: number,
  effort: number,
): Promise<void> {
  await request(getHttpServer(app))
    .post(`/tasks/${id}/ice/manual`)
    .send({ impact, confidence, effort })
    .expect(201);
}

/**
 * Waits one event-loop slice to increase the chance of different timestamps.
 * @returns Promise resolved after a short delay.
 */
async function waitForTimestampTick(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, 5);
  });
}

describe('Tasks listing (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const testApplication = await createTestApplication();

    app = testApplication.app;
    prismaService = testApplication.prismaService;
  });

  beforeEach(async () => {
    await prismaService.task.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns tasks ordered by createdAt descending when sort is omitted', async () => {
    const firstTask = await createTask(app, 'first task');
    await waitForTimestampTick();
    const secondTask = await createTask(app, 'second task');

    const response = await request(getHttpServer(app))
      .get('/tasks')
      .expect(200);
    const tasks = response.body as TaskResponse[];

    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.id).toBe(secondTask.id);
    expect(tasks[1]?.id).toBe(firstTask.id);
  });

  it('returns tasks ordered by iceScore descending with createdAt tie-breaker', async () => {
    const highestTask = await createTask(app, 'highest score');
    await waitForTimestampTick();
    const lowestTask = await createTask(app, 'lowest score');
    await waitForTimestampTick();
    const olderTieTask = await createTask(app, 'older tie score');
    await waitForTimestampTick();
    const newerTieTask = await createTask(app, 'newer tie score');

    await applyManualIce(app, highestTask.id, 10, 10, 1);
    await applyManualIce(app, lowestTask.id, 2, 5, 10);
    await applyManualIce(app, olderTieTask.id, 6, 6, 6);
    await applyManualIce(app, newerTieTask.id, 3, 10, 5);

    return request(getHttpServer(app))
      .get('/tasks?sort=ice')
      .expect(200)
      .expect(({ body }: { readonly body: TaskResponse[] }) => {
        expect(body).toHaveLength(4);
        expect(body.map((task) => task.id)).toEqual([
          highestTask.id,
          newerTieTask.id,
          olderTieTask.id,
          lowestTask.id,
        ]);
        expect(body.map((task) => task.iceScore)).toEqual([1000, 60, 60, 10]);
      });
  });
});
