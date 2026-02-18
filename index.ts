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

  // Milestone 1: Is that it, really? So easy.
  // Okay, I just found out this might be wrong, let me change it.
  // TODO: It might be wrong, fix it but double check everything
  // TODO: You need to put the schema in the Hook (the second argument) and use { body } from the context.
  .post('/echo', () => UserSchema)

  // Milestone 2: Task Reader
  // Wow, its easy, since its easy let me at least decorate the JSON with real Task API schema.
  // Btw for future me, if you don't understand.
  // I make the response to be a handler here which works like a function
  .get('/tasks', ({ set }) => Bun.file('tasks.json').json())

  // Milestone 3: Write file.
  .post('/tasks', async ({ set, status }) => {
    // Read the file
    const body = await Bun.file('tasks.json').json();

    const newTask = {
      // TODO: Since body is the array you just read from the file, body.Date doesn't exist. It should just be Date.now().
      id: body.Date.now(),
    };

    // Push new task and write file??
    body.push(newTask);

    // TODO: This will overwrite your entire file with just the single new task. You need to write the entire array (body) back to the file.
    await Bun.write('tasks.json', JSON.stringify(newTask, null, 2));

    set.status = 201;
    return newTask;
  })

  // Swagger OpenAPI and port
  .use(swagger())
  .listen(3000);

console.log('Elysis is running...');
