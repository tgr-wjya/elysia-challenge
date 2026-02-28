# Array Methods & Operators Across CRUD

> Why GET, PATCH, and DELETE each use a different array method — and why the wrong one silently breaks everything.

---

## The Core Idea

Every CRUD operation needs to **locate** a task. But what it does _after_ finding it determines which method you use.

| Method       | You need to...                | So you use...  | Returns                  |
| ------------ | ----------------------------- | -------------- | ------------------------ |
| GET (single) | Look at one task              | `.find()`      | `Task` or `undefined`    |
| PATCH        | Know _where_ it is (position) | `.findIndex()` | `number` (-1 if missing) |
| DELETE       | Keep everything _except_ it   | `.filter()`    | `Task[]`                 |

---

## `.find()` — GET a single task

```ts
const task = tasks.find((t) => t.id === params.id);
// t.id === params.id → "stop at the FIRST match, give me that object"
```

- Uses `===` (strict equality) — you want **one exact match**
- Returns: the `Task` object, or `undefined` if nothing matched
- Safe to check with `!task` because you're checking for `undefined`, not a number

```ts
if (!task) {
  set.status = 404; // !undefined === true ✓
}
```

---

## `.findIndex()` — PATCH

```ts
const taskIndex = tasks.findIndex((t) => t.id === params.id);
// t.id === params.id → "find the POSITION of the match"
```

- Uses `===` (same as `.find()`) — still looking for one exact match
- Returns: a **number** — the index position, or `-1` if nothing matched
- **Cannot use `!taskIndex` here** — `!0 === true`, so if the task is at index 0, you'd accidentally 404 it

```ts
// ❌ Wrong
if (!taskIndex) { ... }       // index 0 breaks this

// ✅ Correct
if (taskIndex === -1) { ... } // explicit -1 check only
```

Why PATCH needs the index at all: you need to **replace one item in-place**.

```ts
tasks[taskIndex] = { ...tasks[taskIndex], ...body };
// "at this exact position, overwrite with the merged object"
```

---

## `.filter()` — DELETE

```ts
const remainingTasks = tasks.filter((t) => t.id !== params.id);
// t.id !== params.id → "keep everything that is NOT this id"
```

- Uses `!==` (strict inequality) — the **opposite** logic of find/findIndex
- Returns: a new `Task[]` with the target removed
- You never "find" the task directly — you just rebuild the array without it

The "not found" check also changes because you're working with arrays now:

```ts
// ❌ Wrong — !remainingTasks never triggers, it's always an array
if (!remainingTasks) { ... }

// ✅ Correct — if nothing was removed, the task didn't exist
if (remainingTasks.length === tasks.length) {
  set.status = 404;
}
```

---

## Why Swapping Methods Breaks Things

| If you use...                | Where you meant...      | What actually breaks                                                         |
| ---------------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| `.find()` in DELETE          | `.filter()`             | Returns `Task` not `Task[]` → TypeScript error + `saveTasks` gets wrong type |
| `.findIndex()` in DELETE     | `.filter()`             | Returns a number, not the filtered array — you'd overwrite with an index     |
| `!taskIndex` in PATCH        | `taskIndex === -1`      | Task at index 0 always 404s — silent bug, no crash                           |
| `!task` in findIndex context | correct `.find()` check | Same index-0 trap                                                            |

---

## The Operator Connection

```
===  →  "is this the one?"     → find / findIndex
!==  →  "is this NOT the one?" → filter
```

`filter` with `!==` is the only place inequality appears because DELETE is the only operation where you want **everything except the match**. Every other operation — GET, PATCH — wants the match itself, so they use `===`.

---

## Full Picture

```
GET /tasks         → tasks                          (no method, return all)
GET /tasks/:id     → tasks.find(=== id)             → Task | undefined
PATCH /tasks/:id   → tasks.findIndex(=== id)        → number (index position)
DELETE /tasks/:id  → tasks.filter(!== id)            → Task[] (survivors)
```
