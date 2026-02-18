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

  // Milestone 1: Is that it, really? So easy.
  // Okay, I just found out this might be wrong, let me change it.
  // TODO: It might be wrong, fix it but double check everything
  .post('/echo', () => UserSchema)

  // Milestone 2: Task Reader
  // Wow, its easy, since its easy let me at least decorate the JSON with real Task API schema.
  // Btw for future me, if you don't understand.
  // I make the response to be a handler here which works like a function
  // ? I'll ask the LLM later, when I use `Bun.file()` its still successful, reading the JSON. Are we using `.json` to validate or to expect it instead??
  .get('/tasks', ({ set }) => Bun.file('tasks.json').json())

  // Milestone 3: Write file.
  .post('/tasks', async ({ set, status }) => {
    // Read the file
    const body = await Bun.file('tasks.json').json();

    const newTask = {
      id: body.Date.now(),
    };

    // Push new task and write file??
    body.push(newTask);
    await Bun.write('tasks.json', JSON.stringify(newTask, null, 2));

    set.status = 201;
    return newTask;
  })

  // Swagger OpenAPI and port
  .use(swagger())
  .listen(3000);

console.log('Elysis is running...');
