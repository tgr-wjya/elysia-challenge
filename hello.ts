/**
 * Testing WebStorm's capabilities
 *
 * @author Tegar Wijaya Kusuma
 * @date 19 February 2026
 */

import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';

// const app = new Elysia()
//   .all('/', () => ({ greet: 'hello, world!' }))
//   .use(swagger())
//   .listen(3000);

const body: any = Bun.file('tasks.json').json();

console.log(typeof body[1].id);
