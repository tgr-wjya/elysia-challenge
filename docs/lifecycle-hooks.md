# Elysia Lifecycle Hooks — Practical Reference

> Written for someone who already understands how routes work and just needs to understand where hooks fit in the request/response cycle.

---

## The Mental Model

A request in Elysia doesn't just hit a route handler and leave. It travels through a pipeline. Hooks are checkpoints along that pipeline where you can intercept, modify, or react to things — without touching the route handler itself.

```
Request → beforeHandle → Route Handler → afterHandle → Response
                                ↓
                           (if error)
                            onError
```

`derive` is a bit different — it's not a checkpoint, it's a setup step that enriches the context before anything else runs.

The key principle: **hooks keep your route handlers clean.** A route handler should only do one thing. Everything else — auth, rate limiting, headers, error formatting — belongs in a hook.

---

## `beforeHandle`

Runs **before** the route handler. If you return something from `beforeHandle`, the route handler **never runs** — Elysia uses your return value as the response instead.

This is the interceptor. Use it for anything that should block or modify a request before your business logic touches it.

**What it's for:** rate limiting, authentication checks, input validation that doesn't fit schema, logging incoming requests.

**The critical behavior:** returning early from `beforeHandle` short-circuits the entire pipeline. The route handler, `afterHandle`, all of it — skipped. Only `onError` can still fire if something throws.

```typescript
// Unrelated example — guarding a route by time of day
app.get('/morning-only', () => 'Good morning!', {
  beforeHandle: ({ set }) => {
    const hour = new Date().getHours();
    if (hour >= 12) {
      set.status = 403;
      return 'This route is only available before noon.';
    }
    // return nothing = let the request through
  },
});
```

**What `set.status` does:** `set` is Elysia's mutable response object available in every hook. Assign to `set.status` to control the HTTP status code of your early return.

---

## `afterHandle`

Runs **after** the route handler returns, before the response is sent. You receive the handler's response and can modify it — or just observe it.

Use it for anything that should happen to every response without the route handler caring about it: injecting headers, measuring response time, logging outgoing responses.

**What it's for:** adding headers globally, CORS, timing, response transformation.

**The key behavior:** the route handler's return value is available here. You can mutate the response or replace it entirely. The original response body passes through unchanged unless you explicitly change it.

```typescript
// Unrelated example — stamping every response with a request ID
app.get('/data', () => ({ value: 42 }), {
  beforeHandle: ({ store }) => {
    store.startTime = Date.now();
  },
  afterHandle: ({ response, set, store }) => {
    set.headers['X-Request-Id'] = crypto.randomUUID();
    set.headers['X-Duration'] = `${Date.now() - store.startTime}ms`;
  },
});
```

**Pairing with `beforeHandle`:** a common pattern is storing a value in `beforeHandle` (like `Date.now()`) and reading it in `afterHandle` to calculate a delta. `store` is shared mutable state that persists across the lifecycle of a single request.

---

## `onError`

Runs **only when something throws.** This includes errors thrown manually in your route handler, validation errors from Elysia's schema system, and unexpected runtime errors.

Without `onError`, Elysia returns its own default error format. With it, you control exactly what the client sees when something goes wrong.

**What it's for:** consistent error formatting, error logging, mapping error types to specific status codes.

**The key behavior:** you receive an `error` object with a `code` and `message`. You return whatever you want the client to receive instead of the raw error.

```typescript
// Unrelated example — formatting all errors the same way
app.onError(({ code, error, set }) => {
  console.error(`[${code}]`, error.message);

  // NOTE TO MYSELF: This returns 404 status, which means its used for params checking or route validation.
  // Which explains why we're letting the rest be 500 since its an internal server error that our route handler didn't expect.
  if (code === 'NOT_FOUND') set.status = 404;
  else set.status = 500;

  return {
    error: code,
    message: error.message,
    timestamp: new Date().toISOString(),
  };
});
```

**Elysia's built-in error codes you'll encounter:**

| Code                    | When it fires                         |
| ----------------------- | ------------------------------------- |
| `NOT_FOUND`             | No route matched the request          |
| `VALIDATION`            | Body/query/params failed schema check |
| `PARSE`                 | Malformed JSON in request body        |
| `INTERNAL_SERVER_ERROR` | Unhandled runtime error               |

You can also throw your own errors inside a handler using `throw new Error('message')` and `onError` will catch them. If you want control over the status code on a thrown error, assign `set.status` before throwing.

---

## `derive`

Not a checkpoint — a context builder. Runs before the route handler and adds custom properties to the request context. Every hook and handler that runs after it can access those properties.

The difference between `derive` and `beforeHandle` is intent: `derive` enriches context, `beforeHandle` makes decisions. `derive` should never return early or block a request.

**What it's for:** extracting the request IP, parsing the user-agent, decoding an auth token into a user object, anything you'd otherwise repeat at the top of every handler.

**The key behavior:** whatever object you return from `derive` gets merged into the context. Route handlers can then destructure it directly.

```typescript
// Unrelated example — making the current time available everywhere
app.derive(({ request }) => {
  return {
    meta: {
      receivedAt: new Date().toISOString(),
      language: request.headers.get('Accept-Language') ?? 'unknown',
    },
  };
});

// Now every route handler can do:
app.get('/info', ({ meta }) => meta);
```

**Why this matters vs doing it in the handler:** if you extract the IP in `derive`, it's available to `beforeHandle` too — which means your rate limiter can use it without the handler being involved at all.

---

## How They Fit Together

A request that hits a protected route with timing, error handling, and enriched context goes through this sequence:

```
Request arrives
  → derive         (build context: IP, user, metadata)
  → beforeHandle   (decide: allow or block?)
      if blocked → send early response, skip everything below
      if allowed ↓
  → route handler  (do the actual work)
  → afterHandle    (modify response: add headers, log)
  → send response

  if anything throws at any point:
  → onError        (format the error, log it, send clean response)
```

Each hook has one job. They compose — not conflict.

---

## Scope: Global vs Local

Hooks can be attached globally (every route) or locally (one route only).

**Global** — attach directly to the app instance. Affects every route.

```typescript
app.onError(({ error }) => ({ message: error.message }));
app.derive(({ request }) => ({ ip: request.headers.get('x-forwarded-for') }));
```

**Local** — attach as a second argument to a specific route. Only affects that route.

```typescript
app.post('/signup', handler, {
  beforeHandle: rateLimiter,
});
```

For milestones 6–9 you'll likely mix both: `onError` and `derive` want to be global, `beforeHandle` for rate limiting is route-specific.

---

## Quick Reference

| Hook           | When it runs      | Returns something?            | Primary use             |
| -------------- | ----------------- | ----------------------------- | ----------------------- |
| `derive`       | Before everything | Yes — merged into context     | Enrich context once     |
| `beforeHandle` | Before handler    | Optional — blocks if returned | Auth, rate limiting     |
| `afterHandle`  | After handler     | Optional — replaces response  | Headers, timing         |
| `onError`      | On any throw      | Yes — the error response      | Consistent error format |
