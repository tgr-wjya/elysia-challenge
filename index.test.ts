/**
 * Test runner for my /index.ts
 *
 * @author Tegar Wijaya Kusuma
 * @date 2 March 2026
 */

import { it, expect, describe, spyOn, beforeEach } from 'bun:test';
import { app } from './index2';
import { lastRequestTime } from './index2';
import { resolve } from 'bun';

const BASE_URL = 'http://localhost:3000';

describe('POST /tasks', () => {
  beforeEach(() => {
    lastRequestTime.clear();
  });

  it('Should block second request within 2 seconds', async () => {
    spyOn(Bun, 'file').mockReturnValue({
      json: async () => [{ id: 78129, description: 'something here', status: 'completed' }],
      exists: async () => true,
    } as unknown as ReturnType<typeof Bun.file>);

    spyOn(Bun, 'write').mockResolvedValue(2121);

    const first = await app.handle(
      new Request(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'first request',
          status: 'pending',
        }),
      })
    );

    expect(first.status).toBe(201);

    const second = await app.handle(
      new Request(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'first request',
          status: 'pending',
        }),
      })
    );

    const secondResponse = await second.json();
    expect(second.status).toBe(429);
    expect(secondResponse).toEqual({ error: 'Too many request' });
  });
});
