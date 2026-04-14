---
date: '2025-12-31T13:00:00+05:30'
title: 'React Router DOM — A Complete Guide'
---

React Router DOM is the standard routing library for React web applications. It keeps your UI in sync with the URL, enabling navigation between views without a full-page reload. Version 6 (the current major) introduced a cleaner API with nested routes, relative links, and a suite of powerful hooks that replace most of the prop-drilling from earlier versions.

---

## Installation

```bash
npm install react-router-dom
```

The package works in the browser. For React Native you would use `react-router-native` instead.

---

## Setting Up a Router

Wrap your entire application in a `BrowserRouter`. This provides the routing context that all other Router components and hooks depend on.

```jsx
// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

`BrowserRouter` uses the HTML5 History API (`pushState`, `replaceState`) to manage the URL. For environments without a server that can rewrite URLs (e.g., GitHub Pages), use `HashRouter` instead—it stores location in `window.location.hash`.

---

## Defining Routes with `<Routes>` and `<Route>`

`<Routes>` is the container that looks at the current URL and renders the first `<Route>` that matches. Every `<Route>` needs a `path` and an `element`.

```jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

The `path="*"` wildcard acts as a catch-all 404 route—it only matches when no other route does. Routes are ranked by specificity, so order inside `<Routes>` does not matter the way it did in v5.

---

## Navigation with `<Link>` and `<NavLink>`

Never use a plain `<a href>` for internal navigation—it triggers a full page reload. Use `<Link>` to navigate client-side.

```jsx
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  );
}
```

`<NavLink>` works like `<Link>` but adds an `active` class (and `aria-current="page"`) when its `to` matches the current URL—perfect for navigation menus.

```jsx
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <NavLink
        to="/"
        style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
      >
        Home
      </NavLink>
      <NavLink to="/about" className={({ isActive }) => isActive ? 'active-link' : ''}>
        About
      </NavLink>
    </nav>
  );
}
```

Both `style` and `className` on `<NavLink>` accept a function that receives `{ isActive, isPending }`. `isPending` is `true` while a loader is running for that route (useful with data routers).

---

## URL Parameters with `useParams`

Dynamic segments in a route path are prefixed with `:`. The `useParams` hook reads those values from the current URL.

```jsx
// Route definition
<Route path="/users/:userId" element={<UserProfile />} />
<Route path="/posts/:category/:postId" element={<Post />} />

// Component
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams();

  return <h1>User #{userId}</h1>;
}

function Post() {
  const { category, postId } = useParams();
  return <p>Category: {category} — Post: {postId}</p>;
}
```

Param values are always strings. Parse them with `Number()` or `parseInt()` if you need a number.

---

## Nested Routes & `<Outlet>`

React Router v6 makes nested layouts first-class. A parent route renders its `element` and places an `<Outlet>` where the matched child route should appear.

```jsx
// App.jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="users" element={<Users />}>
      <Route index element={<UserList />} />
      <Route path=":userId" element={<UserProfile />} />
    </Route>
  </Route>
</Routes>
```

```jsx
// Layout.jsx — persistent shell (navbar, sidebar, footer)
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />   {/* child route renders here */}
      </main>
      <Footer />
    </div>
  );
}
```

The `index` route matches the parent's path exactly (with no additional segment). Think of it as the default child.

### Passing Data Through the Outlet

You can pass data to the child route's `<Outlet>` via the `context` prop, then consume it with `useOutletContext`.

```jsx
// Parent
<Outlet context={{ user, setUser }} />

// Child
import { useOutletContext } from 'react-router-dom';
const { user } = useOutletContext();
```

---

## Programmatic Navigation with `useNavigate`

`useNavigate` returns a function you can call to navigate imperatively—after a form submission, after a login, or on a timer.

```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(e.target.elements.email.value);
    if (ok) {
      navigate('/dashboard');          // go forward
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <button type="submit">Log in</button>
    </form>
  );
}
```

### Navigation Options

```jsx
navigate('/home');                    // push (default)
navigate('/home', { replace: true }); // replace current entry
navigate(-1);                         // go back one step
navigate(2);                          // go forward two steps
navigate('/report', { state: { from: 'dashboard' } }); // pass state
```

The `replace` option is useful after login so the user can't go "back" to the login page.

---

## Reading the URL with `useLocation`

`useLocation` returns the current `location` object: `{ pathname, search, hash, state, key }`.

```jsx
import { useLocation } from 'react-router-dom';

function Page() {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    analytics.pageview(location.pathname);
  }, [location.pathname]);

  return <div>{location.pathname}</div>;
}
```

### Reading State Passed via navigate

```jsx
// Sender
navigate('/thank-you', { state: { orderId: 42 } });

// Receiver
function ThankYou() {
  const { state } = useLocation();
  return <p>Order #{state?.orderId} confirmed!</p>;
}
```

State survives refreshes (it's stored in the History API entry), but is lost if the user copies and opens the URL in a new tab.

---

## Query Parameters with `useSearchParams`

`useSearchParams` works exactly like `useState` but for the URL's query string. It returns the current `URLSearchParams` object and a setter.

```jsx
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'price';

  function handleCategoryChange(cat) {
    setSearchParams({ category: cat, sort });
  }

  function handleSortChange(s) {
    setSearchParams({ category, sort: s });
  }

  return (
    <div>
      <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
      </select>

      <select value={sort} onChange={(e) => handleSortChange(e.target.value)}>
        <option value="price">Price</option>
        <option value="rating">Rating</option>
      </select>

      <ProductGrid category={category} sort={sort} />
    </div>
  );
}
```

The URL becomes something like `/products?category=electronics&sort=rating`—fully shareable and bookmarkable.

---

## Protected Routes (Auth Guards)

A protected route is just a component that checks for authentication and either renders the children or redirects to login.

```jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function RequireAuth({ isAuthenticated }) {
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, but remember where the user was trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// In your route tree
<Routes>
  <Route path="/login" element={<Login />} />

  <Route element={<RequireAuth isAuthenticated={user != null} />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
</Routes>
```

After login, redirect back to where the user came from:

```jsx
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  async function handleLogin() {
    await login();
    navigate(from, { replace: true });
  }
  // ...
}
```

---

## The `<Navigate>` Component

`<Navigate>` performs a redirect when rendered. It's the declarative counterpart to `useNavigate()`.

```jsx
import { Navigate } from 'react-router-dom';

function OldRoute() {
  // Permanent redirect from /old-page to /new-page
  return <Navigate to="/new-page" replace />;
}

// Conditional redirect in a component
function Dashboard({ user }) {
  if (!user) return <Navigate to="/login" replace />;
  return <h1>Welcome, {user.name}</h1>;
}
```

---

## Relative Links and Paths

All `to` values in `<Link>`, `<NavLink>`, and `navigate()` are relative to the current route by default, just like `href` in HTML. Prefix with `/` for absolute paths.

```jsx
// Inside /users/:userId
<Link to="edit">Edit</Link>           // → /users/42/edit
<Link to="../">Back to Users</Link>   // → /users
<Link to="/home">Home</Link>          // → /home (absolute)
```

---

## `<Outlet>` with Layout Nesting — Real-World Example

Here's a more complete example combining nested routes, an `<Outlet>`, and protected routes for a typical app.

```jsx
// App.jsx
<BrowserRouter>
  <Routes>
    {/* Public shell */}
    <Route path="/" element={<PublicLayout />}>
      <Route index element={<Landing />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Route>

    {/* Protected shell */}
    <Route element={<RequireAuth />}>
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />}>
          <Route index element={<GeneralSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="billing" element={<BillingSettings />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

---

## useRoutes — Routes as Data

`useRoutes` accepts a JavaScript array of route objects instead of JSX. It's the hook equivalent of `<Routes>` — useful when you generate routes programmatically or load them from an API.

```jsx
import { useRoutes } from 'react-router-dom';

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      {
        path: 'users',
        element: <Users />,
        children: [
          { index: true, element: <UserList /> },
          { path: ':id', element: <UserDetail /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];

function App() {
  return useRoutes(routes);
}
```

---

## Data Routers — `createBrowserRouter`

React Router v6.4+ introduced data APIs. `createBrowserRouter` enables `loader` and `action` functions on routes — data fetching becomes part of the route definition, not the component.

```jsx
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  Form,
  redirect,
} from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'users',
        element: <UserList />,
        loader: async () => {
          const res = await fetch('/api/users');
          return res.json();          // returned value is available in the component
        },
      },
      {
        path: 'users/new',
        element: <NewUserForm />,
        action: async ({ request }) => {
          const formData = await request.formData();
          await createUser({ name: formData.get('name') });
          return redirect('/users');
        },
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

### useLoaderData

Inside a component rendered by a data route, `useLoaderData` gives you the value returned by the `loader`.

```jsx
function UserList() {
  const users = useLoaderData();   // already fetched before this renders

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>
          <Link to={`/users/${u.id}`}>{u.name}</Link>
        </li>
      ))}
    </ul>
  );
}
```

Because the data is fetched in the `loader` (before the component mounts), there's no loading spinner needed in the component itself—the data is ready when the component renders.

### `<Form>` Component

The `<Form>` component from React Router submits to the route's `action` function without a page reload. It's the progressive enhancement story for mutations.

```jsx
import { Form } from 'react-router-dom';

function NewUserForm() {
  return (
    <Form method="post">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Create User</button>
    </Form>
  );
}
```

### useActionData

After the `action` runs, `useActionData` lets the component read what the action returned (e.g. validation errors).

```jsx
// Action
action: async ({ request }) => {
  const data = Object.fromEntries(await request.formData());
  if (!data.name) return { error: 'Name is required' };
  await createUser(data);
  return redirect('/users');
},

// Component
function NewUserForm() {
  const actionData = useActionData();
  return (
    <Form method="post">
      {actionData?.error && <p className="error">{actionData.error}</p>}
      <input name="name" />
      <button type="submit">Create</button>
    </Form>
  );
}
```

### useNavigation

`useNavigation` tells you the state of an in-flight navigation — idle, loading, or submitting.

```jsx
import { useNavigation } from 'react-router-dom';

function SubmitButton() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Saving…' : 'Save'}
    </button>
  );
}
```

---

## useFetcher — Background Fetches

`useFetcher` lets you call loaders and actions without navigating. Perfect for inline edits, like items, or background refreshes.

```jsx
import { useFetcher } from 'react-router-dom';

function LikeButton({ postId, liked }) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action={`/posts/${postId}/like`}>
      <button type="submit">
        {fetcher.state === 'submitting' ? '…' : liked ? '♥ Unlike' : '♡ Like'}
      </button>
    </fetcher.Form>
  );
}
```

The URL doesn't change, no navigation happens, but the `action` at `/posts/:id/like` runs and data can be refreshed.

---

## Scroll Restoration

`<ScrollRestoration />` restores scroll position when the user navigates back, mimicking native browser behavior.

```jsx
import { ScrollRestoration } from 'react-router-dom';

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <ScrollRestoration />   {/* place once, anywhere in the tree */}
    </>
  );
}
```

Only available when using a data router (`createBrowserRouter`).

---

## Error Handling with `errorElement`

Data routes support an `errorElement` that renders when the `loader`, `action`, or the component itself throws. Use `useRouteError` to read the error.

```jsx
import { useRouteError } from 'react-router-dom';

function ErrorPage() {
  const error = useRouteError();

  return (
    <div>
      <h1>Oops!</h1>
      <p>{error.statusText || error.message}</p>
    </div>
  );
}

// In the route definition
{
  path: 'users',
  element: <UserList />,
  errorElement: <ErrorPage />,
  loader: async () => {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Response('Not Found', { status: 404 });
    return res.json();
  },
}
```

Errors bubble up to the nearest `errorElement` in the ancestor chain, so you only need one global error boundary at the root in most cases.

---

## Lazy Loading Routes

Combine React's `lazy()` with route `lazy` property (v6.4+) or standard `React.lazy` outside data routers.

```jsx
// With createBrowserRouter (v6.4+)
{
  path: '/dashboard',
  lazy: async () => {
    const { Dashboard } = await import('./pages/Dashboard');
    return { Component: Dashboard };
  },
}

// With BrowserRouter + React.lazy
import { lazy, Suspense } from 'react';
const Dashboard = lazy(() => import('./pages/Dashboard'));

<Route
  path="/dashboard"
  element={
    <Suspense fallback={<div>Loading…</div>}>
      <Dashboard />
    </Suspense>
  }
/>
```

---

## Quick Hook & Component Reference

| API | Purpose |
|---|---|
| `<BrowserRouter>` | Context provider using History API |
| `<HashRouter>` | Context provider using hash-based URLs |
| `<Routes>` | Picks the best-matching `<Route>` |
| `<Route>` | Maps a path to an element |
| `<Link>` | Client-side anchor tag |
| `<NavLink>` | Link with active state |
| `<Navigate>` | Declarative redirect |
| `<Outlet>` | Renders the matched child route |
| `<Form>` | Form that submits to route actions |
| `<ScrollRestoration>` | Restores scroll on back-navigation |
| `useNavigate` | Programmatic navigation |
| `useParams` | URL dynamic segment values |
| `useLocation` | Current location object |
| `useSearchParams` | Read/write query string |
| `useRoutes` | Routes defined as a JS array |
| `useOutletContext` | Consume data passed through `<Outlet>` |
| `useLoaderData` | Data returned by a route loader |
| `useActionData` | Data returned by a route action |
| `useNavigation` | Current navigation state |
| `useFetcher` | Call loaders/actions without navigating |
| `useRouteError` | Error thrown during loading/rendering |

