/* eslint-disable @typescript-eslint/require-await */
/**
 * Writing my own test runner
 *
 * @author Tegar Wijaya Kusuma
 * @date 26 - 27 February 2026
 */

import { describe, expect, it, spyOn } from 'bun:test';
import { app } from './index2';

const BASE_URL = 'http://localhost:3000';

interface Task {
  id: number;
  description: string;
  status: string;
}

// TODO: Use .beforeEach  and afterEach
/**
 * Covering the REST API Task CRUD
 * 100% covered
 */
describe('Testing /root, /wildcards and /echo responsiveness', () => {
  describe('GET /root', () => {
    it('Should return kaomoji and author (me)', async () => {
      const response = await app.handle(
        new Request(`${BASE_URL}`, {
          method: 'GET',
        })
      );

      const kaomojiAndAuthor = await response.json();
      expect(kaomojiAndAuthor).toBeObject();
      expect(kaomojiAndAuthor).toEqual({
        kaomoji: 'made with ◉‿◉',
        author: 'Tegar Wijaya Kusuma',
      });
    });
  });

  describe('ALL /wildcards', () => {
    it('Should returns 404 and JSON object', async () => {
      const response = await app.handle(
        new Request(`${BASE_URL}/test`, {
          method: 'POST',
        })
      );

      const wildcards = await response.json();
      expect(response.status).toBe(404);
      expect(wildcards).toEqual({
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
      });
    });
  });

  describe('POST /echo', () => {
    it('Should echo user body as validation', async () => {
      const userSchema = {
        username: 'Jack',
        age: 22,
      };

      const response = await app.handle(
        new Request(`${BASE_URL}/echo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userSchema),
        })
      );

      const userEcho = await response.json();
      expect(response.status).toBe(201);
      expect(userEcho).toEqual({
        username: 'Jack',
        age: 22,
      });
    });

    it('Should return 422 for body not following schema, username under 3 chars and age less than 1', async () => {
      const userSchema = {
        username: 'Ab',
        age: 0,
      };

      const response = await app.handle(
        new Request(`${BASE_URL}/echo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userSchema),
        })
      );

      // 422 is more semantically correct here, besides Elysia return 422 anyway.
      expect(response.status).toBe(422);
    });
  });
});

describe('Testing taskGroup', () => {
  describe('GET /tasks/all', () => {
    it('Should return all tasks on the list', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          { id: 12671, description: 'hello, test runner', status: 'completed' },
          { id: 128981, description: 'hello, bruh', status: 'pending' },
        ],

        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/all`, {
          method: 'GET',
        })
      );

      const allTasks = (await response.json()) as Task[];
      expect(response.status).toBe(200);
      expect(allTasks).toBeArray();
      expect(allTasks[0]).toEqual({
        id: 12671,
        description: 'hello, test runner',
        status: 'completed',
      });
      expect(allTasks[1]).toEqual({
        id: 128981,
        description: 'hello, bruh',
        status: 'pending',
      });
    });
  });

  describe('GET /tasks/:id and 404', () => {
    it('Should return a single task with params', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          { id: 671289, description: 'check this out!', status: 'pending' },
        ],

        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/671289`, {
          method: 'GET',
        })
      );

      const task = await response.json();
      expect(response.status).toBe(200);
      expect(task).toEqual({
        id: 671289,
        description: 'check this out!',
        status: 'pending',
      });
    });

    it('Should return 404 for non-existent id', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          { id: 12728, description: 'testerr', status: 'pending' },
        ],

        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/612789`, {
          method: 'GET',
        })
      );

      const faultyTask = await response.json();
      expect(response.status).toBe(404);
      expect(faultyTask).toEqual({ error: 'Task not found' });
    });
  });

  describe('POST /tasks', () => {
    it('Should Add a new task to the list', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          { id: 1772127166755, description: 'same here', status: 'completed' },
        ],

        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      spyOn(Bun, 'write').mockResolvedValue(17);

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: 'same here',
            status: 'completed',
          }),
        })
      );

      const created = (await response.json()) as Task;
      expect(response.status).toBe(201);
      expect(created).toHaveProperty('id');
      expect(created.description).toBe('same here');
      expect(created.status).toBe('completed');
    });

    it('Should return 422 for an invalid description', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          { id: 219812, description: 'buy coffee', status: 'pending' },
        ],
        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: 'ab',
            status: 'pending',
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it('Should return 422 for an invalid status', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          { id: 219812, description: 'buy coffee', status: 'pending' },
        ],
        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: 'a beautiful day',
            status: 'something-else',
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('Should update task description', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          {
            id: 217,
            description: 'testing',
            status: 'pending',
          },
        ],

        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      spyOn(Bun, 'write').mockResolvedValue(21);

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/217`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: 'test PATCH',
          }),
        })
      );

      const updated = (await response.json()) as Task;
      expect(response.status).toBe(200);
      expect(updated.description).toBe('test PATCH');
      expect(updated.status).toBe('pending');
    });

    it('Should update task status', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          {
            id: 217,
            description: 'testing',
            status: 'pending',
          },
        ],

        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      spyOn(Bun, 'write').mockResolvedValue(21);

      const taskID = 217;

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/${taskID}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
          }),
        })
      );

      const updated = (await response.json()) as Task;
      expect(response.status).toBe(200);
      expect(updated.description).toBe('testing');
      expect(updated.status).toBe('completed');
    });

    it('Should return 404 for invalid ID', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          { id: 12728, description: 'tester', status: 'pending' },
        ],

        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      const dummyId = 78219;
      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/${dummyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: 'test' }),
        })
      );

      const faulty = await response.json();
      expect(response.status).toBe(404);
      expect(faulty).toEqual({ error: 'Task not found ¯\\_(ツ)_/¯' });
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('Should delete task', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          { id: 22312, description: 'debug this shit', status: 'in-progress' },
          {
            id: 871,
            description: 'fix that shit',
            status: 'completed',
          },
        ],
        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      // ? Should this be minus since its deleting?
      spyOn(Bun, 'write').mockResolvedValue(21);

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/871`, {
          method: 'DELETE',
        })
      );

      // I suspect that I don't need to write the logic, I could just mock the file and write.
      const deleted = (await response.json()) as Task[];
      expect(response.status).toBe(200);
      expect(deleted[0]).toEqual({
        id: 22312,
        description: 'debug this shit',
        status: 'in-progress',
      });
    });

    it('Should return 404 for non-existent task', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        json: async () => [
          { id: 87129, description: 'hey, ho', status: 'completed' },
        ],
        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/9999`, {
          method: 'DELETE',
        })
      );

      const faultyDeletion = await response.json();
      expect(response.status).toBe(404);
      expect(faultyDeletion).toEqual({ error: 'Task not found ¯\\_(ツ)_/¯' });
    });
  });
});
