/** Mastering REST API with Elysia + Bun
 *
 * @author Tegar Wijaya Kusuma
 * @date 18 February 2026
 */

// Import Elysia, t for TypeScript Interface and Swagger OpenAPI
import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';

// Milestone 1 schema.
// Initialize the schema and minimum with TypeBox.
// TODO: Fix Swagger not knowing the schema. Elysia only tells Swagger about schemas if you put them in that second "options" object (the hook).
const UserSchema = t.Object({
  username: t.String({ minLength: 3 }),
  // Let's use Numeric in this case since it'll help convert literal number into string for us.
  age: t.Numeric({ minimum: 1 }),
});

// Milestone 3 schema.
// Since the PROJECT-SPEC only mentioned 3 validation, I'll keep it simple for now.
const TaskSchema = t.Object({
  id: t.Date(),
  description: t.String({ minLength: 4 }),
  status: t.UnionEnum(['pending', 'in-progress', 'completed']),
});

// Initialize the server
const app = new Elysia()
  // Root route, use this to greet all
  .all('/', () => 'made with ◉‿◉')

  .get('/greet', () => ({ greet: 'hello, world' }))

  // Milestone 1: Is that it, really? So easy.
  // Okay, I just found out this might be wrong, let me change it.
  // TODO: It might be wrong, fix it but double check everything
  // TODO: You need to put the schema in the Hook (the second argument) and use { body } from the context.
  .post('/echo', (body) => body, {})

  // Milestone 2: Task Reader
  // Wow, its easy, since its easy let me at least decorate the JSON with real Task API schema.
  // Btw for future me, if you don't understand.
  // I make the response to be a handler here which works like a function
  .get('/tasks', () => Bun.file('tasks.json').json())

  // Milestone 3: Write file.
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

  // Swagger OpenAPI and port
  .use(swagger())
  .listen(3000);

console.log('Elysis is running...');
