---
date: '2025-12-31T12:49:24+05:30'
title: 'React Performance Optimization Techniques'
---

This guide covers advanced performance optimization techniques for React applications: code splitting, lazy loading, virtualization, Context performance, optimistic updates, and Suspense patterns.

---

## Lazy Loading

Lazy loading delays loading resources until they're actually needed. In React, this primarily applies to image lazy loading and component code splitting.

### Image Lazy Loading

By default, all images load immediately. For pages with many images, this wastes bandwidth and slows initial load.

**Native browser lazy loading:**

```jsx
function Gallery({ images }) {
  return (
    <div className="gallery">
      {images.map((img) => (
        <img
          key={img.id}
          src={img.src}
          alt={img.alt}
          loading="lazy" // Browser loads on-demand
        />
      ))}
    </div>
  );
}
```

The `loading="lazy"` attribute tells the browser to load images only when they come into view. Modern browsers (Chrome, Firefox, Edge) support this natively.

**Intersection Observer API (for older browsers or custom logic):**

```javascript
import { useEffect, useRef } from 'react';

function LazyImage({ src, alt, placeholder }) {
  const imgRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(placeholder);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' } // Load 50px before coming into view
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} src={imageSrc} alt={alt} />;
}

// Usage
<LazyImage src="/large-image.jpg" placeholder="/thumbnail.jpg" alt="Product" />
```

### Lazy Loading Libraries

Popular libraries for lazy image loading:

- **next/image** (Next.js) — Automatic optimization and lazy loading
- **react-lazyload** — Simple drop-in lazy loader
- **lozad.js** — Lightweight Intersection Observer wrapper

```bash
npm install react-lazyload
```

```javascript
import LazyLoad from 'react-lazyload';

function PhotoGallery({ photos }) {
  return (
    <div>
      {photos.map((photo) => (
        <LazyLoad key={photo.id} height={200} offset={100}>
          <img src={photo.url} alt={photo.title} />
        </LazyLoad>
      ))}
    </div>
  );
}
```

---

## Code Splitting

Code splitting breaks your bundle into smaller chunks that are loaded on-demand. This dramatically reduces initial load time.

### Dynamic Imports

JavaScript's `import()` function loads modules dynamically at runtime:

```javascript
// Regular import (loads immediately)
import Dashboard from './pages/Dashboard';

// Dynamic import (loads on-demand)
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### React.lazy and Suspense

`React.lazy` wraps a dynamic import and works with `Suspense` to show a fallback while loading:

```jsx
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  const [page, setPage] = useState('home');

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home />;
      case 'dashboard':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <>
      <nav>
        <button onClick={() => setPage('home')}>Home</button>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('settings')}>Settings</button>
      </nav>

      <Suspense fallback={<div>Loading page...</div>}>
        {renderPage()}
      </Suspense>
    </>
  );
}
```

### Route-Based Code Splitting

Split code by route for maximum benefit:

```jsx
// Use with react-router-dom
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Component-Based Code Splitting

Split large components:

```jsx
const HeavyEditor = lazy(() => import('./components/HeavyEditor'));

function App() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <>
      <button onClick={() => setShowEditor(true)}>Open Editor</button>
      {showEditor && (
        <Suspense fallback={<div>Loading editor...</div>}>
          <HeavyEditor />
        </Suspense>
      )}
    </>
  );
}
```

### Webpack-specific splitting

Configure code splitting in your bundler:

**Vite (vite.config.js):**

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          vendor: ['react', 'react-dom'],
          // Split third-party UI library
          ui: ['@mui/material'],
          // Split your own modules
          utils: ['./src/utils'],
        },
      },
    },
  },
};
```

**Webpack (webpack.config.js):**

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
        common: {
          minChunks: 2,
          priority: -10,
        },
      },
    },
  },
};
```

---

## Tree Shaking

Tree shaking removes unused code from your bundle. Modern bundlers like Webpack and Vite support it, but you must write code that enables it.

### ES6 Modules (Required)

Tree shaking only works with **ES6 module syntax** (`import`/`export`). CommonJS (`require`) prevents tree shaking.

```javascript
// GOOD: ES6 modules (tree-shakeable)
export function usedFunction() {}
export function unusedFunction() {}

// BAD: CommonJS (not tree-shakeable)
module.exports = { usedFunction, unusedFunction };
```

### Side Effects

If a module has side effects (code that runs on import), bundlers won't remove it even if unused:

```javascript
// This file has a side effect (modifies global state)
window.myGlobal = true;

export function myFunction() {
  return window.myGlobal;
}
```

Tell the bundler about side effects in `package.json`:

```json
{
  "name": "my-lib",
  "sideEffects": false
}
```

If some files have side effects, whitelist them:

```json
{
  "sideEffects": [
    "./src/polyfills.js",
    "./src/styles.css"
  ]
}
```

### Avoid Default Exports (for tree-shaking)

Named exports are better for tree shaking:

```javascript
// GOOD: Named exports
export function helper1() {}
export function helper2() {}

// BAD: Default export (bundler may include whole module)
const utils = { helper1() {}, helper2() {} };
export default utils;
```

Import with named exports:

```javascript
// GOOD: Tree-shaking will remove unused
import { helper1 } from './utils';

// MAY include unused code
import utils from './utils';
```

### Library Examples

**Lodash (NOT tree-shakeable):**

```javascript
import _ from 'lodash'; // Entire library included!

const result = _.debounce(fn, 300);
```

**lodash-es (Tree-shakeable):**

```bash
npm install lodash-es
```

```javascript
import { debounce } from 'lodash-es'; // Only debounce included

const result = debounce(fn, 300);
```

**Conclusion:** Use `lodash-es`, `date-fns`, or modern alternatives over their non-ES6 versions.

---

## Virtualization

Virtualization renders only visible items in a long list, removing off-screen items from the DOM. This dramatically improves performance for lists with hundreds or thousands of items.

### Manual Virtualization

Implement basic virtualization by calculating visible items:

```javascript
import { useState, useEffect, useRef } from 'react';

function VirtualizedList({ items, itemHeight = 50, containerHeight = 400 }) {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // Calculate visible range
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = startIndex + visibleItemCount;
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Calculate offset for virtual items before visible range
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{
        height: containerHeight,
        overflow: 'auto',
        border: '1px solid #ccc',
      }}
      onScroll={handleScroll}
    >
      {/* Spacer for items above viewport */}
      <div style={{ height: offsetY }} />

      {/* Visible items */}
      {visibleItems.map((item, i) => (
        <div
          key={startIndex + i}
          style={{
            height: itemHeight,
            padding: '10px',
            borderBottom: '1px solid #eee',
          }}
        >
          {item.name} (index: {startIndex + i})
        </div>
      ))}

      {/* Spacer for items below viewport */}
      <div style={{ height: Math.max(0, (items.length - endIndex) * itemHeight) }} />
    </div>
  );
}

// Usage
const largeList = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
<VirtualizedList items={largeList} itemHeight={50} containerHeight={400} />
```

### react-window (Recommended)

**react-window** is a performant library for virtualized lists:

```bash
npm install react-window
```

```javascript
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style} className="list-item">
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**Variable height items:**

```javascript
import { VariableSizeList } from 'react-window';

const itemSizes = new Array(10000).fill(0).map(() => 25 + Math.random() * 50);

function VirtualList() {
  const getItemSize = (index) => itemSizes[index];

  const Row = ({ index, style }) => (
    <div style={style}>Item {index}</div>
  );

  return (
    <VariableSizeList
      height={600}
      itemCount={10000}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}
```

### react-virtual (Headless Alternative)

**react-virtual** is a headless hook for more flexibility:

```bash
npm install @tanstack/react-virtual
```

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10, // Render extra items for smoother scrolling
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      ref={parentRef}
      style={{
        height: '600px',
        overflow: 'auto',
      }}
    >
      <div style={{ height: `${totalSize}px` }}>
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: `${virtualItem.start}px`,
              height: `${virtualItem.size}px`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Windowing

Windowing is similar to virtualization but applies to 2D grids (tables, image galleries). It renders only items within the visible window.

### react-window Grid

```javascript
import { FixedSizeGrid } from 'react-window';

function ImageGrid({ images }) {
  const columnCount = 4;
  const columnWidth = 200;
  const rowHeight = 200;

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    const image = images[index];

    if (!image) return null;

    return (
      <div style={style} className="grid-cell">
        <img src={image.url} alt={image.title} />
      </div>
    );
  };

  return (
    <FixedSizeGrid
      columnCount={columnCount}
      columnWidth={columnWidth}
      height={600}
      rowCount={Math.ceil(images.length / columnCount)}
      rowHeight={rowHeight}
      width="100%"
    >
      {Cell}
    </FixedSizeGrid>
  );
}
```

### react-virtual for Tables

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualTable({ data, columns }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {virtualItems.map((virtualItem) => {
            const row = data[virtualItem.index];
            return (
              <tr
                key={virtualItem.key}
                style={{
                  height: `${virtualItem.size}px`,
                }}
              >
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Context Performance Issues

React Context can cause unnecessary re-renders if not used carefully. Every value change triggers a re-render of all consumers.

### The Problem

```javascript
const MyContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // This object is recreated every render!
  const value = { user, setUser, theme, setTheme };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

function Consumer() {
  const { user, setUser, theme, setTheme } = useContext(MyContext);

  // Re-renders whenever user OR theme changes!
  return <div>{user?.name} - {theme}</div>;
}
```

When `user` changes, even components that only care about `theme` will re-render.

### Solution 1: Split Contexts

Separate unrelated concerns into different contexts:

```javascript
const UserContext = createContext();
const ThemeContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

// Now components can subscribe to only what they need
function UserDisplay() {
  const { user } = useContext(UserContext);
  return <div>{user?.name}</div>; // Only re-renders on user change
}

function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
    {theme}
  </button>; // Only re-renders on theme change
}
```

### Solution 2: Memoize Context Value

Prevent object recreation with `useMemo`:

```javascript
import { createContext, useState, useMemo } from 'react';

const MyContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // Memoize the value object
  const value = useMemo(
    () => ({ user, setUser, theme, setTheme }),
    [user, theme] // Only recreate if user or theme changes
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}
```

### Solution 3: Split Value and Setters

Keep values and setters in separate contexts:

```javascript
const UserValueContext = createContext();
const UserSettersContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <UserValueContext.Provider value={{ user, theme }}>
      <UserSettersContext.Provider value={{ setUser, setTheme }}>
        {children}
      </UserSettersContext.Provider>
    </UserValueContext.Provider>
  );
}

// Components using setters don't re-render when values change
function UserForm() {
  const { setUser } = useContext(UserSettersContext);
  return <form onSubmit={(e) => setUser(e.target.value)}>...</form>;
}

// Components using values don't re-render when setters change
function UserDisplay() {
  const { user } = useContext(UserValueContext);
  return <div>{user?.name}</div>;
}
```

### Solution 4: Use useCallback for Setters

Stabilize setter functions:

```javascript
const MyContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  const handleSetUser = useCallback((newUser) => {
    setUser(newUser);
  }, []);

  const handleSetTheme = useCallback((newTheme) => {
    setTheme(newTheme);
  }, []);

  const value = useMemo(
    () => ({ user, setUser: handleSetUser, theme, setTheme: handleSetTheme }),
    [user, theme, handleSetUser, handleSetTheme]
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}
```

---

## Context Splitting

**Context splitting** means creating multiple contexts instead of one monolithic context. This is a best practice for performance.

### Monolithic Context (Bad)

```javascript
const AppContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});

  // One giant value object
  const value = { user, posts, notifications, settings, setUser, setPosts, setNotifications, setSettings };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
```

Any change to any state triggers all consumers to re-render.

### Split Contexts (Good)

```javascript
const UserContext = createContext();
const PostContext = createContext();
const NotificationContext = createContext();
const SettingsContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <PostContext.Provider value={{ posts, setPosts }}>
        <NotificationContext.Provider value={{ notifications, setNotifications }}>
          <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
          </SettingsContext.Provider>
        </NotificationContext.Provider>
      </PostContext.Provider>
    </UserContext.Provider>
  );
}

// Custom hooks for easy access
export function useUser() {
  return useContext(UserContext);
}

export function usePosts() {
  return useContext(PostContext);
}

export function useNotifications() {
  return useContext(NotificationContext);
}

export function useSettings() {
  return useContext(SettingsContext);
}

// Usage: Components only re-render when their specific context changes
function UserProfile() {
  const { user } = useUser(); // Only re-renders on user change
  return <h1>{user?.name}</h1>;
}

function PostList() {
  const { posts } = usePosts(); // Only re-renders on posts change
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

### Context Organization Pattern

```javascript
// contexts/index.js
export { UserContext, useUser, UserProvider } from './UserContext';
export { PostContext, usePosts, PostProvider } from './PostContext';
export { ThemeContext, useTheme, ThemeProvider } from './ThemeContext';

// contexts/UserContext.js
const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// App.js - Compose providers
function App() {
  return (
    <UserProvider>
      <PostProvider>
        <ThemeProvider>
          <MainApp />
        </ThemeProvider>
      </PostProvider>
    </UserProvider>
  );
}
```

---

## Optimistic Updates

Optimistic updates immediately show changes to the user while the network request is in flight. If the request fails, you revert the change.

### Basic Pattern

```javascript
import { useState } from 'react';

function TodoItem({ todo, onToggle }) {
  const [isMutating, setIsMutating] = useState(false);
  const [optimisticDone, setOptimisticDone] = useState(todo.done);

  const handleToggle = async () => {
    // Optimistically update UI
    setOptimisticDone(!optimisticDone);
    setIsMutating(true);

    try {
      // Send to server
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: !todo.done }),
      });

      if (!res.ok) {
        // Revert on error
        setOptimisticDone(todo.done);
        alert('Failed to update');
      } else {
        // Confirm with server response
        const updated = await res.json();
        setOptimisticDone(updated.done);
        onToggle(updated);
      }
    } catch (error) {
      // Revert on error
      setOptimisticDone(todo.done);
      console.error('Error:', error);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <label>
      <input
        type="checkbox"
        checked={optimisticDone}
        onChange={handleToggle}
        disabled={isMutating}
      />
      <span style={{ textDecoration: optimisticDone ? 'line-through' : 'none' }}>
        {todo.title}
      </span>
    </label>
  );
}
```

### With useTransition (Concurrent Features)

```javascript
import { useTransition } from 'react';

function TodoList({ todos, onUpdate }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (todo) => {
    // Optimistic update in non-blocking transition
    const optimisticTodo = { ...todo, done: !todo.done };
    
    // Immediately show optimistic change
    onUpdate(optimisticTodo);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/todos/${todo.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ done: !todo.done }),
        });

        if (res.ok) {
          const updated = await res.json();
          onUpdate(updated); // Confirm with server data
        } else {
          // Revert on error
          onUpdate(todo);
        }
      } catch (error) {
        // Revert on error
        onUpdate(todo);
      }
    });
  };

  return (
    <>
      {isPending && <p>Updating...</p>}
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
      ))}
    </>
  );
}
```

### React Query / TanStack Query (Recommended)

React Query handles optimistic updates elegantly:

```bash
npm install @tanstack/react-query
```

```javascript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function TodoList() {
  const queryClient = useQueryClient();
  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(r => r.json()),
  });

  const toggleMutation = useMutation({
    mutationFn: (todo) =>
      fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: !todo.done }),
      }).then(r => r.json()),
    
    onMutate: async (todo) => {
      // Cancel pending queries
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Get previous data
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically update cache
      queryClient.setQueryData(['todos'], (old) =>
        old.map(t => t.id === todo.id ? { ...t, done: !t.done } : t)
      );

      return { previousTodos };
    },

    onError: (err, todo, context) => {
      // Revert on error
      queryClient.setQueryData(['todos'], context.previousTodos);
    },

    onSuccess: () => {
      // Revalidate after success
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <>
      {todos?.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => toggleMutation.mutate(todo)}
          isPending={toggleMutation.isPending}
        />
      ))}
    </>
  );
}
```

---

## Suspense

Suspense lets you "suspend" rendering while data is loading, showing a fallback UI. It enables better UX for async operations.

### Basic Suspense

```javascript
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile userId={1} />
    </Suspense>
  );
}

// This component throws a promise while loading
function UserProfile({ userId }) {
  const user = readUser(userId); // Suspends if promise pending
  return <h1>{user.name}</h1>;
}
```

### Suspense with React.lazy

```javascript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading component...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Suspense with Data Libraries

**SWR (Stale-While-Revalidate):**

```bash
npm install swr
```

```javascript
import useSWR from 'swr';

function UserProfile({ userId }) {
  const { data, error } = useSWR(`/api/users/${userId}`, fetch, {
    suspense: true, // Enable Suspense mode
  });

  if (error) return <div>Error loading user</div>;
  return <h1>{data.name}</h1>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <UserProfile userId={1} />
    </Suspense>
  );
}
```

**TanStack Query with Suspense:**

```javascript
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
    suspense: true, // Enable Suspense
  });

  return <h1>{user.name}</h1>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile userId={1} />
    </Suspense>
  );
}
```

### Multiple Suspense Boundaries

Show different loading states for different sections:

```javascript
function App() {
  return (
    <div>
      {/* Header loads immediately */}
      <Header />

      {/* Main content loads separately */}
      <Suspense fallback={<div>Loading content...</div>}>
        <MainContent />
      </Suspense>

      {/* Sidebar loads separately */}
      <Suspense fallback={<div>Loading sidebar...</div>}>
        <Sidebar />
      </Suspense>
    </div>
  );
}
```

### Streaming with Suspense (Server Component Pattern)

In Next.js or React Server Components:

```javascript
// app/page.js (Server Component)
async function getUserData() {
  return fetch('https://api.example.com/user').then(r => r.json());
}

function Skeleton() {
  return <div className="skeleton">Loading...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserData />
    </Suspense>
  );
}

async function UserData() {
  const user = await getUserData();
  return <div>{user.name}</div>;
}
```

### Suspense with Error Boundaries

Combine for robust error and loading handling:

```javascript
import { Suspense } from 'react';

function UserProfile({ userId }) {
  return (
    <ErrorBoundary fallback={<div>Error loading user</div>}>
      <Suspense fallback={<div>Loading user...</div>}>
        <UserContent userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}

function UserContent({ userId }) {
  const user = fetchUser(userId); // Throws promise or error
  return <h1>{user.name}</h1>;
}

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
```

### Advanced: SuspenseList (Experimental)

Coordinate multiple Suspense boundaries (still experimental):

```javascript
import { SuspenseList, Suspense } from 'react';

function App() {
  return (
    // Render revealOrder controls how items appear
    <SuspenseList revealOrder="forwards" tail="collapsed">
      <Suspense fallback={<div>Loading item 1...</div>}>
        <Item id={1} />
      </Suspense>

      <Suspense fallback={<div>Loading item 2...</div>}>
        <Item id={2} />
      </Suspense>

      <Suspense fallback={<div>Loading item 3...</div>}>
        <Item id={3} />
      </Suspense>
    </SuspenseList>
  );
}
```

**revealOrder options:**

- `"together"` — Wait for all to load
- `"forwards"` — Load in order (1, then 2, then 3)
- `"backwards"` — Load reverse order (3, then 2, then 1)

---

## Performance Optimization Checklist

| Technique | When to Use | Impact |
|-----------|------------|--------|
| **Lazy Loading** | Images, heavy components | High |
| **Code Splitting** | Route-based, large features | High |
| **Tree Shaking** | Always (configure bundler) | Medium |
| **Virtualization** | Lists 100+ items | Very High |
| **Context Splitting** | Many context consumers | Medium |
| **Memoization** | Heavy computations | Medium |
| **Optimistic Updates** | User interactions, mutations | High (UX) |
| **Suspense** | Data loading, lazy components | Medium |

Start with the biggest wins: code splitting, virtualization, and Context splitting. Measure with Chrome DevTools Lighthouse and profiler before optimizing further.

