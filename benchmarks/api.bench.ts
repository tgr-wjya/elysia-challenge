import { bench, describe } from 'vitest';
import { Elysia, t } from 'elysia';

/**
 * Benchmark suite for the Elysia REST API.
 *
 * Uses a standalone Elysia instance (without Bun-specific file I/O)
 * to measure pure routing and validation performance.
 */

const tasks = [
  { id: 1, description: 'benchmark task one', status: 'pending' },
  { id: 2, description: 'benchmark task two', status: 'in-progress' },
  { id: 3, description: 'benchmark task three', status: 'completed' },
];

const app = new Elysia()
  .get('/', () => ({
    kaomoji: 'made with ◉‿◉',
    author: 'Tegar Wijaya Kusuma',
  }))
  .post(
    '/echo',
    ({ body, set }) => {
      set.status = 201;
      return { username: body.username, age: body.age };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3 }),
        age: t.Number({ minimum: 1 }),
      }),
    }
  )
  .get('/tasks/all', () => tasks)
  .get(
    '/tasks/:id',
    ({ params, set }) => {
      const task = tasks.find((t) => t.id === params.id);
      if (!task) {
        set.status = 404;
        return { error: 'Task not found' };
      }
      return task;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .post(
    '/tasks',
    ({ body, set }) => {
      const newTask = {
        id: Date.now(),
        description: body.description,
        status: body.status,
      };
      set.status = 201;
      return newTask;
    },
    {
      body: t.Object({
        description: t.String({ minLength: 4 }),
        status: t.UnionEnum(['pending', 'in-progress', 'completed']),
      }),
    }
  )
  .patch(
    '/tasks/:id',
    ({ body, params, set }) => {
      const taskIndex = tasks.findIndex((t) => t.id === params.id);
      if (taskIndex === -1) {
        set.status = 404;
        return { error: 'Task not found' };
      }
      return { ...tasks[taskIndex], ...body };
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
    '/tasks/:id',
    ({ params, set }) => {
      const remaining = tasks.filter((t) => t.id !== params.id);
      if (remaining.length === tasks.length) {
        set.status = 404;
        return { error: 'Task not found' };
      }
      return remaining;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  );

const BASE_URL = 'http://0.0.0.0:3000';

describe('GET endpoints', () => {
  bench('GET /', async () => {
    await app.handle(new Request(`${BASE_URL}/`));
  });

  bench('GET /tasks/all', async () => {
    await app.handle(new Request(`${BASE_URL}/tasks/all`));
  });

  bench('GET /tasks/:id', async () => {
    await app.handle(new Request(`${BASE_URL}/tasks/1`));
  });
});

describe('POST endpoints', () => {
  bench('POST /echo', async () => {
    await app.handle(
      new Request(`${BASE_URL}/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'benchmark', age: 25 }),
      })
    );
  });

  bench('POST /tasks', async () => {
    await app.handle(
      new Request(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'benchmark task',
          status: 'pending',
        }),
      })
    );
  });
});

describe('PATCH and DELETE endpoints', () => {
  bench('PATCH /tasks/:id', async () => {
    await app.handle(
      new Request(`${BASE_URL}/tasks/1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'updated benchmark task' }),
      })
    );
  });

  bench('DELETE /tasks/:id', async () => {
    await app.handle(
      new Request(`${BASE_URL}/tasks/3`, {
        method: 'DELETE',
      })
    );
  });
});
