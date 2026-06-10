---
date: '2025-12-31T12:49:24+05:30'
title: 'React Security, Testing & Error Handling'
---

This guide covers critical topics for building secure, robust React applications: Redux middleware patterns, security vulnerabilities, error handling strategies, and testing frameworks.

---

## Redux Middleware

Middleware in Redux sits between dispatching an action and it reaching the reducer. It allows you to intercept, log, delay, or transform actions—useful for async operations, logging, and side effects.

### Middleware Structure

A middleware is a function that returns a function that returns a function:

```javascript
const middleware = (store) => (next) => (action) => {
  // Before action reaches reducer
  console.log('Dispatching:', action);
  const result = next(action); // Pass action to next middleware or reducer
  // After reducer processes the action
  return result;
};
```

### Redux Thunk

**Redux Thunk** allows you to dispatch functions (thunks) instead of plain objects. It's the simplest way to handle async operations.

**Installation:**
```bash
npm install redux-thunk
```

**Setup:**

```javascript
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const store = createStore(rootReducer, applyMiddleware(thunk));
```

**Using thunks:**

```javascript
// Action creator that returns a function (thunk)
function fetchUser(userId) {
  return async (dispatch) => {
    dispatch({ type: 'FETCH_USER_REQUEST' });
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      dispatch({ type: 'FETCH_USER_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_USER_ERROR', payload: error.message });
    }
  };
}

// Dispatch the thunk
store.dispatch(fetchUser(123));
```

### Custom Middleware

You can create middleware for logging, analytics, error tracking, etc.

```javascript
// Logger middleware
const logger = (store) => (next) => (action) => {
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

// Error handler middleware
const errorHandler = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    console.error('Action error:', action, err);
    // Send to error tracking service (e.g., Sentry)
    Sentry.captureException(err);
    throw err;
  }
};

// Apply multiple middlewares
const store = createStore(
  rootReducer,
  applyMiddleware(thunk, logger, errorHandler)
);
```

### Redux Saga (Alternative)

For more complex async flows, **Redux Saga** uses generator functions to manage side effects.

```bash
npm install redux-saga
```

```javascript
import { call, put, takeEvery } from 'redux-saga/effects';

function* fetchUserSaga(action) {
  try {
    const response = yield call(fetch, `/api/users/${action.payload}`);
    const data = yield call([response, 'json']);
    yield put({ type: 'FETCH_USER_SUCCESS', payload: data });
  } catch (error) {
    yield put({ type: 'FETCH_USER_ERROR', payload: error.message });
  }
}

function* rootSaga() {
  yield takeEvery('FETCH_USER_REQUEST', fetchUserSaga);
}
```

Sagas are powerful but have a steeper learning curve. For most applications, thunks are sufficient.

---

## XSS (Cross-Site Scripting) Attacks

XSS is a security vulnerability where an attacker injects malicious scripts into a webpage. There are three main types: **Stored XSS**, **Reflected XSS**, and **DOM-based XSS**.

### Understanding XSS

If a web application takes user input and renders it directly in the DOM without sanitization, an attacker can inject JavaScript code that runs in other users' browsers.

**Vulnerable code:**

```javascript
// DANGEROUS: This allows XSS
function Comment({ text }) {
  return <div>{text}</div>; // Safe if text is a string
}

// But if you do this:
function UnsafeComment({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// And then render user input:
<UnsafeComment html={userInput} /> // Vulnerable!
```

If `userInput` is `<img src=x onerror="alert('hacked')" />`, the script runs immediately.

### React's Built-in Protection

By default, React escapes all text content, preventing XSS:

```javascript
function Safe() {
  const userInput = '<img src=x onerror="alert(\'hacked\')" />';
  return <div>{userInput}</div>; // Renders as escaped text, not HTML
}
```

The string is displayed literally, not executed. This is React's default behavior—**always prefer it**.

### When XSS Can Happen

```javascript
// DANGEROUS: Using innerHTML
function Dangerous1() {
  const div = document.getElementById('content');
  div.innerHTML = userInput; // Vulnerable!
}

// DANGEROUS: Using dangerouslySetInnerHTML
function Dangerous2({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// DANGEROUS: Setting event handlers dynamically
function Dangerous3() {
  const btn = document.getElementById('btn');
  btn.onclick = new Function(userInput); // Never do this!
}

// DANGEROUS: eval()
function Dangerous4({ code }) {
  eval(code); // Never!
}
```

### Preventing XSS

**1. Never use dangerouslySetInnerHTML with user input:**

```javascript
// Bad
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// Good: Use a sanitization library if you must
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />
```

**2. Sanitize HTML with DOMPurify:**

```bash
npm install dompurify
```

```javascript
import DOMPurify from 'dompurify';

function SafeHTML({ dirtyHTML }) {
  const cleanHTML = DOMPurify.sanitize(dirtyHTML, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });

  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
}
```

**3. Escape user input when building URLs:**

```javascript
// Bad
const link = `<a href="${userUrl}">Click</a>`;

// Good
function SafeLink({ userUrl }) {
  return <a href={userUrl}>Click</a>; // React escapes this
}
```

**4. Content Security Policy (see next section)** helps mitigate XSS impact.

---

## dangerouslySetInnerHTML

`dangerouslySetInnerHTML` is React's way of setting HTML directly on a DOM element. The name is intentionally alarming—it's dangerous.

### Why It Exists

Sometimes you need to render HTML from trusted sources (like markdown converted to HTML, or sanitized WYSIWYG editor output).

```javascript
function MarkdownPreview({ html }) {
  // Assume html comes from a trusted markdown parser
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### Safe Usage Pattern

Only use `dangerouslySetInnerHTML` with HTML you control or have thoroughly sanitized:

```javascript
import { marked } from 'marked'; // Trust this library
import DOMPurify from 'dompurify';

function BlogPost({ markdownContent }) {
  // Step 1: Parse markdown
  const html = marked(markdownContent);
  
  // Step 2: Sanitize the output
  const cleanHTML = DOMPurify.sanitize(html);
  
  // Step 3: Render safely
  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
}
```

### Never Use With User Input

```javascript
// DANGEROUS
const userBio = getUserInput(); // From a form
<div dangerouslySetInnerHTML={{ __html: userBio }} /> // XSS!

// Safe
<div>{userBio}</div> // React escapes it
```

### Alternatives

Most of the time, you don't need `dangerouslySetInnerHTML`:

```javascript
// Display formatted text without HTML
function SafeFormatting({ text }) {
  return <p>{text.replace(/\n/g, <br />)}</p>; // Won't work like this
}

// Better: Use a library that parses to React elements
import ReactMarkdown from 'react-markdown';

function Post({ markdown }) {
  return <ReactMarkdown>{markdown}</ReactMarkdown>;
}
```

---

## CSRF (Cross-Site Request Forgery) Basics

CSRF is an attack where a malicious website tricks your browser into making unwanted requests to another site where you're logged in.

### How CSRF Works

1. You log into your bank at `bank.com`
2. You visit a malicious site `evil.com` in another tab (still logged in to bank)
3. The malicious site has: `<img src="bank.com/transfer?amount=1000&to=attacker" />`
4. Your browser automatically includes your bank cookies, so the request succeeds

### Preventing CSRF

**1. CSRF tokens (Server-side):**

The server generates a unique token for each session. Any state-changing request must include this token.

```javascript
// Server: Generate token on login
app.post('/login', (req, res) => {
  // Authenticate user
  const token = generateToken(); // Random, unique per session
  res.cookie('csrf-token', token, { httpOnly: false });
  res.cookie('session-id', sessionId, { httpOnly: true });
  res.json({ token });
});

// Server: Verify token on state-changing requests
app.post('/transfer', (req, res) => {
  const clientToken = req.headers['x-csrf-token'];
  const serverToken = req.cookies['csrf-token'];

  if (clientToken !== serverToken) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }
  // Process transfer
});
```

**Client-side with React:**

```javascript
// Fetch CSRF token
useEffect(() => {
  fetch('/csrf-token')
    .then(res => res.json())
    .then(data => setCsrfToken(data.token));
}, []);

// Include token in requests
function handleTransfer(amount) {
  fetch('/api/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken, // Include token
    },
    body: JSON.stringify({ amount }),
  });
}
```

**2. Same-Site Cookies (Modern approach):**

```javascript
// Server: Set SameSite flag on cookies
res.cookie('session-id', sessionId, {
  httpOnly: true,
  sameSite: 'Strict', // 'Strict', 'Lax', or 'None'
});
```

- `Strict` — Never sent in cross-site requests
- `Lax` — Only sent on top-level navigation (GET requests)
- `None` — Always sent (must use `secure: true` for HTTPS)

**3. Check Origin/Referer (Server-side):**

```javascript
app.post('/transfer', (req, res) => {
  const origin = req.headers['origin'];
  const allowedOrigins = ['https://mybank.com'];

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Process transfer
});
```

---

## Content Security Policy (CSP)

CSP is an HTTP header that restricts what resources can be loaded and executed on your page. It's a powerful defense against XSS and injection attacks.

### Setting CSP Headers

Add the header via server configuration or meta tag:

```html
<!-- As meta tag -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'" />
```

```javascript
// As Express middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'"
  );
  next();
});
```

### Common CSP Directives

| Directive | Purpose | Example |
|-----------|---------|---------|
| `default-src` | Fallback for all resources | `default-src 'self'` |
| `script-src` | JavaScript sources | `script-src 'self' https://cdn.js` |
| `style-src` | CSS sources | `style-src 'self' 'unsafe-inline'` |
| `img-src` | Image sources | `img-src 'self' https:` |
| `font-src` | Font sources | `font-src 'self' https://fonts.googleapis.com` |
| `connect-src` | XHR, WebSocket, fetch | `connect-src 'self' https://api.example.com` |
| `frame-src` | Iframe sources | `frame-src 'none'` |
| `object-src` | Plugin sources | `object-src 'none'` |

### Safe CSP Policy

```javascript
// Very restrictive (starts here and relax as needed)
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://api.example.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

res.setHeader('Content-Security-Policy', csp);
```

### CSP and Inline Scripts

Inline `<script>` and `<style>` tags are blocked by default with CSP. You must use nonces or hashes:

**Using nonces (recommended):**

```javascript
// Server: Generate nonce
const nonce = crypto.randomBytes(16).toString('hex');
res.setHeader('Content-Security-Policy', `script-src 'nonce-${nonce}'`);
res.locals.nonce = nonce;
```

```html
<!-- Template -->
<script nonce="<%= nonce %>">
  console.log('This runs because of the matching nonce');
</script>
```

**Using hashes:**

```javascript
const crypto = require('crypto');
const scriptContent = 'console.log("hello")';
const hash = crypto.createHash('sha256').update(scriptContent).digest('base64');

res.setHeader('Content-Security-Policy', `script-src 'sha256-${hash}'`);
```

```html
<script>console.log("hello")</script>
```

### React & Inline Event Handlers

CSP blocks inline event handlers like `onclick=""`. Always use React's event binding instead:

```javascript
// BLOCKED by CSP (inline handler)
<button onClick="handleClick()">Click</button>

// ALLOWED (React binding)
<button onClick={handleClick}>Click</button>
```

---

## Error Boundaries

Error boundaries are class components that catch errors in their child tree and display a fallback UI instead of crashing the app.

### Basic Error Boundary

```javascript
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    console.error('Boundary caught:', error, errorInfo);
    // Send to Sentry, LogRocket, etc.
    Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()}>Reload page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Multiple Error Boundaries

Wrap different sections independently:

```javascript
function App() {
  return (
    <div>
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>

      <ErrorBoundary>
        <MainContent />
      </ErrorBoundary>

      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>
    </div>
  );
}
```

Now an error in Sidebar won't crash Header or MainContent.

### What Error Boundaries DON'T Catch

Error boundaries cannot catch:

- Event handler errors (use try/catch)
- Async code (setTimeout, promises)
- Server-side rendering errors
- Errors in the boundary itself

```javascript
// Error boundaries WON'T catch these:
function Component() {
  const handleClick = () => {
    throw new Error('This is not caught!');
  };

  useEffect(() => {
    setTimeout(() => {
      throw new Error('Async error not caught!');
    }, 1000);
  }, []);

  Promise.reject('Unhandled rejection not caught!');

  return <button onClick={handleClick}>Click</button>;
}
```

---

## Try/Catch Limitations

`try/catch` only works for **synchronous** errors. Async errors require different handling.

### Synchronous Errors (Caught)

```javascript
function SafeOperation() {
  try {
    const result = JSON.parse(userInput);
    console.log('Parsed:', result);
  } catch (error) {
    console.error('Parse error:', error.message);
  }
}
```

### Async Errors (NOT Caught)

```javascript
function AsyncError() {
  try {
    // This doesn't catch the error!
    fetch('/api/data').then(res => {
      throw new Error('Something went wrong');
    });
  } catch (error) {
    // Never runs
    console.error(error);
  }
}
```

### Proper Async Error Handling

```javascript
async function SafeAsync() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    // Return fallback or re-throw
    return null;
  }
}

// Or with .catch()
function FetchWithCatch() {
  return fetch('/api/data')
    .then(res => res.json())
    .catch(error => {
      console.error('Fetch error:', error);
      return null;
    });
}
```

### Event Handlers with Try/Catch

```javascript
function Form() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

---

## Logging Errors

Proper error logging helps diagnose production issues without impacting performance.

### Console Logging (Development Only)

```javascript
function logError(error, context) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error in', context, error);
  }
}
```

### Centralized Error Handler

```javascript
const errorHandler = {
  log(error, errorInfo) {
    // Log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error, errorInfo);
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToSentry(error, errorInfo);
    }
  },

  sendToSentry(error, errorInfo) {
    Sentry.captureException(error, {
      contexts: { errorInfo },
      tags: { source: 'react-error-boundary' },
    });
  },
};

// Use in Error Boundary
class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    errorHandler.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error occurred. Our team has been notified.</div>;
    }
    return this.props.children;
  }
}
```

### Sentry Integration

```bash
npm install @sentry/react
```

```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://your-key@sentry.io/project-id',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // Sample 10% of transactions
});

// Manual error capture
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { section: 'checkout' },
    level: 'error',
  });
}

// Error boundary integration
const ErrorBoundary = Sentry.withErrorBoundary(MyComponent, {
  fallback: <ErrorFallback />,
});
```

### LogRocket (Session Replay + Logging)

```bash
npm install logrocket
```

```javascript
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');

// Capture errors
LogRocket.captureException(error);

// Log custom messages
LogRocket.log('User performed important action');
```

---

## Fallback UI

A fallback UI is what users see when an error occurs or content is loading. Good fallback UIs improve perceived performance and user experience.

### Error Fallback

```javascript
function ErrorFallback({ error, resetError }) {
  return (
    <div className="error-container">
      <h2>⚠️ Something went wrong</h2>
      <details style={{ whiteSpace: 'pre-wrap' }}>
        {error.message}
      </details>
      <button onClick={resetError}>Try again</button>
    </div>
  );
}

function App() {
  const [error, setError] = useState(null);

  if (error) {
    return <ErrorFallback error={error} resetError={() => setError(null)} />;
  }

  return <MainComponent />;
}
```

### Loading Fallback

```javascript
import { Suspense } from 'react';

function LoadingFallback() {
  return <div className="spinner">Loading...</div>;
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Dashboard />
    </Suspense>
  );
}

// With skeleton loading
function SkeletonLoader() {
  return (
    <div className="card">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <UserProfile />
    </Suspense>
  );
}
```

CSS for skeleton:

```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeleton-text {
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
  border-radius: 4px;
}
```

### Retry Logic in Fallback

```javascript
function DataFallback({ error, resetError, retry }) {
  return (
    <div className="error-fallback">
      <h3>Failed to load data</h3>
      <p>{error.message}</p>
      <button onClick={retry}>Retry</button>
      <button onClick={resetError}>Go back</button>
    </div>
  );
}

function Component() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <DataFallback
        error={error}
        retry={fetchData}
        resetError={() => setError(null)}
      />
    );
  }

  if (!data) return <div>Loading...</div>;
  return <div>{/* render data */}</div>;
}
```

---

## Testing in React

### Jest

Jest is Facebook's testing framework, often used with React. It's zero-config and comes with Create React App.

**Installation:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Basic test:**

```javascript
// sum.js
export function sum(a, b) {
  return a + b;
}

// sum.test.js
import { sum } from './sum';

describe('sum', () => {
  test('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });

  test('handles negative numbers', () => {
    expect(sum(-1, 1)).toBe(0);
  });
});
```

**React component testing:**

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './Counter';

describe('Counter', () => {
  test('increments count on button click', async () => {
    render(<Counter initialCount={0} />);
    const button = screen.getByRole('button', { name: /increment/i });
    
    await userEvent.click(button);
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  test('renders initial count', () => {
    render(<Counter initialCount={5} />);
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });
});
```

**Mocking:**

```javascript
// Mocking API calls
jest.mock('./api');
import * as api from './api';

test('fetches and displays user', async () => {
  api.fetchUser.mockResolvedValue({ id: 1, name: 'John' });
  
  render(<UserProfile userId={1} />);
  
  expect(await screen.findByText('John')).toBeInTheDocument();
});

// Mocking modules
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));
```

**Snapshot testing:**

```javascript
test('renders correctly', () => {
  const { container } = render(<MyComponent />);
  expect(container.firstChild).toMatchSnapshot();
});
```

---

### Vitest

**Vitest** is a blazingly fast unit test framework powered by Vite. It's Jest-compatible and much faster.

**Installation:**
```bash
npm install --save-dev vitest @testing-library/react
```

**Configuration (vitest.config.js):**

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
});
```

**Test file (same syntax as Jest):**

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disables button when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**Advantages over Jest:**

- Much faster (uses ES modules natively)
- Vite integration (no separate build step)
- Hot Module Reloading for tests
- Same API as Jest (easy migration)
- Better TypeScript support

---

### Playwright

**Playwright** is an end-to-end testing framework for testing real browser behavior. It automates Chromium, Firefox, and WebKit.

**Installation:**
```bash
npm install --save-dev @playwright/test
```

**Configuration (playwright.config.ts):**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

**Basic test (e2e/login.spec.ts):**

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Fill login form
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verify logged in
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Welcome, User')).toBeVisible();
});
```

**Advanced selectors and interactions:**

```typescript
test('add item to cart', async ({ page }) => {
  await page.goto('/products');
  
  // Click add to cart button for specific product
  await page.click('button:has-text("Add to Cart")');
  
  // Wait for toast notification
  await expect(page.locator('[role="alert"]')).toContainText('Added to cart');
  
  // Verify cart count updated
  const cartBadge = page.locator('[data-testid="cart-count"]');
  await expect(cartBadge).toHaveText('1');
});

test('form validation', async ({ page }) => {
  await page.goto('/contact');
  
  // Try submitting empty form
  await page.click('button[type="submit"]');
  
  // Check error messages
  await expect(page.locator('text=Email is required')).toBeVisible();
  await expect(page.locator('text=Message is required')).toBeVisible();
  
  // Fill form
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('textarea[name="message"]', 'Hello');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verify success
  await expect(page.locator('text=Message sent!')).toBeVisible();
});
```

**Visual regression testing:**

```typescript
test('homepage screenshot', async ({ page }) => {
  await page.goto('/');
  
  // Take screenshot
  await expect(page).toHaveScreenshot('homepage.png');
});
```

**API testing:**

```typescript
test('verify API calls', async ({ page }) => {
  let apiResponse;
  
  // Listen for API response
  page.on('response', (response) => {
    if (response.url().includes('/api/users')) {
      apiResponse = response;
    }
  });
  
  await page.goto('/users');
  await page.waitForLoadState('networkidle');
  
  // Verify API response
  expect(apiResponse.status()).toBe(200);
  const body = await apiResponse.json();
  expect(body).toHaveLength(10);
});
```

**Jest vs Vitest vs Playwright:**

| Feature | Jest | Vitest | Playwright |
|---------|------|--------|-----------|
| **Type** | Unit testing | Unit testing | E2E testing |
| **Speed** | Moderate | Very fast | Moderate |
| **Real browser** | No (jsdom) | No (jsdom/happy-dom) | Yes |
| **Best for** | Components, logic | Fast feedback loop | User workflows |
| **Setup** | Quick | Very quick | Moderate |
| **Async testing** | Good | Excellent | Excellent |

Use **Jest/Vitest** for unit and integration tests. Use **Playwright** for e2e tests that verify the whole user journey.

