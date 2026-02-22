/**
 * Testing WebStorm's capabilities
 *
 * @author Tegar Wijaya Kusuma
 * @date 19 February 2026
 */

import { Elysia } from 'elysia';
import { describe, expect, it, test } from 'bun:test';
import { app } from './index';

// Test /root response
test('/ALL /root returns kaomoji ◉‿◉', async () => {
  const response = await app.handle(new Request('http://localhost/'));

  const text = await response.text();
  expect(text).toBe('made with ◉‿◉');
});

// TODO: Fix this
// /POST /tasks response testing
test('POST /tasks adds new task', async () => {
  const response = await app.handle(
    new Request('http://localhost/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  );
});

// GET at /greet returns a greeting
test('GET at /greet returns a greeting', async () => {
  const response = await app.handle(
    new Request('http://localhost/greet', {
      method: 'GET',
    })
  );

  const greeting = await response.json();
  expect(greeting).toEqual({ greet: 'hello, world' });
});

// TODO: Add test runner for PATCH and DELETE
