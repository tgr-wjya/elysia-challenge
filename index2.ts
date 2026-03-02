/**
 * Index.ts v2
 *
 * Five Task API endpoint:
 * 1. GET /tasks/:id
 * 2. GET /tasks/all
 * 3. POST /tasks
 * 4. PATCH /tasks/:id
 * 5. DELETE /tasks/:id
 *
 * Echo endpoint:
 * 1. POST /echo - for user body validation.
 *
 * @author Tegar Wijaya Kusuma
 * @date 24 - 27 February 2026
 */

/**
 * Import needed
 */
import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';

/**
 * Environment const for tasks.json and Port.
 */
const DATA_PATH = 'tasks.json';
const PORT = 3000;
const RATE_LIMIT_MS = 2000;
const ERROR_TASK_NOT_FOUND = 'Task not found, unfortunately.';
const MIN_USERNAME_LENGTH = 3;
const MIN_AGE = 1;
const MIN_DESCRIPTION_LENGTH = 4;
const IP = '127.0.0.1';
// TODO: Encapsulate the Map within a module or class with controlled access methods, or use Elysia's state management
export const lastRequestTime = new Map<string, number>();

/**
 * Task schema definition
 */
interface Task {
  id: number;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

// TODO: Add try-catch blocks around Bun.file operations in getTasks and saveTasks to handle potential file system errors
/**
 * Best practice for returning a JSON file type-safely.
 * @returns tasks.json
 */
const getTasks = async (): Promise<Task[]> => {
  const file = Bun.file(DATA_PATH);
  if (!(await file.exists())) return [];
  return (await file.json()) as Task[];
};

/**
 * Best practice for writing to a JSON file, type-safely.
 * @param tasks with Task schema as object
 */
const saveTasks = async (tasks: Task[]): Promise<void> => {
  await Bun.write(DATA_PATH, JSON.stringify(tasks, null, 2));
};

/**
 * === M1: Validation ===
 * Validate and return user body schema.
 */
export const echo = new Elysia().group('/echo', (app) =>
  app.post(
    '/',
    ({ body, set }) => {
      const echoData = {
        username: body.username,
        age: body.age,
      };

      set.status = 201;
      return echoData;
    },
    {
      // TODO: Extract validation constraints to named constants: MIN_USERNAME_LENGTH = 3, MIN_AGE = 1, MIN_DESCRIPTION_LENGTH = 4
      body: t.Object({
        username: t.String({ minLength: MIN_USERNAME_LENGTH }),
        age: t.Number({ minimum: MIN_AGE }),
      }),
    }
  )
);

/**
 * === taskGroup ===
 * Task API with 5 endpoint
 */
export const taskGroup = new Elysia().group('/tasks', (app) =>
  app

    /**
     * onError taskGroup global.
     */
    .onError(({ error }) => {
      return { error: error.message, timestamp: new Date().toISOString() };
    })

    /**
     * GET /tasks/all
     * Returns all tasks,
     * The @PROJECT-SPEC doesn't mention using /all but I thought it'd be a good addition.
     */
    .get('/all', async ({ set }) => {
      set.status = 200;
      return await getTasks();
    })

    // TODO: M8 Add onError whether globally or locally for custom error response. also formats it consistently all across the board.
    /**
     * GET /tasks/:id
     * Return a single task by its ID.
     */
    .get(
      '/:id',
      async ({ params, set }) => {
        const tasks = await getTasks();

        const getTaskById = tasks.find((t: Task) => t.id === params.id);

        if (!getTaskById) {
          set.status = 404;
          throw new Error(ERROR_TASK_NOT_FOUND);
        }

        set.status = 200;
        return getTaskById;
      },
      {
        params: t.Object({
          id: t.Numeric(),
        }),
        // Shi, I might need to keep everything locally for now because I haven't figured out how to make it global across the state.
        // Don't repeat yourself I know, I just don't want to force myself.
        beforeHandle: ({ store }) => {
          (store as any).capturedAt = Date.now();
        },
        afterHandle: ({ store, set }) => {
          const elapsed = Date.now() - (store as any).capturedAt;
          set.headers['X-Response-Time'] = String(`${elapsed} ms`);
          set.headers['X-Powered-By'] = 'Elysia + Bun';
          set.headers['Access-Control-Allow-Origin'] = '*';
        },
      }
    )

    /**
     * POST /tasks
     * Add new task to the list.
     */
    .post(
      '/',
      async ({ body, set }) => {
        const tasks = await getTasks();

        const newTask = {
          id: Date.now(),
          description: body.description,
          status: body.status,
        };

        tasks.push(newTask);
        await saveTasks(tasks);

        set.status = 201;
        return newTask;
      },
      {
        beforeHandle: ({ set }) => {
          const now = Date.now();
          const last = lastRequestTime.get(IP);

          if (last && now - last < RATE_LIMIT_MS) {
            set.status = 429;
            throw new Error('Too many request, bud. Slow down');
          }

          // TODO: Add JSDoc comment to POST /tasks endpoint noting the rate limiting side effect, or refactor to use Elysia plugins for cross-cutting concerns
          lastRequestTime.set(IP, now);
        },
        // TODO: Extract the task validation schema to a shared constant and reuse with t.Partial(TASK_SCHEMA)
        body: t.Object({
          description: t.String({ minLength: MIN_DESCRIPTION_LENGTH }),
          status: t.UnionEnum(['pending', 'in-progress', 'completed']),
        }),
      }
    )

    /**
     * PATCH /tasks/:id
     * Allow user to update task status or description.
     */
    .patch(
      '/:id',
      async ({ body, params, set }) => {
        const tasks = await getTasks();
        const taskIndex = tasks.findIndex((t: Task) => t.id === params.id);

        if (taskIndex === -1) {
          set.status = 404;
          throw new Error(ERROR_TASK_NOT_FOUND);
        }

        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...(body.description !== undefined && {
            description: body.description,
          }),
          ...(body.status !== undefined && { status: body.status }),
        } as Task;

        await saveTasks(tasks);
        set.status = 200;
        return tasks[taskIndex];
      },
      {
        params: t.Object({
          id: t.Numeric(),
        }),
        body: t.Partial(
          t.Object({
            description: t.String({ minLength: MIN_DESCRIPTION_LENGTH }),
            status: t.UnionEnum(['pending', 'in-progress', 'completed']),
          })
        ),
      }
    )

    .delete(
      '/:id',
      async ({ params, set }) => {
        const tasks = await getTasks();
        const remainingTask = tasks.filter((t) => t.id !== params.id);

        if (remainingTask.length === tasks.length) {
          set.status = 404;
          throw new Error(ERROR_TASK_NOT_FOUND);
        }

        await saveTasks(remainingTask);
        set.status = 200;
        return remainingTask;
      },
      {
        params: t.Object({
          id: t.Numeric(),
        }),
      }
    )
);

/**
 * Elysia server definition goes here.
 */
export const app = new Elysia()
  // Server greeting
  .get('/', () => ({
    kaomoji: 'made with ◉‿◉',
    author: 'Tegar Wijaya Kusuma',
  }))

  .get('/info', async ({ server, request }) => {
    const socket = server?.requestIP(request);
    return { address: socket?.address };
  })

  //TODO: M9 Add derive for returning metadata (IP, timestamps, user-agent)
  // Contains echo, taskGroup and Swagger Elysia .group()
  .use(echo)
  .use(taskGroup)
  .use(swagger())

  // TODO: Add global onError to handle displaying consistent error: 'Not found ¯\\_(ツ)_/¯' across the board because SonarQube detected the duplicate.
  /**
   * 404 for unknown routes
   * Claude said: "Catch-alls should always be last." after .use()
   */
  .all('/*', ({ set }) => {
    set.status = 404;

    return {
      error: 'Not found ¯\\_(ツ)_/¯',
      message: "This endpoint doesn't exist",
      availableEndpoints: [
        'GET /',
        'GET /tasks/all',
        'GET /tasks/:id',
        'POST /tasks',
        'PATCH /tasks/:id',
        'DELETE /tasks/:id',
      ],
    };
  })

  .listen(PORT);

// Reload message
console.log(`Elysia listening at: http://localhost:${PORT}`);
console.log(`Check Swagger here: http://localhost:${PORT}/swagger`);
