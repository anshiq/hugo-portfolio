---
date: '2025-12-31T12:49:24+05:30'
title: 'React Internals & Architecture'
---

This guide covers the internal mechanisms of React: how the scheduler works, reconciliation, rendering phases, event handling, hydration, and modern features like the React Compiler and Server Components.

---

## Fiber Architecture

React uses a **Fiber** architecture instead of a traditional call stack. Fibers are lightweight JavaScript objects representing work to be done.

### What is a Fiber?

A fiber is a data structure with these properties:

```javascript
{
  type: 'div',                    // Component type (string for DOM, function for custom)
  props: { children: [...] },     // Props passed to component
  key: 'unique-key',              // Key for list reconciliation
  parent: parentFiber,            // Link to parent fiber
  child: childFiber,              // Link to first child
  sibling: siblingFiber,          // Link to next sibling
  alternate: previousFiber,       // Link to previous version (for diffing)
  effectTag: 'PLACEMENT',         // What needs to be done (UPDATE, PLACEMENT, DELETION)
  hooks: [hook1, hook2],          // Hooks state for function components
  _owner: ownerComponent,         // Who rendered this fiber
  index: 0,                       // Position in parent's children
}
```

### Why Fibers?

Before fibers, React used a synchronous recursive rendering algorithm. This meant:
- Once rendering started, it couldn't be interrupted
- Long renders would block the main thread, freezing the UI
- No priority system—all updates were equally important

Fibers enable:
- **Incremental rendering** — Work can be split across multiple frames
- **Prioritization** — Urgent updates (input) interrupt low-priority ones (data fetching)
- **Error boundaries** — Errors can be caught and handled gracefully
- **Suspense** — Rendering can pause and resume

### Work Loop

React's scheduler continuously processes fibers:

```javascript
// Simplified work loop
function workLoop() {
  while (nextUnitOfWork && shouldYield()) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (nextUnitOfWork === null) {
    // All work done, commit phase
    commitRoot();
  } else {
    // Schedule next batch
    scheduleCallback(workLoop);
  }
}

function performUnitOfWork(fiber) {
  // 1. Render/reconcile this fiber
  // 2. Return next fiber to process
  // 3. Or return null if done
}
```

---

## Scheduler

The React Scheduler manages when work gets executed. It's crucial for keeping the UI responsive.

### Priority Levels

React has multiple priority levels:

```javascript
// From react-dom package
ImmediatePriority       // 1 - Sync (blocking)
UserBlockingPriority    // 2 - High (user interaction)
NormalPriority          // 3 - Medium (data fetching)
LowPriority             // 4 - Low (non-urgent)
IdlePriority            // 5 - Idle (lowest)
```

### Scheduling Work

```javascript
// High priority (e.g., input)
import { unstable_scheduleCallback, unstable_UserBlockingPriority } from 'scheduler';

unstable_scheduleCallback(
  unstable_UserBlockingPriority,
  () => {
    // This runs soon
  }
);

// Low priority (e.g., data fetching)
import { unstable_LowPriority } from 'scheduler';

unstable_scheduleCallback(
  unstable_LowPriority,
  () => {
    // This can wait
  }
);
```

### Time Slicing

React yields the main thread every ~5ms to let the browser:
- Handle user input
- Run other scripts
- Repaint the screen

```javascript
// Simplified time slicing
const timeRemaining = () => {
  const now = performance.now();
  const frameDeadline = frameDue; // ~5ms per frame
  return frameDeadline - now;
};

function workLoop() {
  while (nextUnitOfWork && timeRemaining() > 0) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (nextUnitOfWork) {
    // More work, schedule next frame
    scheduleCallback(workLoop);
  } else {
    // Done, commit
    commitRoot();
  }
}
```

### useTransition Internals

`useTransition` leverages the scheduler:

```javascript
const [isPending, startTransition] = useTransition();

startTransition(() => {
  // This callback runs with LowPriority
  // Can be interrupted by input (UserBlockingPriority)
  setSlowState(newValue);
});
```

Internally, React schedules the transition callback with low priority, allowing high-priority updates to jump the queue.

---

## Event Delegation

React doesn't attach event listeners to individual elements. Instead, it uses **event delegation**—one listener at the root captures all events.

### How It Works

```javascript
// React's simplified event delegation
const rootElement = document.getElementById('root');

// One listener for all events
rootElement.addEventListener('click', handleDOMEvent, true); // Capture phase

function handleDOMEvent(nativeEvent) {
  // Find the React component that should handle this
  const fiberNode = nativeEvent.target._reactInternalFiber;
  
  // Traverse up the fiber tree calling event handlers
  let current = fiberNode;
  while (current) {
    if (current.memoizedProps.onClick) {
      current.memoizedProps.onClick(syntheticEvent);
    }
    current = current.parent;
  }
}
```

### Why Event Delegation?

- **Memory efficient** — One listener instead of hundreds
- **Dynamic elements** — Newly mounted components automatically work
- **Easier cleanup** — Single listener to remove
- **Control** — React can intercept and batch events

### Event System Changes (React 17+)

React 17 changed event delegation to attach listeners to the root component container instead of `document`. This allows multiple React apps on the same page without conflicts.

```javascript
// React 16 - listeners on document
document.addEventListener('click', handleClick);

// React 17+ - listeners on root container
rootContainer.addEventListener('click', handleClick);
```

---

## Synthetic Events

React wraps native browser events into **Synthetic Events**—a cross-browser API that normalizes differences.

### Synthetic Event Structure

```javascript
function handleClick(event) {
  console.log(event); // SyntheticEvent, not native MouseEvent
  console.log(event.nativeEvent); // Access native browser event
  
  // Common properties (normalized across browsers)
  event.type; // 'click'
  event.target; // The element clicked
  event.currentTarget; // The element with the handler
  event.preventDefault(); // Prevent default behavior
  event.stopPropagation(); // Stop bubbling
  
  // Browser-specific properties might differ
}
```

### Event Pooling (React 16)

In React 16, SyntheticEvents were pooled for performance. The same object was reused for all events:

```javascript
// React 16
function handleClick(event) {
  console.log(event.type); // 'click'
  
  setTimeout(() => {
    console.log(event.type); // null! Event was pooled
  }, 0);
}
```

**This was removed in React 17+** because modern browsers are efficient enough.

### Asynchronous Event Access

In React 17+, you can safely access events asynchronously:

```javascript
function handleChange(event) {
  // Safe to access asynchronously
  setTimeout(() => {
    console.log(event.target.value); // Works in React 17+
  }, 0);
}
```

---

## Batching

**Batching** means React groups multiple state updates together and re-renders only once per batch.

### Automatic Batching (React 18+)

React 18 automatically batches updates:

```javascript
function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  function handleClick() {
    setCount(c => c + 1); // Update 1
    setName('Alice');     // Update 2
    // React batches both updates
    // Single re-render with both changes
  }

  return <button onClick={handleClick}>Update</button>;
}
```

**Before React 18**, updates in event handlers were batched, but async code wasn't:

```javascript
// React 16-17: TWO re-renders
function handleClick() {
  setCount(c => c + 1);      // Re-render 1
  
  setTimeout(() => {
    setName('Bob');            // Re-render 2 (not batched)
  }, 0);
}

// React 18: ONE re-render (batched automatically)
```

### Manual Batching

In rare cases, you can prevent batching with `flushSync`:

```javascript
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1); // Re-render immediately
  });
  
  setName('Charlie'); // Batched with next update
}
```

### Why Batching?

- **Performance** — Fewer re-renders
- **Consistency** — State is unified during render
- **Predictability** — Multiple updates see each other

---

## Render Phase

The **render phase** is where React calculates what needs to change. It's **pure** and has no side effects.

### Render Phase Steps

```javascript
// Simplified render phase
function renderPhase(fiber) {
  // 1. Call function component or class render method
  const newProps = fiber.props;
  const output = fiber.type(newProps); // Or this.render() for class
  
  // 2. Compare with previous version (reconciliation)
  const oldFiber = fiber.alternate;
  if (shouldUpdate(oldFiber, fiber)) {
    fiber.effectTag = 'UPDATE';
  }
  
  // 3. Recursively process children
  if (output.children) {
    const childFiber = createFiber(output.children[0]);
    fiber.child = childFiber;
    renderPhase(childFiber);
  }
}
```

### Important: Render Phase is Pure

The render phase **must not have side effects**:

```javascript
// GOOD: Pure
function MyComponent() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

// BAD: Side effect in render phase
function BadComponent() {
  fetch('/api/data'); // Side effect! Called multiple times
  return <div>...</div>;
}

// GOOD: Side effect in useEffect (commit phase)
function GoodComponent() {
  useEffect(() => {
    fetch('/api/data');
  }, []);
  return <div>...</div>;
}
```

Why? React may call render multiple times (for Suspense, Error Boundaries, concurrent features), so side effects shouldn't happen here.

### Render Phase Interruption

During the render phase, React can pause and resume:

```javascript
// High-priority update interrupts render
startTransition(() => {
  setSlowData(data); // Low-priority, causes long render
});

// User types (UserBlockingPriority)
setSearchQuery('text'); // Interrupts the low-priority render
// React discards the render work and starts over with new input
```

This is only safe during render phase because no DOM changes have occurred yet.

---

## Commit Phase

The **commit phase** applies changes to the DOM and runs side effects. It's **synchronous and uninterruptible**.

### Commit Phase Steps

```javascript
// Simplified commit phase
function commitRoot(fiber) {
  // 1. Commit all DOM changes
  commitAllWork(fiber);
  
  // 2. Run layout effects
  commitLayoutEffects(fiber);
  
  // 3. Paint to screen
  // (Browser repaints)
  
  // 4. Run passive effects (useEffect)
  flushPassiveEffects();
}

function commitAllWork(fiber) {
  if (fiber.effectTag === 'PLACEMENT') {
    insertDOM(fiber);
  } else if (fiber.effectTag === 'UPDATE') {
    updateDOM(fiber);
  } else if (fiber.effectTag === 'DELETION') {
    removeDOM(fiber);
  }
  
  // Recursively commit children
  if (fiber.child) commitAllWork(fiber.child);
  if (fiber.sibling) commitAllWork(fiber.sibling);
}
```

### Order of Effects

1. **Render phase** — Calculate changes (can be interrupted)
2. **Commit phase begins**:
   - Mutations (DOM updates) — **Synchronous**
   - `useLayoutEffect` runs — **Synchronous** (before paint)
   - Browser paints screen
   - `useEffect` runs — **Asynchronous** (after paint)

```javascript
function Component() {
  useLayoutEffect(() => {
    console.log('3. Runs after DOM updated, before paint');
  }, []);

  useEffect(() => {
    console.log('4. Runs after paint (async)');
  }, []);

  console.log('1. Render phase');
  return <div>Content</div>;
}

// Order: 1 → 2 (commit mutations) → 3 (useLayoutEffect) → paint → 4 (useEffect)
```

### Why Separate Phases?

- **Render phase is interruptible** — React can prioritize urgent updates
- **Commit phase is synchronous** — Ensures DOM consistency and predictable side effects

---

## Reconciliation

**Reconciliation** (or "diffing") is how React determines which DOM elements changed.

### Reconciliation Algorithm

React compares fibers using these rules:

```javascript
function canReuseElement(oldFiber, newProps) {
  // Rule 1: Same type?
  if (oldFiber.type !== newProps.type) return false;
  
  // Rule 2: Same key?
  if (oldFiber.key !== newProps.key) return false;
  
  // If both rules pass, this fiber can be reused
  return true;
}
```

### Key Importance

Keys are **critical** for reconciliation, especially in lists:

```javascript
// WITHOUT keys - elements can get mixed up
function List({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item.name}</li> // BAD: Using index as key
      ))}
    </ul>
  );
}

// WITH keys - elements correctly matched
function List({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li> // GOOD: Stable unique key
      ))}
    </ul>
  );
}
```

**Why this matters:**

```javascript
// Initial: [{ id: 1, name: 'Alice', input: 'text1' }]
// After insert: [{ id: 2, name: 'Bob' }, { id: 1, name: 'Alice', input: 'text1' }]

// WITHOUT key (uses index):
// Old: <li key={0}>Alice <input value="text1" /></li>
// New: <li key={0}>Bob <input /></li> ← Reuses same element, wrong input!
// → Input value disappears

// WITH key (uses id):
// Old: <li key={1}>Alice <input value="text1" /></li>
// New: <li key={2}>Bob</li> ← Creates new element
// New: <li key={1}>Alice <input value="text1" /></li> ← Reuses same element, input preserved
```

### Heuristics

React uses heuristics for fast diffing (O(n) instead of O(n³)):

1. **Different element types** → Rebuild the subtree
2. **Same element type** → Compare props
3. **Lists** → Match by key

```javascript
// Heuristic 1: Different type = rebuild
<div>Content</div>
<span>Content</span> // Completely new, old div destroyed

// Heuristic 2: Same type = compare props
<Component color="red" />
<Component color="blue" /> // Reuse, update color prop

// Heuristic 3: Lists = match by key
[<li key="a">A</li>, <li key="b">B</li>]
[<li key="b">B</li>, <li key="a">A</li>] // Correct order, no re-render
```

---

## Hydration

**Hydration** is the process of attaching React to server-rendered HTML.

### Server-Side Rendering (SSR)

1. Server renders React component to HTML string
2. HTML sent to browser
3. Browser displays HTML immediately
4. React hydrates (attaches interactivity)

```javascript
// Server
import { renderToString } from 'react-dom/server';
const html = renderToString(<App />);
res.send(html);

// Client
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);
```

### Hydration Mismatch

The server-rendered HTML must match what React expects, or hydration fails:

```javascript
// Server: generates random ID
<div id={Math.random()}>Content</div>

// Client: generates different random ID
// → Hydration mismatch warning
```

**Solutions:**

```javascript
// Use useId hook (generates same ID on server and client)
import { useId } from 'react';

function Component() {
  const id = useId();
  return <div id={id}>Content</div>; // Same on both
}

// Or use static content
<div id="known-id">Content</div>
```

### Selective Hydration

React 18 can hydrate parts of the page progressively:

```javascript
// App shell hydrates immediately
<Header />

{/* This hydrates when it becomes visible */}
<Suspense fallback={<Skeleton />}>
  <Comments />
</Suspense>
```

---

## React Compiler

The **React Compiler** (experimental, coming in React 19) automatically optimizes React code by analyzing data flow and memoizing values.

### What It Does

The compiler automatically:
- Memoizes expensive computations
- Memoizes functions
- Optimizes component renders
- Removes unnecessary re-renders

### Before Compiler

You had to manually memoize:

```javascript
// Manual memoization
function Parent() {
  const [count, setCount] = useState(0);

  const expensiveValue = useMemo(() => {
    return complexCalculation(count);
  }, [count]);

  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return <Child value={expensiveValue} onClick={handleClick} />;
}
```

### With Compiler

The compiler does it automatically:

```javascript
// Same code, compiler automatically optimizes
function Parent() {
  const [count, setCount] = useState(0);

  const expensiveValue = complexCalculation(count);

  const handleClick = () => {
    setCount(c => c + 1);
  };

  return <Child value={expensiveValue} onClick={handleClick} />;
}

// Compiler transforms to:
// - Memoize expensiveValue based on count
// - Memoize handleClick
// - Avoid re-rendering Child unnecessarily
```

### Compiler Fundamentals

The compiler:
1. **Analyzes** how data flows through components
2. **Identifies** what depends on what
3. **Injects** memoization automatically
4. **Prevents** unnecessary re-renders

This enables developers to write simpler code without sacrificing performance.

---

## React Server Components (RSC)

React Server Components (RSC) run on the server, not the client. They enable rendering without JavaScript overhead.

### Key Differences

| Feature | Client Component | Server Component |
|---------|------------------|------------------|
| Runs on | Browser | Server |
| Can use hooks | Yes | No |
| Can access secrets | No | Yes |
| Can access databases | No (via API) | Yes (direct) |
| Bundle size | Increases | No increase |
| Interactivity | Yes | No |

### Server Component Example

```javascript
// app/PostList.jsx - Server Component (default in Next.js 13+)
export default async function PostList() {
  // Direct database access
  const posts = await db.posts.findAll();

  // No JavaScript sent to client
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </li>
      ))}
    </ul>
  );
}
```

### Client Component (Mark with 'use client')

```javascript
// app/SearchBox.jsx - Client Component
'use client'; // This directive marks the component as client-only

import { useState } from 'react';

export default function SearchBox() {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Composition

Server and client components work together:

```javascript
// app/page.jsx - Server Component
import PostList from './PostList'; // Server Component
import SearchBox from './SearchBox'; // Client Component

export default function Page() {
  return (
    <div>
      {/* Run on server */}
      <SearchBox /> {/* Marked with 'use client' */}
      <PostList /> {/* Server component, no JS */}
    </div>
  );
}
```

**Rules:**
- Server components can **import** client components
- Client components **cannot import** server components
- Pass server data to client via props

```javascript
// app/page.jsx - Server Component
import ClientComponent from './ClientComponent'; // Client Component

async function getData() {
  const data = await db.fetch();
  return data;
}

export default async function Page() {
  const data = await getData();

  return (
    // Pass server data to client component
    <ClientComponent data={data} />
  );
}

// app/ClientComponent.jsx - Client Component
'use client';

export default function ClientComponent({ data }) {
  return <div>{data.title}</div>;
}
```

### Benefits

- **Smaller bundles** — Server logic never shipped to client
- **Direct database access** — No API layer needed
- **Security** — Secrets stay on server
- **Performance** — More work on server, less on client

---

## Additional React Internals Topics

### Virtual DOM

The **Virtual DOM** is an in-memory representation of the real DOM. React uses it for diffing.

```javascript
// Virtual DOM (React fiber tree)
{
  type: 'div',
  props: { className: 'container' },
  children: [
    { type: 'h1', children: 'Title' },
    { type: 'p', children: 'Content' }
  ]
}

// Real DOM
<div class="container">
  <h1>Title</h1>
  <p>Content</p>
</div>
```

React renders to Virtual DOM, diffs it, then updates the real DOM.

### Hook Implementation

Hooks work by maintaining a linked list of hook instances per component:

```javascript
// Simplified hook implementation
let componentHooks = [];
let currentHookIndex = 0;

function useState(initialValue) {
  const index = currentHookIndex;
  componentHooks[index] = componentHooks[index] || initialValue;

  const setState = (value) => {
    componentHooks[index] = value;
    scheduleRender();
  };

  const state = componentHooks[index];
  currentHookIndex++;

  return [state, setState];
}

function render() {
  currentHookIndex = 0; // Reset for next render
  return MyComponent();
}
```

**Why hooks must be in order:**
- Hooks are identified by position, not name
- Calling hooks conditionally breaks the index mapping

### Concurrent Mode

Concurrent mode allows React to work on multiple tasks in parallel (not literally parallel, but interruptible):

```javascript
// Without Concurrent Mode: blocking render
longRender(); // Freezes UI

// With Concurrent Mode: interruptible render
startTransition(() => {
  longRender(); // Can be interrupted by user input
});
```

### Strict Mode

`<StrictMode>` intentionally double-invokes functions to detect bugs:

```javascript
function Component() {
  console.log('render'); // Called twice in StrictMode (dev only)
  return <div>Content</div>;
}

// Output in development with StrictMode:
// render
// render
```

This helps catch:
- Side effects in render
- Memory leaks in useEffect
- Unexpected state mutations

---

## Interview Tips

**Common React Internals Questions:**

1. **"How does React's reconciliation work?"**
   - Explain fiber architecture, diffing algorithm, and key importance

2. **"What's the difference between render and commit phases?"**
   - Render is interruptible and pure; commit is synchronous with side effects

3. **"How does event delegation work in React?"**
   - Single listener at root, synthetic events for normalization

4. **"Why can't you call hooks conditionally?"**
   - Hooks are identified by call order, conditional calls break the index

5. **"What's hydration?"**
   - Attaching React to server-rendered HTML to add interactivity

6. **"How does batching improve performance?"**
   - Multiple state updates trigger single render pass

7. **"What are Server Components and why use them?"**
   - Run on server, reduce bundle size, enable direct DB access

8. **"How does the scheduler prioritize work?"**
   - Different priority levels allow important updates to interrupt others

