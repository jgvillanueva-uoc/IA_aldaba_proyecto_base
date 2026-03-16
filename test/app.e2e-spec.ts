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

interface GeminiApiSuccessResponse {
  readonly candidates: readonly [
    {
      readonly content: {
        readonly parts: readonly [
          {
            readonly text: string;
          },
        ];
      };
    },
  ];
}

type FetchMock = jest.Mock<Promise<Response>, Parameters<typeof fetch>>;

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
  describe('Tasks CRUD endpoints (e2e)', () => {
    let task: TaskResponse;

    beforeEach(async () => {
      task = await createTask(app, 'crud test');
    });

    it('creates a task (POST /tasks)', async () => {
      const response = await request(getHttpServer(app))
        .post('/tasks')
        .send({ title: 'new task', description: 'desc' })
        .expect(201);
      expect(response.body).toMatchObject({
        title: 'new task',
        description: 'desc',
        status: 'TODO',
      });
      expect(response.body.id).toBeDefined();
    });

    it('gets a task by id (GET /tasks/:id)', async () => {
      const response = await request(getHttpServer(app))
        .get(`/tasks/${task.id}`)
        .expect(200);
      expect(response.body).toMatchObject({ id: task.id, title: task.title });
    });

    it('updates a task (PATCH /tasks/:id)', async () => {
      const response = await request(getHttpServer(app))
        .patch(`/tasks/${task.id}`)
        .send({ title: 'updated', impact: 5, confidence: 5, effort: 5 })
        .expect(200);
      expect(response.body.title).toBe('updated');
      expect(response.body.impact).toBe(5);
      expect(response.body.iceScore).toBe(50);
      expect(response.body.iceSource).toBe('MANUAL');
    });

    it('deletes a task (DELETE /tasks/:id)', async () => {
      await request(getHttpServer(app)).delete(`/tasks/${task.id}`).expect(204);
      await request(getHttpServer(app)).get(`/tasks/${task.id}`).expect(404);
    });

    it('returns 404 for non-existent task', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(getHttpServer(app)).get(`/tasks/${fakeId}`).expect(404);
      await request(getHttpServer(app))
        .patch(`/tasks/${fakeId}`)
        .send({ title: 'xxx' })
        .expect(404);
      await request(getHttpServer(app)).delete(`/tasks/${fakeId}`).expect(404);
    });
  });
  describe('Manual ICE DTO validation (e2e)', () => {
    let task: TaskResponse;

    beforeEach(async () => {
      task = await createTask(app, 'dto validation');
    });

    it('rejects values below 1 or above 10', async () => {
      await request(getHttpServer(app))
        .post(`/tasks/${task.id}/ice/manual`)
        .send({ impact: 0, confidence: 11, effort: 5 })
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toEqual(expect.any(String));
          expect(body.message).toContain('impact must not be less than 1');
          expect(body.message).toContain(
            'confidence must not be greater than 10',
          );
        });
    });

    it('rejects missing required fields', async () => {
      await request(getHttpServer(app))
        .post(`/tasks/${task.id}/ice/manual`)
        .send({ impact: 5 })
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toEqual(expect.any(String));
          expect(body.message).toMatch(/confidence/);
          expect(body.message).toMatch(/effort/);
        });
    });

    it('rejects non-integer values', async () => {
      await request(getHttpServer(app))
        .post(`/tasks/${task.id}/ice/manual`)
        .send({ impact: 5.5, confidence: 'high', effort: 3 })
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toEqual(expect.any(String));
          expect(body.message).toContain('impact must be an integer number');
          expect(body.message).toContain(
            'confidence must be an integer number',
          );
        });
    });
  });
  let app: INestApplication;
  let prismaService: PrismaService;
  let fetchMock: FetchMock;
  const originalFetch = global.fetch;

  beforeAll(async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.GEMINI_MODEL = 'gemini-test-model';
    process.env.AI_TIMEOUT_MS = '100';
    fetchMock = jest.fn<Promise<Response>, Parameters<typeof fetch>>();
    global.fetch = fetchMock as typeof fetch;

    const testApplication = await createTestApplication();

    app = testApplication.app;
    prismaService = testApplication.prismaService;
  });

  beforeEach(async () => {
    await prismaService.task.deleteMany();
    fetchMock.mockReset();
  });

  afterAll(async () => {
    global.fetch = originalFetch;
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

  it('estimates ICE with AI and persists the clamped result', async () => {
    const task = await createTask(app, 'ai estimated task');

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '{"impact":11,"confidence":8,"effort":0}',
                  },
                ],
              },
            },
          ],
        } satisfies GeminiApiSuccessResponse),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await request(getHttpServer(app))
      .post(`/tasks/${task.id}/ice/estimate`)
      .expect(200)
      .expect(({ body }: { readonly body: TaskResponse }) => {
        expect(body.impact).toBe(10);
        expect(body.confidence).toBe(8);
        expect(body.effort).toBe(1);
        expect(body.iceScore).toBe(800);
        expect(body.iceSource).toBe('AI');
      });
  });

  it('returns 404 when AI estimation targets a missing task', async () => {
    await request(getHttpServer(app))
      .post('/tasks/missing-task/ice/estimate')
      .expect(404)
      .expect(({ body }: { readonly body: { readonly error: string } }) => {
        expect(body.error).toBe('NOT_FOUND');
      });
  });

  it('returns 502 when the AI provider payload is invalid', async () => {
    const task = await createTask(app, 'invalid ai payload task');

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '{"impact":"invalid","confidence":8}',
                  },
                ],
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await request(getHttpServer(app))
      .post(`/tasks/${task.id}/ice/estimate`)
      .expect(502)
      .expect(
        ({
          body,
        }: {
          readonly body: {
            readonly error: string;
            readonly message: string;
          };
        }) => {
          expect(body.error).toBe('AI_UNAVAILABLE');
          expect(body.message).toContain('Invalid AI payload');
        },
      );
  });
});
