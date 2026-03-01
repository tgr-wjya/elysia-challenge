/**
 * Test runner for my /index.ts
 *
 * @author Tegar Wijaya Kusuma
 * @date 2 March 2026
 */

import { it, expect, describe, spyOn, beforeEach } from 'bun:test';
import { app } from './index2';
import { lastRequestTime } from './index2';

const BASE_URL = 'http://localhost:3000';

describe('POST /tasks', () => {
  beforeEach(() => {
    lastRequestTime.clear();
  });

  it('Should block second request within 2 seconds', async () => {
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

    expect(first.status).toBe(200);

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

    expect(second.status).toBe(429);
  });
});
