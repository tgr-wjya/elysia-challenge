/**
 * Elysia + Bun Test Runner
 *
 * @author Tegar Wijaya Kusuma
 * @date 18 - 24 February 2026
 */

import { describe, expect, it, test, spyOn } from 'bun:test';
import { app } from './index';

// TODO: REFACTOR ALL USING `DESCRIBE` AND `IT`

const BASE_URL = 'http://localhost:3000';

describe('Testing /root and /greet responsiveness', () => {
  describe('ALL /root', () => {
    it('Should return kaomoji at /root for ALL method', async () => {
      const response = await app.handle(new Request(`${BASE_URL}`));

      const kaomoji = await response.text();
      expect(kaomoji).toBe('made with ◉‿◉');
    });
  });

  describe('GET /greet', () => {
    it('Should return a greeting', async () => {
      const response = await app.handle(
        new Request(`${BASE_URL}/greet`, {
          method: 'GET',
        })
      );

      const greeting = await response.json();
      expect(greeting).toEqual({ greet: 'hello, world' });
    });
  });
});
