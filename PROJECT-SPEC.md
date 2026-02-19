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
