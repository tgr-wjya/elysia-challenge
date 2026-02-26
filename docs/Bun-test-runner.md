# Bun Test Runner — Practical Reference

> Written for someone who already understands REST APIs and just needs the testing mental model to piece things together.

---

## The Mental Model

A test is just a function that checks if something is true. If it's not true, the test fails and tells you where.

```
Arrange → Act → Assert
```

- **Arrange**: Set up what you need (mock data, a request).
- **Act**: Do the thing (call the endpoint).
- **Assert**: Check if the result matches what you expected.

That's it. Everything else is just tooling around this pattern.

---

## Basic Structure

```typescript
import { describe, it, expect } from 'bun:test';

describe('Group name', () => {
  it('should do something', () => {
    const result = 1 + 1;
    expect(result).toBe(2);
  });
});
```

- `describe` — groups related tests. Nest them as deep as needed.
- `it` — a single test case. `test` is an alias, they're identical.
- `expect` — wraps a value so you can assert things about it.

---

## Running Tests

```bash
bun test                    # run all test files
bun test index.test.ts      # run specific file
bun test --watch            # re-run on file changes
```

---

## Matchers — What You'll Actually Use

### Equality

```typescript
expect(value).toBe(42); // strict equality (===), use for primitives
expect(value).toEqual({ a: 1 }); // deep equality, use for objects and arrays
```

`toBe` asks: "are these the exact same thing?"
`toEqual` asks: "do these have the same shape and values?"

```typescript
expect({ a: 1 }).toBe({ a: 1 }); // FAILS — different objects in memory
expect({ a: 1 }).toEqual({ a: 1 }); // PASSES — same shape
```

### Type checks

```typescript
expect(value).toBeObject();
expect(value).toBeArray();
expect(value).toBeString();
expect(value).toBeNumber();
expect(value).toBeUndefined();
expect(value).toBeNull();
```

### Property checks

```typescript
expect(obj).toHaveProperty('id'); // key exists
expect(obj).toHaveProperty('id', 123); // key exists AND has value
expect(arr).toContain('pending'); // array contains value
expect(arr).toHaveLength(3); // array/string length
```

### Number checks

```typescript
expect(n).toBeGreaterThan(0);
expect(n).toBeLessThan(100);
expect(n).toBeGreaterThanOrEqual(1);
```

### Truthiness

```typescript
expect(value).toBeTruthy(); // anything truthy
expect(value).toBeFalsy(); // anything falsy
expect(value).toBeDefined(); // not undefined
```

### Negation

```typescript
expect(value).not.toBe(0);
expect(value).not.toBeNull();
expect(arr).not.toContain('deleted-id');
```

---

## Testing HTTP Endpoints with Elysia

You don't need to actually start a server. Elysia exposes `.handle()` which accepts a standard `Request` object.

```typescript
import { app } from './index';

const BASE_URL = 'http://localhost:3000';

const response = await app.handle(
  new Request(`${BASE_URL}/your-endpoint`, {
    method: 'GET',
  })
);

const data = await response.json();
```

### Checking status codes

```typescript
expect(response.status).toBe(200);
expect(response.status).toBe(404);
expect(response.status).toBe(201);
```

### Checking response body

```typescript
const data = await response.json(); // parse JSON body
const text = await response.text(); // parse as plain text

// you can only call one of these per response — once consumed, it's gone
```

### Sending a POST with a body

```typescript
const response = await app.handle(
  new Request(`${BASE_URL}/endpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'value' }),
  })
);
```

### Sending a PATCH with partial body

```typescript
const response = await app.handle(
  new Request(`${BASE_URL}/endpoint/123`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'only updating this field' }),
  })
);
```

### DELETE

```typescript
const response = await app.handle(
  new Request(`${BASE_URL}/endpoint/123`, {
    method: 'DELETE',
  })
);
```

---

## Mocking with `spyOn`

Your handlers read from `tasks.json`. In tests, you don't want to touch the real file — you want to control what the handler sees.

`spyOn` intercepts a function call and replaces it with your version for that test.

```typescript
import { spyOn } from 'bun:test';

spyOn(Bun, 'file').mockReturnValue({
  json: async () => [
    { id: 1, description: 'buy milk', status: 'pending' },
    { id: 2, description: 'write tests', status: 'completed' },
  ],
  exists: async () => true,
} as unknown as ReturnType<typeof Bun.file>);
```

After this, any call to `Bun.file()` inside your handler returns your fake data instead of reading from disk.

**Why `as unknown as ReturnType<typeof Bun.file>`?**
You're only mocking the parts you need (`json`, `exists`). TypeScript complains because the real `BunFile` type has more properties. The cast tells TypeScript to trust you.

**Important:** `spyOn` in Bun currently persists for the duration of the test file unless you restore it. Put mocks inside the `it` block where they're needed, or use `beforeEach`/`afterEach` to reset state.

---

## `beforeEach` and `afterEach`

Run setup or teardown before/after every test in a `describe` block.

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';

describe('GET /tasks/all', () => {
  beforeEach(() => {
    spyOn(Bun, 'file').mockReturnValue({
      json: async () => [
        { id: 1, description: 'test task', status: 'pending' },
      ],
      exists: async () => true,
    } as unknown as ReturnType<typeof Bun.file>);
  });

  it('returns all tasks', async () => {
    // mock is already set up
  });

  it('returns an array', async () => {
    // mock is already set up here too
  });
});
```

---

## Async Tests

If your test does anything async (which it will, because your handlers are async), mark the `it` callback as `async`.

```typescript
it('should return tasks', async () => {
  const response = await app.handle(new Request(`${BASE_URL}/tasks/all`));
  const data = await response.json();
  expect(data).toBeArray();
});
```

If you forget `async`/`await`, the test will pass before the response arrives and you'll get false positives.

---

## Type Safety in Tests

You can type your parsed responses to get autocomplete and catch mistakes.

```typescript
type Task = {
  id: number;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
};

const tasks = (await response.json()) as Task[];
expect(tasks[0].description).toBeDefined();
```

---

## What a Full Test Block Looks Like

```typescript
import { describe, it, expect, spyOn } from 'bun:test';
import { app } from './index2';

const BASE_URL = 'http://localhost:3000';

describe('POST /echo', () => {
  it('should return echoed data with 201', async () => {
    // Arrange
    const payload = { username: 'Tegar', age: 22 };

    // Act
    const response = await app.handle(
      new Request(`${BASE_URL}/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );

    // Assert
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toEqual({ username: 'Tegar', age: 22 });
  });

  it('should reject username shorter than 3 chars with 400', async () => {
    const response = await app.handle(
      new Request(`${BASE_URL}/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'ab', age: 22 }),
      })
    );

    expect(response.status).toBe(400);
  });
});
```

---

## Common Mistakes

**Reading response body twice**

```typescript
// WRONG
const data = await response.json();
const text = await response.text(); // already consumed, will error

// RIGHT — pick one
const data = await response.json();
```

**Forgetting await**

```typescript
// WRONG — test passes before assertion runs
it('test', () => {
  const response = app.handle(new Request(`${BASE_URL}/tasks/all`)); // missing await
  expect(response.status).toBe(200); // response is a Promise here, not a Response
});

// RIGHT
it('test', async () => {
  const response = await app.handle(new Request(`${BASE_URL}/tasks/all`));
  expect(response.status).toBe(200);
});
```

**Using `toBe` on objects**

```typescript
// WRONG
expect({ id: 1 }).toBe({ id: 1 }); // always fails

// RIGHT
expect({ id: 1 }).toEqual({ id: 1 });
```

**Writing a test that always passes**
An empty `it` block passes. A test with no assertions passes. Always make sure your test can actually fail by checking something real.

```typescript
it('placeholder', async () => {
  // this passes, but tests nothing — don't ship this
});
```

---

## Quick Reference Card

| What you want to check   | Matcher                             |
| ------------------------ | ----------------------------------- |
| Exact value (primitives) | `.toBe()`                           |
| Object/array shape       | `.toEqual()`                        |
| HTTP status              | `expect(response.status).toBe(200)` |
| Key exists on object     | `.toHaveProperty('key')`            |
| Array has item           | `.toContain(value)`                 |
| Array length             | `.toHaveLength(n)`                  |
| Not something            | `.not.toBe()` / `.not.toEqual()`    |
| Value is defined         | `.toBeDefined()`                    |
| Value is an array        | `.toBeArray()`                      |
| Value is an object       | `.toBeObject()`                     |
