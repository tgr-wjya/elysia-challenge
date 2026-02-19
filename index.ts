/** Mastering REST API with Elysia + Bun
 *
 * @author Tegar Wijaya Kusuma
 * @date 18 February 2026
 */

// Import Elysia, t for TypeScript Interface and Swagger OpenAPI
import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';

// Initialize the server
const app = new Elysia()
  // Root route, use this to greet all
  .all('/', () => 'made with ◉‿◉')

  .get('/greet', () => ({ greet: 'hello, world' }))

  // === M1: Validation ===
  // Is that it, really? So easy.
  // Okay, I just found out this might be wrong, let me change it.
  // Fix the hooks and schema, M1 done!
  .post(
    '/echo',
    ({ body }) => {
      const newUser = {
        username: body.username,
        age: body.age,
      };

      return newUser;
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
    async ({ body, set, status }) => {
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
      body: t.Object({
        // Let's just use id for the schema for now
        id: t.Numeric(),
        description: t.String({ minLength: 4 }),
        status: t.UnionEnum(['pending', 'in-progress', 'completed']),
      }),
    }
  )

  // === M4. Parse Params ===
  // TODO: Return task by its ID
  // TODO: Read from file too.
  .get(
    '/tasks/:id',
    async ({ params }) => {
      const tasks = await Bun.file('tasks.json').json();

      // You also need hooks.
      const getTask = {
        id: params.id,
      };

      // But how to parse only the selected ID?
      // TODO: Parse the ID
    },
    {
      // You need schema, yes
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )

  // Swagger OpenAPI and port
  .use(swagger())
  .listen(3000);

console.log('Elysis is running...');
