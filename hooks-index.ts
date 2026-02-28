/**
 * Testing lifecycle hooks/handler
 *
 * @author Tegar Wijaya Kusuma
 * @date 1 March 2026
 * @note These really are just for exploring because I don't want to muddle my already reformat index2.ts
 */

import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

export const app = new Elysia()
  .get('/', () => ({ greet: 'Hello, there!' }))

  .derive(({ request }) => {
    return {
      meta: {
        receivedAt: new Date().toISOString(),
        language: request.headers.get('Accept-Language') ?? 'unknown',
      },
    };
  })

  .get('/info', ({ meta }) => meta)

  .use(swagger())
  .listen(PORT);

console.log(`Elysia listening at: ${BASE_URL}`);
