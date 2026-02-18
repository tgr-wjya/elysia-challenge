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

Good luck. You've got this.
