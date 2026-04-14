---
date: '2025-12-31T12:49:24+05:30'
title: 'React — A Complete Guide'
---

React is a JavaScript library built by Meta for constructing user interfaces. At its core, React lets you build UIs out of small, reusable pieces called **components**. Each component manages its own structure and behavior, and React takes care of efficiently updating the DOM when data changes. This unidirectional data-flow model—combined with a virtual DOM—makes React predictable and fast even in large applications.

---

## Components

Components are the fundamental building block of every React application. A component is simply a function (or class) that accepts some input called **props** and returns JSX—a syntax extension that looks like HTML but compiles to regular JavaScript.

### Function Components

The modern way to write a component is a plain JavaScript function. It receives a single `props` object and returns JSX.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Greeting name="Anshik" />
```

Function components are the standard today. Class components still exist in legacy codebases, but new code should always use function components with hooks.

### Composing Components

Components can render other components, creating a tree. Data flows downward as props; nothing flows upward except through callback functions passed as props.

```jsx
function Avatar({ username }) {
  return <img src={`/avatars/${username}.png`} alt={username} />;
}

function UserCard({ user }) {
  return (
    <div className="card">
      <Avatar username={user.username} />
      <p>{user.bio}</p>
    </div>
  );
}
```

### JSX Rules

JSX must return a **single root element**. Wrap siblings in a `<div>` or the shorthand empty tag `<>...</>` (Fragment). All tags must be closed. JavaScript expressions go inside `{}`.

```jsx
function List({ items }) {
  return (
    <>
      <h2>Items</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </>
  );
}
```

The `key` prop on list items is required—React uses it to identify which items changed, were added, or removed.

---

## Props

Props are the mechanism for passing data from a parent component to a child. They are read-only; a component must never modify its own props.

```jsx
function Button({ label, onClick, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

<Button label="Submit" onClick={handleSubmit} />
<Button label="Cancel" onClick={handleCancel} disabled={true} />
```

You can pass any JavaScript value as a prop: strings, numbers, arrays, objects, functions, or even other components. The `children` prop is special—it receives whatever you nest between the component's opening and closing tags.

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="body">{children}</div>
    </div>
  );
}

<Card title="Welcome">
  <p>This content is passed as children.</p>
</Card>
```

---

## State & the useState Hook

State is data that can change over time and should trigger a re-render when it does. In function components, state is managed with the `useState` hook.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

`useState` returns a pair: the current value and a setter function. Calling the setter schedules a re-render with the new value. Never mutate state directly—always use the setter.

### Functional Updates

When the new state depends on the previous state, pass a function to the setter. This ensures you always work with the latest value, which matters in async contexts.

```jsx
setCount((prev) => prev + 1);
```

### State with Objects

When state is an object, spread the existing state to avoid losing other fields.

```jsx
const [form, setForm] = useState({ name: '', email: '' });

function handleChange(e) {
  setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
}
```

---

## The useEffect Hook

`useEffect` lets you synchronize a component with an external system—fetching data, setting up subscriptions, manipulating the DOM, or setting timers. It runs after every render by default, but you can control this with a **dependency array**.

```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUser(data);
      });

    // Cleanup: runs before the next effect or on unmount
    return () => {
      cancelled = true;
    };
  }, [userId]); // Re-runs whenever userId changes

  if (!user) return <p>Loading...</p>;
  return <h2>{user.name}</h2>;
}
```

### Dependency Array Rules

- **No array** — effect runs after every render.
- **Empty array `[]`** — effect runs once after the initial render (like `componentDidMount`).
- **`[dep1, dep2]`** — effect runs when any listed dependency changes.

The cleanup function (the return value) runs before the next effect execution and on unmount. Always clean up subscriptions, timers, and event listeners here to avoid memory leaks.

---

## The useRef Hook

`useRef` gives you a mutable container that persists across renders without causing a re-render when changed. Its most common uses are holding a reference to a DOM element and storing a mutable value that should not trigger re-renders.

```jsx
import { useRef, useEffect } from 'react';

function AutoFocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} placeholder="I'm focused on mount" />;
}
```

### Storing Mutable Values

```jsx
function Timer() {
  const intervalRef = useRef(null);
  const [seconds, setSeconds] = useState(0);

  function start() {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }

  function stop() {
    clearInterval(intervalRef.current);
  }

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

The interval ID is stored in `intervalRef` so `stop()` can clear it. Storing it in state would needlessly trigger re-renders.

---

## The useContext Hook

Context solves the "prop-drilling" problem—passing data through many layers of components that don't actually need it. You create a context, provide a value at a high level, and any descendant can consume it directly.

```jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <Page />
    </ThemeContext.Provider>
  );
}

function Page() {
  return <Article />;  // doesn't need to know about theme
}

function Article() {
  const theme = useContext(ThemeContext);
  return <div className={`article ${theme}`}>Content here</div>;
}
```

Context is ideal for global concerns like theme, locale, and authentication state. For complex state logic, pair it with `useReducer`.

---

## The useReducer Hook

`useReducer` is an alternative to `useState` for state that involves multiple sub-values or complex transitions. It works like Redux: you dispatch an action, and a pure reducer function computes the next state.

```jsx
import { useReducer } from 'react';

const initialState = { count: 0, step: 1 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'reset':
      return initialState;
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count} (step: {state.step})</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <input
        type="number"
        value={state.step}
        onChange={(e) => dispatch({ type: 'setStep', payload: Number(e.target.value) })}
      />
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

The reducer is a plain function—easy to test in isolation and reason about independently of the UI.

---

## The useMemo Hook

`useMemo` memoizes the result of an expensive computation. React only recomputes the value when one of the listed dependencies changes, skipping the work on other renders.

```jsx
import { useMemo, useState } from 'react';

function PrimeList({ limit }) {
  const [filter, setFilter] = useState('');

  const primes = useMemo(() => {
    const sieve = [];
    for (let i = 2; i <= limit; i++) {
      if (!sieve[i]) sieve.push(i);
      for (let j = i * i; j <= limit; j += i) sieve[j] = true;
    }
    return sieve.filter((n) => typeof n === 'number');
  }, [limit]); // Only recomputed when `limit` changes

  const filtered = primes.filter((p) => String(p).includes(filter));

  return (
    <>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter…" />
      <p>{filtered.join(', ')}</p>
    </>
  );
}
```

Don't reach for `useMemo` everywhere—it adds overhead. Use it when profiling shows a computation is genuinely slow.

---

## The useCallback Hook

`useCallback` memoizes a function reference itself, returning the same function instance between renders unless its dependencies change. This matters when passing callbacks to child components wrapped in `React.memo`, preventing unnecessary re-renders.

```jsx
import { useCallback, useState } from 'react';

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []); // Stable reference—never changes

  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ExpensiveChild onClick={handleClick} />
      <p>Count: {count}</p>
    </>
  );
}

const ExpensiveChild = React.memo(function ExpensiveChild({ onClick }) {
  console.log('ExpensiveChild rendered');
  return <button onClick={onClick}>Click me</button>;
});
```

Without `useCallback`, `handleClick` would be a new function reference on every render, causing `ExpensiveChild` to re-render even when only `text` changed.

---

## React.memo

`React.memo` is a higher-order component that memoizes a function component. React skips re-rendering the wrapped component if its props haven't changed (by shallow comparison).

```jsx
const Badge = React.memo(function Badge({ label, color }) {
  return <span style={{ background: color }}>{label}</span>;
});
```

For custom comparison logic, pass a second argument—a function that receives the previous and next props and returns `true` if they are equal (meaning skip re-render).

```jsx
const Badge = React.memo(Badge, (prev, next) => prev.label === next.label);
```

---

## The useLayoutEffect Hook

`useLayoutEffect` has the same signature as `useEffect` but fires **synchronously** after all DOM mutations and before the browser paints. Use it when you need to read layout (dimensions, scroll position) and synchronously update the DOM to avoid a visible flicker.

```jsx
import { useLayoutEffect, useRef, useState } from 'react';

function Tooltip({ text, anchor }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const rect = anchor.getBoundingClientRect();
    const tipRect = ref.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2 - tipRect.width / 2,
    });
  }, [anchor]);

  return (
    <div ref={ref} style={{ position: 'fixed', top: pos.top, left: pos.left }}>
      {text}
    </div>
  );
}
```

Prefer `useEffect` for data fetching and side effects that don't need layout information—`useLayoutEffect` blocks the paint and can hurt perceived performance.

---

## Custom Hooks

Custom hooks are regular JavaScript functions whose name starts with `use`. They let you extract and reuse stateful logic across components without changing the component tree.

### useFetch

```jsx
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => { if (!cancelled) setData(json); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// Usage
function Posts() {
  const { data, loading, error } = useFetch('/api/posts');

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;
  return <ul>{data.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

### useLocalStorage

```jsx
import { useState } from 'react';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStored = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStored];
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
    Theme: {theme}
  </button>;
}
```

### useDebounce

```jsx
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQuery) console.log('Searching for:', debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" />;
}
```

---

## Controlled vs Uncontrolled Components

A **controlled** component has its form state managed by React. Every keystroke updates state, and the input value always reflects it.

```jsx
function ControlledForm() {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Submitted: ${value}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

An **uncontrolled** component stores its own state in the DOM. You read the value imperatively via a ref, typically only on submit.

```jsx
function UncontrolledForm() {
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Submitted: ${inputRef.current.value}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="initial" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

Prefer controlled components for complex validation, conditional fields, or when you need to react to every change.

---

## Error Boundaries

Error boundaries are class components (there is no hook equivalent yet) that catch JavaScript errors in their child tree during rendering, in lifecycle methods, and in constructors. They render a fallback UI instead of crashing the whole page.

```jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error, info) {
    console.error('Caught by boundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error">Something went wrong: {this.state.message}</div>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

Wrap sections of your UI independently so an error in one panel doesn't take down the whole app.

---

## React Portals

Portals let you render a child component into a DOM node that exists outside the parent component's DOM hierarchy. Useful for modals, tooltips, and dropdowns that must escape `overflow: hidden` containers.

```jsx
import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}>✕</button>
        {children}
      </div>
    </div>,
    document.body   // rendered directly into <body>
  );
}
```

Even though the modal is rendered in `document.body`, event bubbling still flows through the React tree as if it were inside the parent component.

---

## Lazy Loading & Suspense

`React.lazy` allows you to load a component only when it is first rendered, splitting your bundle automatically. `Suspense` shows a fallback while the lazy component is loading.

```jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const Analytics = lazy(() => import('./Analytics'));

function App() {
  const [tab, setTab] = useState('dashboard');

  return (
    <>
      <nav>
        <button onClick={() => setTab('dashboard')}>Dashboard</button>
        <button onClick={() => setTab('analytics')}>Analytics</button>
      </nav>
      <Suspense fallback={<div>Loading page…</div>}>
        {tab === 'dashboard' ? <Dashboard /> : <Analytics />}
      </Suspense>
    </>
  );
}
```

The `import()` call is dynamic—bundlers like Vite and webpack automatically split the code into separate chunks downloaded on demand.

---

## The useId Hook

`useId` generates a unique, stable ID for accessibility attributes. It solves the problem of matching `id` and `aria-*` attributes between server and client rendering.

```jsx
import { useId } from 'react';

function FormField({ label }) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
}
```

Never use `useId` to generate keys for list items—use the data's own ID for that.

---

## The useTransition Hook

`useTransition` marks certain state updates as non-urgent, allowing React to keep the UI responsive while the update is processed in the background. Updates inside `startTransition` can be interrupted by more urgent updates.

```jsx
import { useState, useTransition } from 'react';

function FilterList({ items }) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(items);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val); // urgent: update the input immediately

    startTransition(() => {
      // non-urgent: filter the large list
      setFiltered(items.filter((i) => i.toLowerCase().includes(val.toLowerCase())));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <span> Updating…</span>}
      <ul>
        {filtered.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </>
  );
}
```

---

## The useDeferredValue Hook

`useDeferredValue` defers re-rendering a specific value until the browser is idle, similar to `useTransition` but for values you receive (e.g., from props) rather than values you control.

```jsx
import { useState, useDeferredValue, useMemo } from 'react';

function SearchResults({ allItems }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => allItems.filter((item) => item.includes(deferredQuery)),
    [allItems, deferredQuery]
  );

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{results.map((r, i) => <li key={i}>{r}</li>)}</ul>
    </>
  );
}
```

The input stays snappy because `query` updates instantly; `deferredQuery` lags behind and only triggers the expensive filter when time allows.

---

## The useImperativeHandle Hook

`useImperativeHandle` customizes the ref object exposed to parent components when using `forwardRef`. Use it to provide a controlled imperative API from a child component.

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react';

const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus() { inputRef.current.focus(); },
    clear() { inputRef.current.value = ''; },
  }));

  return <input ref={inputRef} {...props} />;
});

// Usage
function Form() {
  const inputRef = useRef(null);

  return (
    <>
      <FancyInput ref={inputRef} placeholder="Type here" />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
      <button onClick={() => inputRef.current.clear()}>Clear</button>
    </>
  );
}
```

Only expose what you need. This keeps the child's implementation details private while giving the parent just the handles it needs.

---

## Reconciliation & the Virtual DOM

When state or props change, React calls the component function again to produce a new JSX tree. Instead of updating the real DOM immediately, React compares the new tree with the previous one—a process called **reconciliation** (or "diffing")—and applies only the minimal set of changes to the actual DOM.

The `key` prop is critical to this process. When keys are stable and unique, React can match elements across re-renders correctly. If you use array indices as keys, inserting or removing items can confuse the differ and produce incorrect updates or lost input state.

---

## Lifting State Up

When two sibling components need to share state, move the state to their closest common ancestor and pass it down as props along with setter callbacks.

```jsx
function TemperatureApp() {
  const [celsius, setCelsius] = useState(0);

  const fahrenheit = celsius * 9 / 5 + 32;

  return (
    <div>
      <CelsiusInput value={celsius} onChange={setCelsius} />
      <FahrenheitDisplay value={fahrenheit} />
    </div>
  );
}

function CelsiusInput({ value, onChange }) {
  return (
    <label>
      Celsius:{' '}
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function FahrenheitDisplay({ value }) {
  return <p>{value.toFixed(1)} °F</p>;
}
```

This keeps a single source of truth and keeps the data flow easy to trace.

---

##  Hook Reference

| Hook | Purpose |
|---|---|
| `useState` | Local component state |
| `useEffect` | Side effects & synchronization |
| `useRef` | DOM refs & mutable values |
| `useContext` | Consume a context value |
| `useReducer` | Complex state with actions |
| `useMemo` | Memoize expensive computations |
| `useCallback` | Memoize function references |
| `useLayoutEffect` | Sync DOM reads before paint |
| `useId` | Stable unique IDs |
| `useTransition` | Mark updates as non-urgent |
| `useDeferredValue` | Defer a received value |
| `useImperativeHandle` | Customize a forwarded ref |

