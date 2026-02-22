# test runner - scattered pieces

non-obvious examples from different domains. figure out how they map to your `/tasks` API.

---

## piece 0: connecting to YOUR code

all the examples below use `pizzaApp`, `petApp`, `libraryApp` - those are fake. YOU import YOUR real app.

**your index.ts line 19:**
```typescript
export const app = new Elysia()
  .all('/', () => 'made with ◉‿◉')
  .get('/tasks', () => Bun.file('tasks.json').json())
  // ... rest of your endpoints
```

**your index.test.ts:**
```typescript
import { test, expect } from 'bun:test';
import { app } from './index';  // import YOUR real REST API

test('GET / returns greeting', async () => {
  const response = await app.handle(
    new Request('http://localhost/')
  );

  const text = await response.text();
  expect(text).toBe('made with ◉‿◉');
});

test('GET /tasks returns array', async () => {
  const response = await app.handle(
    new Request('http://localhost/tasks')
  );

  const tasks = await response.json();
  expect(Array.isArray(tasks)).toBe(true);
});

test('POST /echo validates input', async () => {
  const response = await app.handle(
    new Request('http://localhost/echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'jack', age: 25 })
    })
  );

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.username).toBe('jack');
});
```

you're testing the REAL REST API by importing it and throwing fake HTTP requests at it. `app.handle()` simulates the full HTTP cycle without starting a server.

the pizza/pet examples below show you the patterns. you apply them to YOUR `app` from YOUR `index.ts`.

---

## piece 1: the request simulator

`app.handle()` = fake browser. you build fake HTTP request, throw it at server, get fake response back.

```typescript
// pizza ordering API
import { test, expect } from 'bun:test';

test('GET /menu returns all pizzas', async () => {
  const fakeRequest = new Request('http://localhost/menu');
  const response = await pizzaApp.handle(fakeRequest);

  const pizzas = await response.json();
  expect(pizzas.length).toBeGreaterThan(0);
});
```

you're not calling `pizzaApp.menu()` - that's not how HTTP works. you simulate the FULL request cycle.

---

## piece 2: the body constructor

POST/PATCH/DELETE need more than just a URL. they carry cargo.

```typescript
// library book checkout system
test('POST /checkout adds book to borrowed list', async () => {
  const bookData = {
    isbn: '978-0-123456-78-9',
    dueDate: '2026-03-15'
  };

  const response = await libraryApp.handle(
    new Request('http://localhost/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    })
  );

  expect(response.status).toBe(201);
  const borrowed = await response.json();
  expect(borrowed.isbn).toBe('978-0-123456-78-9');
});
```

notice:
- method explicitly set
- headers tell server "this is JSON"
- body gets stringified (HTTP doesn't speak objects)

---

## piece 3: the validation trap

when you WANT something to fail:

```typescript
// weather API with city validation
test('POST /forecast rejects cities shorter than 2 chars', async () => {
  const response = await weatherApp.handle(
    new Request('http://localhost/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: 'A' })  // too short!
    })
  );

  expect(response.status).toBe(400);  // bad request
});
```

testing that your guard WORKS, not that it lets things through.

---

## piece 4: the param injector

dynamic URLs need values stuffed in:

```typescript
// pet adoption API
test('GET /pets/:id returns 404 for missing pet', async () => {
  const response = await petApp.handle(
    new Request('http://localhost/pets/99999')
  );

  expect(response.status).toBe(404);
});

test('DELETE /pets/:id removes the right one', async () => {
  const response = await petApp.handle(
    new Request('http://localhost/pets/42', { method: 'DELETE' })
  );

  const remaining = await response.json();
  expect(remaining.find(p => p.id === 42)).toBeUndefined();
});
```

`:id` becomes an actual number in the URL. you're building a string with 42 in it.

---

## piece 5: the optional field dance

PATCH is tricky - you send PART of the object:

```typescript
// pet adoption - updating only the adoption status
test('PATCH /pets/:id updates just status field', async () => {
  const response = await petApp.handle(
    new Request('http://localhost/pets/7', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adopted: true })  // ONLY this field
    })
  );

  const updated = await response.json();
  expect(updated.adopted).toBe(true);
  expect(updated.name).toBeDefined();  // original name still there
  expect(updated.breed).toBeDefined(); // breed didn't vanish
});
```

if your PATCH replaces the whole object instead of merging, this catches it.

---

## piece 6: the response unpacker

multiple ways to read what came back:

```typescript
const response = await app.handle(request);

// for JSON APIs:
const data = await response.json();

// for text/HTML:
const text = await response.text();

// just checking status:
expect(response.status).toBe(200);

// headers:
expect(response.headers.get('Content-Type')).toContain('application/json');
```

---

## piece 7: the structure

arrange → act → assert:

```typescript
test('clear name of what you are testing', async () => {
  // 1. ARRANGE - set up data
  const payload = { thing: 'value' };

  // 2. ACT - do the thing
  const response = await app.handle(
    new Request('http://localhost/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  );

  // 3. ASSERT - verify it worked
  expect(response.status).toBe(201);
  const result = await response.json();
  expect(result.thing).toBe('value');
});
```

---

## piece 8: the mock problem

run that library checkout test. it passes. check your `books.json` file. what happened?

**you modified real data.**

every test writes to same file. parallel tests interfere. forgot to clean up? data polluted. something goes wrong? file corrupted.

remember the 3-hour double-nested JSON incident? that's why you need mocks.

---

## piece 9: the fake file system

instead of reading/writing REAL files, use FAKE ones you control:

```typescript
import { spyOn } from 'bun:test';

// fake reading a file
spyOn(Bun, 'file').mockReturnValue({
  json: async () => [
    { id: 1, name: 'Fluffy', species: 'cat' },
    { id: 2, name: 'Rover', species: 'dog' }
  ]
});

// fake writing a file
spyOn(Bun, 'write').mockResolvedValue(0);
```

now when your code does `await Bun.file('pets.json').json()`, it gets fake data. when it tries to write, nothing happens to the real file.

---

## piece 10: resetting between tests

tests interfere with each other without resets:

```typescript
import { beforeEach } from 'bun:test';

describe('pet adoption API', () => {
  beforeEach(() => {
    // fresh mocks for each test
    spyOn(Bun, 'file').mockReturnValue({
      json: async () => [
        { id: 1, name: 'Fluffy', species: 'cat' }
      ]
    });

    spyOn(Bun, 'write').mockResolvedValue(0);
  });

  test('adopting a pet marks it adopted', async () => {
    // mocks already set up, start clean
  });

  test('returning a pet marks it available', async () => {
    // fresh mocks again, previous test doesn't affect this
  });
});
```

---

## piece 11: different data per test

default mocks in `beforeEach`, override when needed:

```typescript
describe('library system', () => {
  beforeEach(() => {
    // default: empty library
    spyOn(Bun, 'file').mockReturnValue({
      json: async () => []
    });
  });

  test('borrowing from empty library fails', async () => {
    // uses default empty array
  });

  test('returning a book when library has books', async () => {
    // override for this test only
    spyOn(Bun, 'file').mockReturnValue({
      json: async () => [
        { isbn: '123', title: 'Clean Code', borrowed: true }
      ]
    });

    // rest of test...
  });
});
```

---

## piece 12: checking what got written

verify your code tried to save the right data:

```typescript
test('pizza order saves to file', async () => {
  const writeSpy = spyOn(Bun, 'write').mockResolvedValue(0);

  await pizzaApp.handle(
    new Request('http://localhost/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pizza: 'pepperoni', size: 'large' })
    })
  );

  // check that write was called
  expect(writeSpy).toHaveBeenCalled();

  // check WHAT it tried to write
  const [path, data] = writeSpy.mock.calls[0];
  expect(path).toBe('orders.json');

  const written = JSON.parse(data);
  expect(written[0].pizza).toBe('pepperoni');
});
```

---

## piece 13: common mistakes

### forgot await
```typescript
// WRONG
const response = app.handle(new Request(...));

// RIGHT
const response = await app.handle(new Request(...));
```

### forgot Content-Type
```typescript
// WRONG
body: JSON.stringify({ thing: 'value' })

// RIGHT
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ thing: 'value' })
```

### forgot to stringify
```typescript
// WRONG
body: { thing: 'value' }

// RIGHT
body: JSON.stringify({ thing: 'value' })
```

### mock not async
```typescript
// WRONG - .json() expects a promise
spyOn(Bun, 'file').mockReturnValue({
  json: () => [...]
});

// RIGHT
spyOn(Bun, 'file').mockReturnValue({
  json: async () => [...]
});
```

---

## your turn

look at your `index.test.ts` line 14-16. that's broken. it's mixing two patterns wrong.

pick the pattern above that looks closest to testing your `/` root endpoint. translate it.

then move to:
- `/echo` - POST with validation
- `/tasks` GET - reading arrays
- `/tasks` POST - creating with 201
- `/tasks/:id` GET - params + 404s
- `/tasks/:id` PATCH - partial updates + spread
- `/tasks/:id` DELETE - array structure (the double-nesting killer)

run `bun test` after each. when it fails, error tells you what's wrong. when all pass, you can refactor without fear.

---

that 3-hour incident? one test would've caught it instantly. tests aren't about not trusting yourself - they're about changing code confidently without manually testing 5 endpoints every time.

◉‿◉
