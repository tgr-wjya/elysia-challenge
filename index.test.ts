/**
 * Reformatting my ELysia + Bun test runner.
 *
 * @author Tegar Wijaya Kusuma
 * @date 18 - 25 February 2026
 */

import { describe, expect, it, spyOn } from 'bun:test';
import { app } from './index2';

const BASE_URL = 'http://localhost:3000';

type Task = {
  id: number;
  description: string;
  status: string;
};

// For /root and wildcards
describe('Testing server responsiveness and wildcard', () => {
  describe('GET /root', () => {
    it('Should return a kaomoji and author (me)', async () => {
      const response = await app.handle(
        new Request(`${BASE_URL}`, {
          method: 'GET',
        })
      );

      const authorAndKaomoji = await response.json();
      expect(authorAndKaomoji).toBeObject();
      expect(authorAndKaomoji).toEqual({
        kaomoji: 'made with ◉‿◉',
        author: 'Tegar Wijaya Kusuma',
      });
    });
  });

  describe('GET /* wildcards', () => {
    it('Should returns an array of object', async () => {
      const response = await app.handle(
        new Request(`${BASE_URL}/test`, {
          method: 'GET',
          headers: { 'Content-Type': '	application/json' },
        })
      );

      const wildcard = await response.json();
      expect(wildcard).toBeObject();
      expect(response.status).toBe(404);
      expect(wildcard).toEqual({
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
});

// echo
describe('Testing /echo', () => {
  it('Should echo user body', async () => {
    const echoUser = {
      username: 'Jack',
      age: 22,
    };

    const response = await app.handle(
      new Request(`${BASE_URL}/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(echoUser),
      })
    );

    expect(response.status).toBe(201);

    const created = await response.json();
    expect(created).toEqual({
      username: 'Jack',
      age: 22,
    });
  });
});

// taskGroup
describe('Testing /tasks API', () => {
  describe('GET /tasks/all', () => {
    it('Should returns all tasks', async () => {
      spyOn(Bun, 'file').mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/require-await
        json: async () => [
          { id: 71823891, description: 'what to put?', status: 'pending' },
          { id: 67182912, description: 'hello, world!', status: 'completed' },
        ],
        // eslint-disable-next-line @typescript-eslint/require-await
        exists: async () => true,
      } as unknown as ReturnType<typeof Bun.file>);

      const response = await app.handle(
        new Request(`${BASE_URL}/tasks/all`, {
          method: 'GET',
        })
      );

      const tasks = (await response.json()) as Task[];
      expect(response.status).toBe(200);
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks[0]).toHaveProperty('id');
    });
  });

  describe('POST /tasks', () => {
    it('Should send and return POSTED task', async () => {});
    // TODO: Continue this tomorrow.
  });
});
