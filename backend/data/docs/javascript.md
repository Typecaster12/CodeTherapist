# JavaScript Documentation Reference

## Asynchronous JavaScript: Promises and Async/Await
JavaScript handles async tasks using Promises or async/await syntax. An `async` function always returns a Promise. 
If an async operation fails, it throws an error that must be caught inside a `try/catch` block, or by chaining `.catch()` at the callsite. Failing to handle promise rejections leads to unhandled rejection warnings.
Example:
```javascript
async function fetchUser() {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    console.error("Failed to retrieve user:", err);
    throw err;
  }
}
```

## Array Operations and Immutable State
In modern frameworks (like React), state should be treated as immutable. Avoid mutating arrays in-place (e.g. using `push`, `pop`, `shift`, `splice`).
Instead, use non-mutating operations that return a brand new array reference:
1. Adding items: use the spread operator `[...prev, newItem]`.
2. Removing items: use `.filter(item => item.id !== targetId)`.
3. Modifying items: use `.map(item => item.id === targetId ? { ...item, name: "New" } : item)`.

## Scope: var vs let vs const
- `const`: Block-scoped, cannot be re-assigned. Use by default.
- `let`: Block-scoped, can be re-assigned. Use for loops or counter variables.
- `var`: Function-scoped, hoisted. Avoid using in modern codebases.
