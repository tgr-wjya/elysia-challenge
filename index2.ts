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
export const lastRequestTime = new Map<string, number>();

/**
 * Task schema definition
 */
interface Task {
  id: number;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

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
      body: t.Object({
        username: t.String({ minLength: 3 }),
        age: t.Number({ minimum: 1 }),
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
     * GET /tasks/all
     * Returns all tasks,
     * The @PROJECT-SPEC doesn't mention using /all but I thought it'd be a good addition.
     */
    .get('/all', async ({ set }) => {
      set.status = 200;
      return await getTasks();
    })

    // TODO: M7 Add afterHandle() for custom headers
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
          return { error: 'Task not found' };
        }

        set.status = 200;
        return getTaskById;
      },
      {
        params: t.Object({
          id: t.Numeric(),
        }),
      }
    )

    // TODO: M6 Add beforeHandle() for rate limiting
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
          const ip = '127.0.0.1';
          const now = Date.now();
          const last = lastRequestTime.get(ip);

          if (last && now - last < 2000) {
            set.status = 429;
          }

          lastRequestTime.set(ip, now);
        },
        body: t.Object({
          description: t.String({ minLength: 4 }),
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
          return { error: 'Task not found ¯\\_(ツ)_/¯' };
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
            description: t.String({ minLength: 4 }),
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
          return { error: 'Task not found ¯\\_(ツ)_/¯' };
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
