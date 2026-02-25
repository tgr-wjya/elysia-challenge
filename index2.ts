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
 * @date 24 - 25 February 2026
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

    // TODO: Continue this.
    /**
     * POST /tasks
     * Add new task to the list.
     */
    .post(
      '/',
      async ({ body, status }) => {
        // TODO: Add newTask schema here.
      },

      {
        body: t.Object({
          description: t.String({ minLength: 4 }),
          status: t.UnionEnum(['pending', 'in-progress', 'completed']),
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

  // 404 for unknown routes
  .get('/*', ({ set }) => {
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

  // Contains taskGroup, echo, swagger and PORT
  .use(echo)
  .use(taskGroup)
  .use(swagger())
  .listen(PORT);

// Reload message
console.log(`Elysia listening at: http://localhost:${PORT}`);
console.log(`Check Swagger here: http://localhost:${PORT}/swagger`);
