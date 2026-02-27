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

// TODO: Consider using beforeEach() and afterEach()

/**
 * For /root, /echo and /wildcards
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
      expect(wildcards).toBeObject();
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
    // TODO: POST /echo — add second it() for validation rejection
    // e.g. username under 3 chars should return 400, age below 1 should return 400
    it('Should return 404 for body not following schema, username under 3 chars and age less than 1', async () => {
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

      expect(response.status).toBe(422);
    });
  });
});

describe('Testing taskGroup', () => {
  describe('GET /tasks/all', () => {
    it('Should return all tasks on the list', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/require-await
        json: async () => [
          { id: 12671, description: 'hello, test runner', status: 'completed' },
          { id: 128981, description: 'hello, bruh', status: 'pending' },
        ],
        // eslint-disable-next-line @typescript-eslint/require-await
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
        // eslint-disable-next-line @typescript-eslint/require-await
        json: async () => [
          { id: 671289, description: 'check this out!', status: 'pending' },
        ],
        // eslint-disable-next-line @typescript-eslint/require-await
        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      const taskId = 671289;

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/${taskId}`, {
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
        // eslint-disable-next-line @typescript-eslint/require-await
        json: async () => [
          { id: 12728, description: 'testerr', status: 'pending' },
        ],
        // eslint-disable-next-line @typescript-eslint/require-await
        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      const nonExistentID = 612789;
      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/${nonExistentID}`, {
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
        // eslint-disable-next-line @typescript-eslint/require-await
        json: async () => [
          { id: 1772127166755, description: 'same here', status: 'completed' },
        ],
        // eslint-disable-next-line @typescript-eslint/require-await
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

      // I have a theory here, i may have accidentally push the request for real, that's why the id value didn't match.
      // Because you can't insert id by yourself, it was created automatically by Date.now()
      // For now, I'll follow Claude's suggestion
      const created = (await response.json()) as Task;
      expect(response.status).toBe(201);
      expect(created).toHaveProperty('id');
      expect(created.description).toBe('same here');
      expect(created.status).toBe('completed');
    });
    // TODO: PATCH /tasks/:id — add it() for partial update with status only
    // (currently only tests description-only update)
  });

  describe('PATCH /tasks/:id', () => {
    it('Should update task status or description', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/require-await
        json: async () => [
          {
            id: 217,
            description: 'testing',
            status: 'pending',
          },
        ],
        // eslint-disable-next-line @typescript-eslint/require-await
        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      spyOn(Bun, 'write').mockResolvedValue(21);

      const taskID = 217;

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/${taskID}`, {
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

    it('Should return 404 for invalid ID', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/require-await
        json: async () => [
          { id: 12728, description: 'tester', status: 'pending' },
        ],
        // eslint-disable-next-line @typescript-eslint/require-await
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
});
