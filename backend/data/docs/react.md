# React Documentation Reference

## React State Updates are Asynchronous
React state updates (using `setState` or the updater function from `useState`) do not immediately change the state value in the current execution block. Instead, they schedule a state transition. Accessing state immediately after setting it will yield the old value.
To perform computations using the most recent state value, use the functional updater form:
```javascript
setCount(prevCount => prevCount + 1);
```

## Effect Hook Lifecycles and Cleanup
The `useEffect` hook lets you run side-effects. The dependency array governs when the effect runs:
1. Empty array `[]`: Runs once after initial render.
2. Dependencies list `[dep1, dep2]`: Runs on mount and whenever deps change.
3. No array: Runs on every single render.
Always return a cleanup function inside `useEffect` to prevent memory leaks (e.g. clear intervals, unsubscribe from events, cancel promises):
```javascript
useEffect(() => {
  const handle = setInterval(() => {}, 1000);
  return () => clearInterval(handle);
}, []);
```

## Rules of Hooks
1. Only Call Hooks at the Top Level: Don't call Hooks inside loops, conditions, or nested functions.
2. Only Call Hooks from React Functions: Don't call Hooks from regular JavaScript functions.

## Component Re-mounts on Definition
Never define a component inside another component. Doing so causes the inner component to be re-created as a new function reference on every render, prompting React to unmount the entire old sub-tree and mount a new one. This results in lost focus, reset input fields, and poor performance.
Always declare helper components at the file level outside the parent rendering function.
