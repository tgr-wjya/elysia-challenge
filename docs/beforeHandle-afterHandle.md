# `beforeEach` and `afterEach` — Practical Reference

---

## The Mental Model

Every test should start clean. If test A accidentally leaves behind state that test B reads, your tests are lying to you — B might pass not because the code works, but because A ran first.

`beforeEach` and `afterEach` are just hooks that run automatically around every single test in a `describe` block. You use them to set up and tear down shared state so each test gets a fresh slate.

```
beforeEach → [test runs] → afterEach → beforeEach → [next test runs] → afterEach
```

---

## `beforeEach`

Runs **before every** `it` block inside the same `describe`. Use it when multiple tests need the same starting conditions and you don't want to repeat the setup inside each one.

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';

let counter: number;

describe('counter behavior', () => {
  beforeEach(() => {
    counter = 0; // reset before every test
  });

  it('starts at zero', () => {
    expect(counter).toBe(0);
  });

  it('increments correctly', () => {
    counter++;
    expect(counter).toBe(1);
  });
});
```

Without `beforeEach` here, the second test would read whatever `counter` was after the first test mutated it. With it, both tests start from zero — independently.

---

## `afterEach`

Runs **after every** `it` block. Use it when a test creates side effects that need cleaning up — open connections, modified globals, spies that are still watching.

```typescript
import { describe, it, expect, afterEach, spyOn } from 'bun:test';

describe('logging behavior', () => {
  let consoleSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    consoleSpy.mockRestore(); // undo the spy after each test
  });

  it('logs the correct message', () => {
    consoleSpy = spyOn(console, 'log').mockImplementation(() => {});
    someFunction(); // internally calls console.log
    expect(consoleSpy).toHaveBeenCalledWith('expected message');
  });
});
```

If you skip `afterEach` here, the spy stays active and bleeds into the next test — which might not expect `console.log` to be intercepted.

---

## When to use which

**Use `beforeEach` when** tests share a starting condition — mock data, a freshly instantiated class, a reset variable.

**Use `afterEach` when** tests leave behind a side effect — a spy, a mutated global, a fake timer, an open resource.

You can use both in the same `describe`. They're not mutually exclusive.

---

## Scope

They only affect the `describe` block they live in. Nesting is respected.

```typescript
describe('outer', () => {
  beforeEach(() => {
    // runs before every test in outer AND inner
  });

  describe('inner', () => {
    beforeEach(() => {
      // runs only before tests inside inner
      // outer's beforeEach still runs too — outer first, then inner
    });

    it('some test', () => { ... });
  });
});
```

Execution order for a nested test: outer `beforeEach` → inner `beforeEach` → test → inner `afterEach` → outer `afterEach`.

---

## Common Mistakes

**Declaring variables outside but forgetting to reset them**

```typescript
// WRONG — value from test 1 leaks into test 2
let items = ['a', 'b'];

it('test 1', () => {
  items.push('c');
  expect(items).toHaveLength(3);
});

it('test 2', () => {
  expect(items).toHaveLength(2); // FAILS — items still has 'c'
});
```

```typescript
// RIGHT
let items: string[];

beforeEach(() => {
  items = ['a', 'b']; // fresh array every time
});
```

**Restoring spies in `beforeEach` instead of `afterEach`**

Restoring before the test means the previous test's spy is only cleaned up when the next test is about to start. If the last test in the block throws, the spy never gets restored. Put cleanup in `afterEach` — it runs regardless of whether the test passed or failed.

---

## Quick Reference

| Hook         | When it runs                   | Primary use           |
| ------------ | ------------------------------ | --------------------- |
| `beforeEach` | Before every `it` in the block | Set up fresh state    |
| `afterEach`  | After every `it` in the block  | Clean up side effects |

---

## How this applies to your milestones

Milestones 6–9 introduce shared state — the rate limiter `Map`, derived context, response timing. Each test will need the app's internal state reset between runs, otherwise a rate limit triggered in test 1 will block test 2. `beforeEach` is where you'll handle that.
