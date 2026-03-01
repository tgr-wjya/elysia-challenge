/** Mastering REST API with Elysia + Bun
 *
 * @author Tegar Wijaya Kusuma
 * @date 18 - 24 February 2026
 */

// Import Elysia, t for TypeScript Interface and Swagger OpenAPI
import { Elysia, status, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';

// TODO: Add type safety for Task
type Task = {
  id: number;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
};

export const lastRequestTime = new Map<string, number>();

// Initialize the server
export const app = new Elysia()
  // Root route, use this to greet all
  .all('/', () => 'made with ◉‿◉')

  .get('/greet', () => ({ greet: 'hello, world' }))

  // === M1: Validation ===
  // Is that it, really? So easy.
  // Okay, I just found out this might be wrong, let me change it.
  // Fix the hooks and schema, M1 done!
  // Fix the naming.
  .post(
    '/echo',
    ({ body, set }) => {
      const echoData = {
        username: body.username,
        age: body.age,
      };

      set.status = 200;
      return echoData;
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3 }),
        age: t.Number({ minimum: 1 }),
      }),
    }
  )

  // === M2. Read File ===
  // Wow, its easy, since its easy let me at least decorate the JSON with real Task API schema.
  // Btw for future me, if you don't understand.
  // I make the response to be a handler here which works like a function
  .get('/tasks', () => Bun.file('tasks.json').json())

  // === M3. Write File ===
  // Fix the /POST /tasks with hooks
  .post(
    '/tasks',
    async ({ body, set }) => {
      const tasks = await Bun.file('tasks.json').json();

      const newTask = {
        id: Date.now(),
        description: body.description,
        status: body.status,
      };

      // Push
      tasks.push(newTask);

      // Write
      await Bun.write('tasks.json', JSON.stringify(tasks, null, 2));

      // Set the status
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
        // Let's just use id for the schema for now
        id: t.Numeric(),
        description: t.String({ minLength: 4 }),
        status: t.UnionEnum(['pending', 'in-progress', 'completed']),
      }),
    }
  )

  // === M4. Parse Params ===
  // Read from file > Parse by ID > Return
  .get(
    '/tasks/:id',
    async ({ params }) => {
      const tasks = await Bun.file('tasks.json').json();

      // Fixed the redundant schema
      // I've fixed parsed by ID, let me write down what I learned.
      const getTaskById = tasks.find((t: Task) => t.id === params.id);

      // Return the request.
      // I've checked and make sure it only fetch and send by the specific id and not the whole thing.
      return getTaskById;
    },
    {
      // You need schema, yes
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )

  // === M5. UPDATE ===
  // Added /PATCH for /Tasks
  // Added /DELETE for /tasks
  // This should be easy, I have everything I need.
  // Oh my god, I just realized you need two hooks for /PATCH
  // Let me implement it.
  .patch(
    '/tasks/:id',
    async ({ params, set, body }) => {
      const tasks = await Bun.file('tasks.json').json();

      // Redundant schema removed

      const taskIndex = tasks.findIndex((t: Task) => t.id === params.id);

      if (taskIndex === -1) {
        set.status = 404;
        return { error: 'Task not found' };
      }

      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...body,
      };

      await Bun.write('tasks.json', JSON.stringify(tasks, null, 2));

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

  // === M5. DELETE ===
  .delete(
    '/tasks/:id',
    async ({ params, set }) => {
      const tasks = await Bun.file(new URL('tasks.json', import.meta.url)).json();

      // TODO: Remove redundant schema
      const getTask = {
        id: params.id,
      };

      const remainingTask = tasks.filter((t: Task) => Number(t.id) !== Number(getTask.id));

      // CAUTION: MAKE SURE IT'S NOT DOUBLE NESTED, I JUST FUCKING SPENT 3 HOURS BECAUSE I DIDN'T REALIZE IT WAS DOUBLE NESTED.

      await Bun.write('tasks.json', JSON.stringify(remainingTask, null, 2));

      set.status = 200;
      return remainingTask;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )

  // Swagger OpenAPI and port
  .use(swagger())
  .listen(3000);

export type App = typeof app;

console.log('Elysia is running...');
