## bun mock/spy cheat sheet

### Common Bun mock/spy methods

| Method                 | What it does                                                  | Example usage                              |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| spyOn(obj, fn)         | Creates a spy/mock for a function on an object                | `const spy = spyOn(Bun, 'write')`          |
| mockReturnValue(val)   | Makes the mock always return `val` (for sync functions)       | `spy.mockReturnValue(123)`                 |
| mockResolvedValue(val) | Makes the mock always resolve to `val` (for async functions)  | `spy.mockResolvedValue(42)`                |
| mockRejectedValue(err) | Makes the mock always reject with `err` (for async functions) | `spy.mockRejectedValue(new Error('fail'))` |
| mockImplementation(fn) | Makes the mock call your custom implementation                | `spy.mockImplementation((x) => x * 2)`     |
| restore()              | Restores the original function (removes the mock/spy)         | `spy.restore()`                            |

### When to use which?

- **mockReturnValue:**
  - Use for synchronous functions you want to always return a fixed value.
- **mockResolvedValue:**
  - Use for async functions (returning Promise) you want to always resolve to a value.
- **mockRejectedValue:**
  - Use for async functions you want to always reject with an error.
- **mockImplementation:**
  - Use when you want custom logic for the mock (e.g., return different values based on input).
- **restore:**
  - Use to clean up after your test so the real function is used again.

### Example

```ts
const spy = spyOn(Bun, 'write');
spy.mockResolvedValue(42); // Bun.write will always resolve to 42 in this test

// For sync:
const syncSpy = spyOn(Math, 'random');
syncSpy.mockReturnValue(0.5); // Math.random() always returns 0.5

// For custom logic:
spy.mockImplementation((file, data) => {
  if (file === 'test.json') return Promise.resolve(1);
  return Promise.resolve(0);
});

// Restore after test
spy.restore();
```

---

### What is mocking?

Mocking replaces a real function or module with a fake one during tests. This lets you control what the function returns or how it behaves, so you can test your code in isolation.

### What is spying?

Spying lets you observe calls to a function (how many times, with what arguments, etc.) without changing its behavior by default. You can also combine spying with mocking to both observe and fake the result.

### Common use cases

- **Mocking file reads:**
  - Use when your code reads from a file (e.g., Bun.file). Mock it to return a controlled value so your test doesn't depend on real files.
  - Example:
    ```ts
    spyOn(Bun, 'file').mockReturnValue({
      json: async () => [{ id: 1, name: 'Test' }],
      exists: async () => true,
    } as unknown as ReturnType<typeof Bun.file>);
    ```

- **Mocking file writes:**
  - Use when your code writes to a file (e.g., Bun.write). Mock it to avoid changing real files and to check if your code tried to write.
  - Example:
    ```ts
    const writeSpy = spyOn(Bun, 'write').mockResolvedValue(42); // 42 = bytes written
    expect(writeSpy).toHaveBeenCalled();
    ```

- **Mocking for PATCH/PUT:**
  - Mock the original (unedited) value as the file content. The PATCH handler should update it, and you assert the result.

- **Mocking for GET:**
  - Mock the value you want your endpoint to return.

- **Mocking for POST:**
  - Mock the initial state (e.g., an empty array or existing items), then assert that the write was called with the new item added.
