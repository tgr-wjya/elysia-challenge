# PROJECT: ELYSIA MASTERY

## THE CHALLENGE

Instead of a single "Mega API," you will master Elysia.js through 5 incremental milestones. This ensures you understand the "Framework Magic" (Validation, Context, and Routing) before building the final system.

---

## MILESTONE 1: THE ECHO CHAMBER (Validation)

**Goal:** Master the Contract Layer (TypeBox) without File I/O.

### API Requirements
- `POST /echo` - Validate and return input.

### Technical Requirements
- **Framework:** Elysia.js
- **Validation:** Use `t.Object` for the schema.
- **Fields:** 
  - `username`: string (min length 3)
  - `age`: number (minimum 1)

### Success Criteria
- ✅ Swagger shows the exact schema requirements.
- ✅ Invalid data returns a `400 Bad Request` automatically.
- ✅ Valid data is echoed back exactly as sent.

---

## MILESTONE 2: THE TASK READER (Read File)

**Goal:** Bridge File I/O with HTTP Request cycles.

### API Requirements
- `GET /tasks` - List all tasks from a file.

### Technical Requirements
- **Storage:** `tasks.json` (Read-only for now).
- **Runtime:** Use `Bun.file().json()`.

### Success Criteria
- ✅ Requesting `/tasks` returns the JSON array from your disk.
- ✅ Correct `Content-Type: application/json` header is sent.

---

## MILESTONE 3: THE PERSISTENT ADDER (Write File)

**Goal:** Handle Body payloads and update server-side state.

### API Requirements
- `POST /tasks` - Add a new task to the list.

### Technical Requirements
- **Logic:** Read file -> Push new task -> Write file.
- **Validation:** 
  - `description`: non-empty string.
  - `status`: must be "pending", "in-progress", or "completed".
- **ID Generation:** Use `Date.now()` or a simple counter.

### Success Criteria
- ✅ New task is persisted to `tasks.json` immediately.
- ✅ API returns the newly created task with a `201 Created` status.

---

## MILESTONE 4: THE TASK SNIPER (Dynamic Params)

**Goal:** Master Path Parameters and specific resource lookup.

### API Requirements
- `GET /tasks/:id` - Return a single task by its ID.

### Technical Requirements
- **Logic:** Capture `id` from URL -> Filter array -> Return result.
- **Error Handling:** Return `404 Not Found` if the ID doesn't exist.

### Success Criteria
- ✅ `/tasks/1` returns only the task with ID 1.
- ✅ Invalid IDs return a clear 404 error.

---

## MILESTONE 5: THE FULL INTEGRATION (CRUD)

**Goal:** Complete the system with Updates and Deletion.

### API Requirements
- `PATCH /tasks/:id` - Update task status or description.
- `DELETE /tasks/:id` - Remove a task.

### Success Criteria
- ✅ You can fully manage the lifecycle of a task from creation to deletion.
- ✅ Final code is clean, typed, and follows Elysia patterns.

---

## BONUS MILESTONE: THE SAFETY NET (Clean Code + Testing)

**Goal:** Fix bad habits while the codebase is small, then lock in correctness with tests.

### Part 1: Code Quality (Do This First)

**Why This Matters:** Bad naming becomes muscle memory. Fix it now before it carries over to your kaomoji API and future projects.

#### Fix These Variable Names:
- Line 31: `newUser` → `echoData` (it's not a user, it's echo data)
- Line 93-94: `getTask` → delete it, use `params.id` directly
- Line 123-125: `getId` → delete it, use `params.id` directly
- Line 127: `findID` → `taskIndex` (more descriptive)
- Line 168: `deleteTask` → `remainingTasks` (it's what's LEFT after deletion)

#### Add Type Safety (Remove `any`):
```typescript
// Add at the top of index.ts, after imports:
type Task = {
  id: number;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
};

// Then replace all `(t: any)` with `(t: Task)` on lines 98, 127, 169:
const task = tasks.find((t: Task) => t.id === params.id);
const taskIndex = tasks.findIndex((t: Task) => t.id === params.id);
const remainingTasks = tasks.filter((t: Task) => t.id !== params.id);
```

#### Success Criteria:
- ✅ No variables named after what they do (get/find), only what they ARE.
- ✅ No `any` types anywhere in the code.
- ✅ Task type defined and used consistently.

---

### Part 2: Testing (Do This After Code Cleanup)

**Why This Matters:** Remember the double-nested JSON incident? A single test would have caught it instantly. Tests aren't about "not trusting yourself" - they're about making future changes confidently without manually testing 5 endpoints every time.

### API Requirements
Write tests for your existing CRUD endpoints (Milestones 1-5):
- `POST /echo` - Validation tests
- `GET /tasks` - File reading tests
- `POST /tasks` - File writing tests
- `GET /tasks/:id` - Params parsing tests
- `PATCH /tasks/:id` - Partial update tests
- `DELETE /tasks/:id` - Array structure tests

### Technical Requirements
- **Framework:** Bun Test (built-in, no extra dependencies)
- **Test File:** `index.test.ts`
- **Pattern:** Arrange → Act → Assert
- **Coverage:** Happy path + edge cases (404s, validation errors, optional fields)

### Key Tests to Write

**1. The Double-Nesting Killer:**
```typescript
test('DELETE /tasks/:id returns flat array', async () => {
  const response = await app.handle(
    new Request('http://localhost/tasks/123', { method: 'DELETE' })
  );
  const data = await response.json();
  expect(data[0].id).toBeDefined(); // Would fail if double-nested
});
```

**2. PATCH Optional Fields:**
```typescript
test('PATCH /tasks/:id works with only description', async () => {
  const response = await app.handle(
    new Request('http://localhost/tasks/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Updated only this' })
    })
  );
  expect(response.status).toBe(200);
  const task = await response.json();
  expect(task.description).toBe('Updated only this');
  expect(task.status).toBeDefined(); // Original status preserved
});
```

**3. Validation Errors:**
```typescript
test('POST /echo rejects username shorter than 3 chars', async () => {
  const response = await app.handle(
    new Request('http://localhost/echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ab', age: 25 })
    })
  );
  expect(response.status).toBe(400);
});
```

### Success Criteria
- ✅ Run `bun test` and all tests pass.
- ✅ Each CRUD endpoint has at least 2 tests (happy path + error case).
- ✅ PATCH tests verify optional fields work independently.
- ✅ DELETE test ensures no double-nesting.
- ✅ You can refactor code confidently knowing tests will catch breaks.

### Running Tests
```bash
# Run all tests
bun test

# Run in watch mode (re-run on file changes)
bun test --watch

# Run specific test file
bun test index.test.ts
```

### When to Write Tests
- **After** building each milestone (lock in what works)
- **Before** refactoring (safety net for changes)
- **When** you spend more than 10 minutes debugging (turn the bug into a test)

---

## MILESTONE 6: THE GATEKEEPER (beforeHandle Hook)

**Goal:** Master request preprocessing and rate limiting with lifecycle hooks.

### API Requirements
- `POST /users` - Create a user with rate limiting protection.

### Technical Requirements
- **Hook Type:** `beforeHandle` - Runs BEFORE the route handler.
- **Logic:**
  - Store last request time in memory (use a `Map<string, number>`).
  - Check if 2 seconds have passed since last request.
  - Block request if too soon (return early from hook).
- **Response:** Return `429 Too Many Requests` if rate limited.

### Success Criteria
- ✅ First request succeeds immediately.
- ✅ Second request within 2 seconds returns `429` status.
- ✅ Request after 2 seconds succeeds again.
- ✅ The route handler NEVER runs when rate limited.

### Why This Matters
You'll need rate limiting for `POST /api/pet` in your kaomoji API. This milestone teaches you how `beforeHandle` can intercept requests before they reach your route logic.

---

## MILESTONE 7: THE RESPONSE DECORATOR (afterHandle Hook)

**Goal:** Master response modification and header injection.

### API Requirements
- `GET /users` - List all users with custom response headers.

### Technical Requirements
- **Hook Type:** `afterHandle` - Runs AFTER the route handler returns.
- **Logic:**
  - Add custom headers to every response: `X-Response-Time` and `X-Powered-By`.
  - Measure request duration (store start time in `beforeHandle`, calculate in `afterHandle`).
- **CORS Headers:** Add `Access-Control-Allow-Origin: *` to all responses.

### Success Criteria
- ✅ Response includes `X-Response-Time` header with milliseconds.
- ✅ Response includes `X-Powered-By: Elysia` header.
- ✅ CORS header is present in the response.
- ✅ Original response body is unchanged.

### Why This Matters
Your kaomoji API needs CORS headers on EVERY response. Instead of manually adding them to each route, `afterHandle` lets you inject them globally in one place.

---

## MILESTONE 8: THE ERROR GUARDIAN (onError Hook)

**Goal:** Master centralized error handling and custom error responses.

### API Requirements
- `GET /users/:id` - Get user by ID with proper error handling.

### Technical Requirements
- **Hook Type:** `onError` - Runs when ANY error occurs.
- **Logic:**
  - Throw a custom error if user ID not found.
  - Format all errors consistently with `{ error, message, timestamp }`.
  - Log errors to console with details.
- **Error Types:** Handle both 404 (not found) and 500 (server error).

### Success Criteria
- ✅ Invalid user ID returns formatted JSON error with `404` status.
- ✅ All errors have consistent structure.
- ✅ Console shows error details when errors occur.
- ✅ Swagger documents possible error responses.

### Why This Matters
Your kaomoji API has multiple error scenarios (kaomoji not found, rate limited, server errors). The `onError` hook gives you one place to format all errors consistently instead of repeating error handling code.

---

## MILESTONE 9: THE CONTEXT ENRICHER (derive Hook)

**Goal:** Master request context enrichment and data extraction.

### API Requirements
- `GET /me` - Return current request metadata (IP, timestamp, user-agent).

### Technical Requirements
- **Hook Type:** `derive` - Adds custom properties to the route context.
- **Logic:**
  - Extract request IP from headers.
  - Add current timestamp.
  - Parse user-agent string.
  - Make these available in route handler via context.
- **Usage:** Access derived data with `({ requestInfo }) => ...`.

### Success Criteria
- ✅ Route handler can access `requestInfo` from context.
- ✅ Response includes IP address, timestamp, and user-agent.
- ✅ Derived data is available to ALL routes after the hook.
- ✅ No need to manually extract this data in each route.

### Why This Matters
Your kaomoji API needs the user's IP address for rate limiting. Instead of extracting it in every route, `derive` lets you extract it once and make it available everywhere.

---

## GETTING STARTED

1. **Clean the slate:**
   ```bash
   rm -rf elysia-mastery/*.ts
   touch index.ts
   ```

2. **Setup your environment:**
   ```bash
   bun add elysia @elysiajs/swagger
   ```

3. **Start with Milestone 1:**
   - Define your server in `index.ts`.
   - Add Swagger.
   - Build the `/echo` route first.

4. **Test as you go:**
   - Run `bun run --watch index.ts`.
   - Use the Swagger UI at `http://localhost:3000/swagger`.

---

## REMEMBER

- **One thing at a time:** Don't touch files until Milestone 2.
- **Contract First:** If Swagger doesn't show your schema, your validation isn't working.
- **The "Bag" (Context):** Destructure only what you need: `({ body, params, set })`.

---

## HOOKS ROADMAP (MILESTONES 6-9)

After completing the CRUD fundamentals (Milestones 1-5), you'll master **Elysia Hooks** through four targeted milestones. Each hook type prepares you for a specific feature in your upcoming **Kaomoji API Rewrite**.

### The Connection

| Milestone | Hook Type | You'll Learn | Kaomoji API Feature |
|-----------|-----------|--------------|---------------------|
| 6 | `beforeHandle` | Request interception & rate limiting | `POST /api/pet` rate limiter |
| 7 | `afterHandle` | Response modification & CORS | Global CORS headers |
| 8 | `onError` | Centralized error handling | Consistent error responses |
| 9 | `derive` | Context enrichment | IP extraction for rate limiting |

### Why This Order?

1. **beforeHandle** comes first - you need to understand request interception before anything else.
2. **afterHandle** follows - you'll see how hooks can modify responses after handlers run.
3. **onError** next - now that you understand the request/response cycle, learn how to handle failures.
4. **derive** last - this is the most advanced hook, perfect for eliminating repetitive code.

### Keep Your Tasks Routes

Don't delete your `/tasks` routes when building hooks milestones. Create new `/users` routes to demonstrate hooks. This way you have:
- **Clean examples** - `/users` routes show each hook in isolation.
- **Reference code** - Your `/tasks` CRUD stays intact for comparison.
- **Real practice** - When you rewrite the kaomoji API, you'll apply these patterns to production code.

---

Good luck. You've got this.
