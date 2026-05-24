# SW Couriers FE

A modern React application built with TypeScript, Redux Toolkit, Tailwind CSS, and shadcn/ui components. Features form validation with Zod and secure cookie-based authentication.

## 🚀 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React-Redux** - React bindings for Redux
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library built on Radix UI and Tailwind CSS
- **Zod** - TypeScript-first schema validation
- **React Hook Form** - Performant forms with easy validation
- **js-cookie** - Cookie management for authentication

## 📦 Installation

```bash
npm install
```

## 🏃 Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Build

Build for production:

```bash
npm run build
```

## 📁 Project Structure

```
SW-couriers-FE/
├── src/
│   ├── store/
│   │   ├── store.ts          # Redux store configuration
│   │   ├── rootReducer.ts    # Root reducer combining all slices
│   │   ├── hooks.ts          # Typed Redux hooks
│   │   └── slices/
│   │       └── counterSlice.ts  # Example Redux slice
│   ├── App.tsx               # Main App component
│   ├── App.css               # Component styles
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
└── vite.config.ts           # Vite configuration
```

## 🔄 Redux Toolkit

Redux Toolkit is set up with TypeScript support. The store includes:

- **Typed hooks**: Use `useAppDispatch` and `useAppSelector` from `src/store/hooks.ts`
- **Example slice**: A counter slice is included as a reference

### Adding a new slice:

1. Create a new file in `src/store/slices/`
2. Define your slice using `createSlice`
3. Add the reducer to `src/store/store.ts`

Example:

```typescript
import { createSlice } from '@reduxjs/toolkit';

const mySlice = createSlice({
  name: 'myFeature',
  initialState: {
    /* ... */
  },
  reducers: {
    /* ... */
  },
});

export const {
  /* actions */
} = mySlice.actions;
export default mySlice.reducer;
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛠️ Development Tips

1. **TypeScript**: All files use TypeScript for type safety
2. **Redux**: Use typed hooks (`useAppDispatch`, `useAppSelector`) for better type inference
3. **Styling**: Uses Tailwind CSS with shadcn/ui components for consistent, accessible UI
4. **Form Validation**: Uses Zod for schema validation with React Hook Form
5. **Authentication**: Uses cookies (js-cookie) instead of localStorage for better security
6. **Hot Reload**: Vite provides instant HMR (Hot Module Replacement)

---

# How to Access Private Routes (Development)

To access private routes without logging in, you need to set authentication data in cookies.

## Quick Setup

Open your browser's Developer Console (F12) and run:

```javascript
// Set access token (required) - stored in cookies
document.cookie = 'accessToken=dev-token-12345; path=/; max-age=604800'; // 7 days

// Set user data (required) - stored in cookies
document.cookie =
  'user=' +
  encodeURIComponent(
    JSON.stringify({
      id: '1',
      email: 'dev@example.com',
      name: 'Developer',
    })
  ) +
  '; path=/; max-age=604800'; // 7 days

// Reload the page
window.location.reload();
```

**Note:** This project uses cookies (via `js-cookie`) instead of localStorage for better security and HTTP-only cookie support in production.

## Step-by-Step Instructions

### Method 1: Browser Console

1. **Open Developer Tools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

2. **Go to Console Tab**

3. **Run these commands:**

   ```javascript
   // Set the access token (stored in cookies)
   document.cookie = 'accessToken=dev-token-12345; path=/; max-age=604800';

   // Set user information (stored in cookies)
   document.cookie =
     'user=' +
     encodeURIComponent(
       JSON.stringify({
         id: '1',
         email: 'dev@example.com',
         name: 'Developer',
       })
     ) +
     '; path=/; max-age=604800';
   ```

4. **Reload the page**

   ```javascript
   window.location.reload();
   ```

5. **Navigate to `/dashboard`** - You should now have access!

### Method 2: Application Tab (Chrome DevTools)

1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Cookies** → `http://localhost:5173`
4. Add these entries:
   - **Name:** `accessToken` → **Value:** `dev-token-12345` → **Path:** `/` → **Max-Age:** `604800`
   - **Name:** `user` → **Value:** `{"id":"1","email":"dev@example.com","name":"Developer"}` → **Path:** `/` → **Max-Age:** `604800`
5. Reload the page

**Note:** Cookies are used instead of localStorage for authentication storage.

### Method 3: Use the Login Page

The easiest way is to just use the login form:

1. Go to `/login`
2. Enter any email and password
3. Click Login
4. You'll be redirected to `/dashboard`

## What Gets Stored

The authentication system stores two items in cookies (using `js-cookie`):

### 1. `accessToken` (Cookie)

- Any non-empty string value works
- Example: `"dev-token-12345"` or `"test-token"`
- Stored with 7-day expiration, secure in production, sameSite: strict

### 2. `user` (Cookie)

- Must be a valid JSON object with these fields:
  ```json
  {
    "id": "1",
    "email": "user@example.com",
    "name": "User Name"
  }
  ```
- Stored as URL-encoded JSON string with 7-day expiration, secure in production, sameSite: strict

**Why Cookies?** Cookies provide better security than localStorage, support HTTP-only cookies in production, and are automatically sent with requests for server-side authentication.

## Clear Authentication

To log out and clear cookies:

```javascript
// Clear authentication cookies
document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

// Or use the cookie utility (if available in console)
// Cookies.remove('accessToken', { path: '/' });
// Cookies.remove('user', { path: '/' });

// Reload the page
window.location.reload();
```

Or use the logout button in the dashboard header.

## Verify Authentication Status

Check if you're authenticated:

```javascript
// Check if token exists (from cookies)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
console.log('Token:', getCookie('accessToken'));

// Check user data (from cookies)
const userCookie = getCookie('user');
console.log('User:', userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null);

// Check authentication state (in Redux)
// Open Redux DevTools and check auth.isAuthenticated
```

## Troubleshooting

### Still Redirecting to Login?

1. **Check cookies:**

   ```javascript
   function getCookie(name) {
     const value = `; ${document.cookie}`;
     const parts = value.split(`; ${name}=`);
     if (parts.length === 2) return parts.pop().split(';').shift();
   }
   console.log('Token:', getCookie('accessToken'));
   const userCookie = getCookie('user');
   console.log('User:', userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null);
   ```

2. **Make sure values are set correctly:**
   - `accessToken` must be a non-empty string
   - `user` must be valid JSON (URL-encoded in cookie)

3. **Clear and reset:**

   ```javascript
   // Clear all cookies
   document.cookie.split(';').forEach(function (c) {
     document.cookie = c
       .replace(/^ +/, '')
       .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
   });

   // Set new cookies
   document.cookie = 'accessToken=test-token; path=/; max-age=604800';
   document.cookie =
     'user=' +
     encodeURIComponent(JSON.stringify({ id: '1', email: 'test@test.com', name: 'Test' })) +
     '; path=/; max-age=604800';
   window.location.reload();
   ```

### Redux State Not Updating?

The auth slice reads from cookies on initialization. If you set cookies after the app loads, you need to:

1. Reload the page, OR
2. Dispatch the `setCredentials` action manually

**Note:** The application uses `js-cookie` library for cookie management. Cookies are preferred over localStorage for better security and server-side authentication support.

## Production Note

⚠️ **This is for development only!** In production, authentication should be handled through proper API calls and token validation.

---

# Atomic Design Layouts Implementation ✅

Separate layouts for public and private routes have been implemented following atomic design principles.

## Atomic Design Structure

### 📦 Atoms (Basic Building Blocks)

Located in `src/components/atoms/`

- **Logo** - Basic logo component with optional link
- **Button** - Reusable button with variants (primary, secondary, danger, outline) and sizes
- **Link** - Styled router link component

### 🧬 Molecules (Simple Combinations)

Located in `src/components/molecules/`

- **NavigationItem** - Combines Link atom with icon and active state
- **UserMenu** - Combines user info display with logout button

### 🦠 Organisms (Complex Components)

Located in `src/components/organisms/`

- **Header** - Combines Logo with navigation area
- **Footer** - Page footer component
- **Sidebar** - Navigation sidebar for private routes
- **PublicLayout** - Complete layout for public routes (Header + Footer + Content)
- **PrivateLayout** - Complete layout for private routes (Header + Sidebar + Footer + Content)

## Layout Architecture

### PublicLayout

Used for unauthenticated routes (login, register, etc.)

```
┌─────────────────────────────┐
│         Header              │
├─────────────────────────────┤
│                             │
│      Centered Content       │
│      (Login Form, etc.)     │
│                             │
├─────────────────────────────┤
│         Footer              │
└─────────────────────────────┘
```

**Components Used:**

- Header organism
- Footer organism
- Content area (centered, full-width)

### PrivateLayout

Used for authenticated routes (dashboard, profile, etc.)

```
┌─────────────────────────────────────┐
│         Header (with UserMenu)      │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │      Main Content        │
│          │      (Dashboard, etc.)   │
│          │                          │
├──────────┴──────────────────────────┤
│         Footer                      │
└─────────────────────────────────────┘
```

**Components Used:**

- Header organism (with UserMenu molecule)
- Sidebar organism (with NavigationItem molecules)
- Footer organism
- Content area (flexible, scrollable)

## File Structure

```
src/components/
├── atoms/
│   ├── Logo.tsx
│   ├── Button.tsx
│   ├── Link.tsx
│   └── index.ts
├── molecules/
│   ├── NavigationItem.tsx
│   ├── UserMenu.tsx
│   └── index.ts
├── organisms/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   ├── PublicLayout.tsx
│   ├── PrivateLayout.tsx
│   └── index.ts
└── routes/
    ├── PrivateRoute.tsx (wraps with PrivateLayout)
    └── PublicRoute.tsx (wraps with PublicLayout)
```

## How It Works

### Route Configuration

Routes are configured in `src/routes/routes.tsx`:

```typescript
{
  path: '/login',
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <PublicRoute restricted>
        <LoginPage />
      </PublicRoute>
    </Suspense>
  ),
}
```

### PublicRoute Component

- Wraps children with `PublicLayout`
- Handles authentication redirects for restricted routes
- Provides clean, centered layout for public pages

### PrivateRoute Component

- Wraps children with `PrivateLayout`
- Protects routes (redirects to login if not authenticated)
- Provides sidebar navigation and header with user menu

## Usage Examples

### Adding a New Public Page

```typescript
// src/pages/RegisterPage.tsx
export default function RegisterPage() {
  return (
    <div>
      {/* Your registration form */}
    </div>
  );
}

// Routes automatically wrap with PublicLayout
```

### Adding a New Private Page

```typescript
// src/pages/ProfilePage.tsx
export default function ProfilePage() {
  return (
    <div>
      {/* Your profile content */}
    </div>
  );
}

// Routes automatically wrap with PrivateLayout
```

### Adding Navigation Items

Update `PrivateLayout.tsx`:

```typescript
<Sidebar>
  <NavigationItem to="/dashboard" active={location.pathname === '/dashboard'}>
    Dashboard
  </NavigationItem>
  <NavigationItem to="/profile" active={location.pathname === '/profile'}>
    Profile
  </NavigationItem>
</Sidebar>
```

## Benefits

✅ **Separation of Concerns** - Layout logic separated from page content
✅ **Reusability** - Components follow atomic design principles
✅ **Maintainability** - Easy to update layouts without touching pages
✅ **Consistency** - All public/private pages share the same layout
✅ **Scalability** - Easy to add new pages and navigation items

## Customization

### Styling

All components use inline styles for simplicity. You can:

- Replace with CSS modules
- Use Tailwind classes (already configured)
- Add styled-components
- Use any CSS-in-JS solution

### Layout Modifications

- **Header**: Edit `src/components/organisms/Header.tsx`
- **Footer**: Edit `src/components/organisms/Footer.tsx`
- **Sidebar**: Edit `src/components/organisms/Sidebar.tsx`
- **PublicLayout**: Edit `src/components/organisms/PublicLayout.tsx`
- **PrivateLayout**: Edit `src/components/organisms/PrivateLayout.tsx`

## Next Steps

1. Add more navigation items to Sidebar
2. Customize Header with additional features
3. Add breadcrumbs or other navigation elements
4. Implement responsive design for mobile
5. Add animations/transitions
6. Integrate with your design system

---

# Error Boundary

This directory contains error boundary components for catching and handling React errors gracefully.

## Components

### ErrorBoundary

A React class component that catches JavaScript errors anywhere in the child component tree and displays a fallback UI.

### ErrorScreen

A user-friendly error display component that shows error information and provides recovery options.

## Usage

### Basic Usage

Wrap your app or components with ErrorBoundary:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from '@/App';

function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
```

### With Custom Error Handler

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to error reporting service
    console.error('Error caught:', error);
    // Send to error tracking service
    // logErrorToService(error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### With Custom Fallback UI

```tsx
<ErrorBoundary fallback={<div>Custom error message</div>}>
  <YourComponent />
</ErrorBoundary>
```

## Features

- ✅ Catches JavaScript errors in component tree
- ✅ Displays user-friendly error screen
- ✅ Shows detailed error info in development mode
- ✅ Provides recovery options (Try Again, Reload, Navigate)
- ✅ Logs errors to console
- ✅ Supports custom error handlers
- ✅ Supports custom fallback UI

## Testing

To test the error boundary, create a component that throws an error:

```tsx
function TestErrorComponent() {
  throw new Error('Test error for error boundary');
  return <div>This won't render</div>;
}

// Wrap it with ErrorBoundary
<ErrorBoundary>
  <TestErrorComponent />
</ErrorBoundary>;
```

## Notes

- Error boundaries only catch errors in:
  - Render methods
  - Lifecycle methods
  - Constructors of the whole tree below them

- Error boundaries do NOT catch errors in:
  - Event handlers
  - Asynchronous code (setTimeout, promises)
  - Server-side rendering
  - Errors thrown in the error boundary itself

---

# React Router Setup Complete ✅

React Router DOM has been successfully configured with route protection based on access tokens.

## What Was Set Up

### 1. **React Router DOM Installation**

- ✅ Installed `react-router-dom` package
- ✅ Configured with React Router v6+ API

### 2. **Authentication Slice** (`src/store/slices/authSlice.ts`)

- ✅ Redux slice for managing authentication state
- ✅ Access token storage in cookies (using js-cookie)
- ✅ User information management
- ✅ Actions: `setCredentials`, `clearCredentials`, `updateUser`
- ✅ Selectors: `selectAccessToken`, `selectIsAuthenticated`, `selectUser`

### 3. **Routes Configuration** (`src/routes/routes.tsx`)

- ✅ Centralized route configuration file
- ✅ Lazy loading for code splitting
- ✅ Route definitions with protection

### 4. **Route Protection Components**

#### **PrivateRoute** (`src/components/routes/PrivateRoute.tsx`)

- ✅ Protects routes that require authentication
- ✅ Redirects to `/login` if not authenticated
- ✅ Preserves intended destination in location state

#### **PublicRoute** (`src/components/routes/PublicRoute.tsx`)

- ✅ Handles public routes
- ✅ Optional `restricted` prop to redirect authenticated users
- ✅ Useful for login/register pages

### 5. **Example Pages**

- ✅ **HomePage** (`/`) - Public route
- ✅ **LoginPage** (`/login`) - Public route (restricted for authenticated users)
- ✅ **DashboardPage** (`/dashboard`) - Private route (requires authentication)
- ✅ **NotFoundPage** (`*`) - 404 catch-all route

### 6. **API Integration**

- ✅ Updated `baseApi.ts` to include access token in headers
- ✅ Automatic token injection for authenticated requests
- ✅ 401 error handling with automatic logout

## Route Structure

```
/                    → HomePage (Public)
/login              → LoginPage (Public, Restricted)
/dashboard          → DashboardPage (Private)
/*                  → NotFoundPage (404)
```

## Usage Examples

### Adding a New Private Route

1. Create your page component:

```typescript
// src/pages/ProfilePage.tsx
export default function ProfilePage() {
  return <div>Profile Page</div>;
}
```

2. Add to routes configuration:

```typescript
// src/routes/routes.tsx
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

export const routes: RouteObject[] = [
  // ... existing routes
  {
    path: '/profile',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PrivateRoute>
          <ProfilePage />
        </PrivateRoute>
      </Suspense>
    ),
  },
];
```

### Adding a New Public Route

```typescript
{
  path: '/about',
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <PublicRoute>
        <AboutPage />
      </PublicRoute>
    </Suspense>
  ),
}
```

### Using Authentication in Components

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, clearCredentials } from '../store/slices/authSlice';

function MyComponent() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  // ... component logic
}
```

### Programmatic Navigation

```typescript
import { useNavigate, useLocation } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigate to a route
  navigate('/dashboard');

  // Navigate with state
  navigate('/login', { state: { from: location.pathname } });
}
```

## Authentication Flow

1. **Login Process:**
   - User enters credentials on `/login`
   - On success, `setCredentials` action is dispatched
   - Token and user info stored in Redux and cookies (using js-cookie)
   - User redirected to intended destination or `/dashboard`

2. **Protected Route Access:**
   - User tries to access `/dashboard` (or any private route)
   - `PrivateRoute` checks authentication status
   - If not authenticated → redirects to `/login` with return URL
   - If authenticated → renders the protected component

3. **API Requests:**
   - All API requests automatically include `Authorization: Bearer <token>` header
   - On 401 response → credentials cleared and user logged out

4. **Logout Process:**
   - `clearCredentials` action dispatched
   - Token and user info removed from Redux and cookies
   - User redirected to `/login`

## File Structure

```
src/
├── routes/
│   └── routes.tsx              # Route configuration
├── components/
│   └── routes/
│       ├── PrivateRoute.tsx    # Private route wrapper
│       └── PublicRoute.tsx     # Public route wrapper
├── pages/
│   ├── HomePage.tsx            # Home page
│   ├── LoginPage.tsx           # Login page
│   ├── DashboardPage.tsx       # Dashboard (protected)
│   └── NotFoundPage.tsx       # 404 page
├── store/
│   ├── slices/
│   │   └── authSlice.ts       # Authentication slice
│   └── api/
│       └── baseApi.ts          # API with token injection
└── App.tsx                     # RouterProvider setup
```

## Best Practices

1. **Route Protection:**
   - Always wrap private routes with `<PrivateRoute>`
   - Use `restricted` prop on login/register pages

2. **Code Splitting:**
   - Use `lazy()` for all page components
   - Wrap routes with `<Suspense>` for loading states

3. **Token Management:**
   - Store tokens in Redux state and cookies (using js-cookie)
   - Clear tokens on 401 errors
   - Include tokens in API headers automatically

4. **Navigation:**
   - Use `useNavigate()` for programmatic navigation
   - Preserve return URLs for better UX

5. **Type Safety:**
   - Use TypeScript for all route configurations
   - Type your route state properly

## Testing Routes

1. **Test Public Routes:**
   - Visit `/` - should work without authentication
   - Visit `/login` - should work without authentication

2. **Test Private Routes:**
   - Visit `/dashboard` without login - should redirect to `/login`
   - Login and visit `/dashboard` - should work

3. **Test Restricted Routes:**
   - Login first
   - Visit `/login` - should redirect to `/dashboard`

4. **Test 404:**
   - Visit `/non-existent-route` - should show 404 page

## Next Steps

1. Replace mock authentication in `LoginPage.tsx` with real API call
2. Add token refresh logic in `baseApi.ts` if needed
3. Add more protected routes as needed
4. Implement role-based access control if required
5. Add route guards for specific user roles/permissions

## Resources

- [React Router Documentation](https://reactrouter.com/)
- [React Router v6 Guide](https://reactrouter.com/en/main/start/overview)
- [Protected Routes Pattern](https://reactrouter.com/en/main/start/concepts#protected-routes)

---

# RTK Query Setup Complete ✅

Redux Toolkit Query (RTK Query) has been successfully configured for API calls in your project.

## What Was Set Up

### 1. Base API Configuration (`src/store/api/baseApi.ts`)

- ✅ Created `baseApi` using `createApi` from RTK Query
- ✅ Configured `fetchBaseQuery` with base URL from environment variables
- ✅ Set up automatic header preparation (Content-Type, Accept)
- ✅ Implemented error handling with re-authentication support (ready for token refresh)
- ✅ Configured global refetch behaviors

### 2. Store Configuration

- ✅ Updated `store.ts` to include RTK Query middleware
- ✅ Updated `rootReducer.ts` to include API reducer
- ✅ Properly typed with TypeScript

### 3. Type Definitions (`src/store/api/types.ts`)

- ✅ Common API response types (`ApiResponse`, `PaginatedResponse`)
- ✅ Query parameter types (`PaginationParams`, `SortParams`, `FilterParams`)
- ✅ Error type definitions

### 4. Utility Functions (`src/store/api/utils.ts`)

- ✅ Error type guards (`isFetchBaseQueryError`, `isErrorWithMessage`)
- ✅ Error message extraction (`getErrorMessage`)
- ✅ API error formatting (`formatApiError`)

### 5. Todos API Slice (`src/store/api/todosApi.ts`)

- ✅ Complete example using JSONPlaceholder API showing:
  - Query endpoints (GET all, GET by ID, GET by user ID)
  - Mutations (CREATE, UPDATE, PATCH, DELETE)
  - Cache tag management
  - TypeScript typing

### 6. Documentation

- ✅ Comprehensive README in `src/store/api/README.md`
- ✅ Usage examples and best practices

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://your-api-url.com/api
```

If not set, defaults to `/api`.

## Quick Start

### 1. Create Your First API Slice

Create `src/store/api/couriersApi.ts`:

```typescript
import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse } from './types';

interface Courier {
  id: number;
  name: string;
  email: string;
}

export const couriersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCouriers: builder.query<PaginatedResponse<Courier>, void>({
      query: () => 'couriers',
      providesTags: ['Courier'],
    }),
  }),
});

export const { useGetCouriersQuery } = couriersApi;
```

### 2. Add Tag Type to baseApi.ts

```typescript
tagTypes: [
  'Courier', // Add this
  // ... other tag types
],
```

### 3. Use in Component

```typescript
import { useGetCouriersQuery } from '@/store/api/couriersApi';
import { getErrorMessage } from '@/store/api';

function CouriersList() {
  const { data, isLoading, error } = useGetCouriersQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {getErrorMessage(error)}</div>;

  return (
    <ul>
      {data?.data.map((courier) => (
        <li key={courier.id}>{courier.name}</li>
      ))}
    </ul>
  );
}
```

## Features

- ✅ **Automatic Caching**: RTK Query automatically caches responses
- ✅ **Request Deduplication**: Multiple components requesting the same data = one request
- ✅ **Cache Invalidation**: Automatic cache updates via tags
- ✅ **TypeScript Support**: Full type safety
- ✅ **Loading States**: Built-in loading, error, and success states
- ✅ **Optimistic Updates**: Support for optimistic UI updates
- ✅ **Pagination**: Built-in support for paginated responses
- ✅ **Error Handling**: Comprehensive error handling utilities

## File Structure

```
src/store/api/
├── baseApi.ts       # Core API configuration
├── types.ts         # TypeScript types
├── utils.ts         # Error handling utilities
├── todosApi.ts      # Todos API slice (JSONPlaceholder example)
├── index.ts         # Central exports
└── README.md        # Detailed documentation
```

## RTK Query API Setup

This directory contains the RTK Query API configuration and API slices for making API calls.

### Creating a New API Slice

1. Create a new file in this directory (e.g., `couriersApi.ts`)
2. Import `baseApi` and use `injectEndpoints`:

```typescript
import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse } from './types';

interface Courier {
  id: number;
  name: string;
  // ... other fields
}

export const couriersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCouriers: builder.query<PaginatedResponse<Courier>, void>({
      query: () => 'couriers',
      providesTags: ['Courier'],
    }),
    // ... more endpoints
  }),
});

export const { useGetCouriersQuery } = couriersApi;
```

3. Add the tag type to `baseApi.ts`:

```typescript
tagTypes: [
  'Courier', // Add your new tag type here
  // ... other tag types
],
```

### Using API Hooks in Components

```typescript
import { useGetCouriersQuery } from '@/store/api/couriersApi';
import { getErrorMessage } from '@/store/api';

function CouriersList() {
  const { data, isLoading, error } = useGetCouriersQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {getErrorMessage(error)}</div>;

  return (
    <ul>
      {data?.data.map((courier) => (
        <li key={courier.id}>{courier.name}</li>
      ))}
    </ul>
  );
}
```

### Using Mutations

```typescript
import { useCreateCourierMutation } from '@/store/api/couriersApi';

function CreateCourierForm() {
  const [createCourier, { isLoading }] = useCreateCourierMutation();

  const handleSubmit = async (data: CreateCourierDto) => {
    try {
      await createCourier(data).unwrap();
      // Success handling
    } catch (error) {
      // Error handling
      console.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## Cache Invalidation

RTK Query uses tags for cache invalidation. When a mutation completes, it can invalidate related queries:

```typescript
updateCourier: builder.mutation({
  query: ({ id, ...patch }) => ({
    url: `couriers/${id}`,
    method: 'PATCH',
    body: patch,
  }),
  invalidatesTags: (_result, _error, { id }) => [
    { type: 'Courier', id },
    { type: 'Courier', id: 'LIST' },
  ],
}),
```

## Error Handling

Use the utility functions from `utils.ts`:

```typescript
import { getErrorMessage, formatApiError } from '@/store/api';

// In component
const { error } = useGetCouriersQuery();
if (error) {
  const apiError = formatApiError(error);
  console.error(apiError.message, apiError.status);
}
```

## Best Practices

1. **Type Safety**: Always define TypeScript interfaces for your API responses
2. **Tag Types**: Use consistent tag naming (singular form: 'Courier', not 'Couriers')
3. **Cache Tags**: Use 'LIST' as a special ID for list queries
4. **Error Handling**: Always handle loading and error states in components
5. **Code Splitting**: Create separate API slices for different domains (couriers, shipments, users, etc.)

## Next Steps

1. Update `baseApi.ts` tagTypes with your actual tag types
2. Create API slices for your domains (couriers, shipments, users, etc.)
3. Set up authentication token handling in `baseApi.ts` if needed

## Resources

- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [API Slice Documentation](https://redux-toolkit.js.org/rtk-query/api/createApi)

---

# GitHub Actions CI/CD Setup

Complete GitHub Actions workflows for automated CI/CD, code quality checks, and deployment.

## ✅ What's Configured

### Workflow Files Created

1. **`.github/workflows/ci.yml`** - Main CI pipeline
2. **`.github/workflows/pre-push.yml`** - Pre-push validation
3. **`.github/workflows/code-quality.yml`** - PR code quality checks
4. **`.github/workflows/deploy.yml`** - Deployment automation
5. **`.github/workflows/README.md`** - Workflow documentation

## 🎯 Workflow Overview

### 1. CI Workflow (`ci.yml`)

**Triggers:**

- Pull requests to `main`, `master`, or `develop`
- Pushes to `main`, `master`, or `develop`

**Jobs (run in parallel, then build):**

- ✅ **Lint**: ESLint check
- ✅ **Format Check**: Prettier format verification
- ✅ **Type Check**: TypeScript type checking
- ✅ **Build**: Builds project (only if all checks pass)

### 2. Pre-push Validation (`pre-push.yml`)

**Triggers:**

- Pushes to feature branches (not main/master/develop)

**Jobs:**

- ✅ All quality checks (lint, format, type-check, build)

### 3. Code Quality (`code-quality.yml`)

**Triggers:**

- Pull request events (opened, synchronized, reopened)
- Manual workflow dispatch

**Features:**

- ✅ All quality checks
- ✅ PR comment with results

### 4. Deploy (`deploy.yml`)

**Triggers:**

- Git tags: `v*.*.*`, `staging-v*`, `release-v*`
- Manual workflow dispatch

**Features:**

- ✅ All quality checks
- ✅ Build project
- ✅ Deploy to staging or production based on tag

## 🚀 Quick Start

### For Pull Requests

```bash
# Create a branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push (pre-push validation runs)
git push origin feature/my-feature

# Create PR → CI workflow runs automatically
```

### For Deployment

**Staging:**

```bash
git tag staging-v1.0.0
git push origin staging-v1.0.0
```

**Production:**

```bash
git tag release-v1.0.0
# or
git tag v1.0.0
git push origin v1.0.0
```

## 📋 Workflow Matrix

| Workflow         | Trigger         | Checks | Build | Deploy |
| ---------------- | --------------- | ------ | ----- | ------ |
| **CI**           | PR/Push to main | ✅     | ✅    | ❌     |
| **Pre-push**     | Push to feature | ✅     | ✅    | ❌     |
| **Code Quality** | PR events       | ✅     | ✅    | ❌     |
| **Deploy**       | Tags/Manual     | ✅     | ✅    | ✅     |

## 🔧 Configuration

### Node.js Version

All workflows use **Node.js 20** (configurable via `env.NODE_VERSION`)

### Caching

- npm cache automatically handled by `actions/setup-node@v4`
- Build artifacts retained for 7-30 days

### Required Secrets (for deployment)

Add these in GitHub repository settings → Secrets:

- `DEPLOY_TOKEN` - Deployment authentication token
- `STAGING_WEBHOOK` - Staging deployment webhook URL
- `PRODUCTION_WEBHOOK` - Production deployment webhook URL

## 📊 Workflow Status

View workflow runs:

- **GitHub UI**: Actions tab → Select workflow → View runs
- **PR Checks**: Status checks appear on pull requests
- **Badges**: Add status badges to README (optional)

## 🎨 Customization

### Change Branch Names

Edit workflow files and update:

```yaml
branches: [main, master, develop] # Modify as needed
```

### Change Tag Patterns

Edit `deploy.yml`:

```yaml
tags:
  - 'v*.*.*' # Semantic versioning
  - 'staging-v*' # Staging tags
  - 'release-v*' # Release tags
```

### Add More Checks

Add new jobs to workflows:

```yaml
new-check:
  name: New Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run your-check-script
```

## 🔍 Verification

All workflows are ready to use. They will:

- ✅ Run automatically on PR/push/tag events
- ✅ Use the same checks as local hooks (lint, format, type-check, build)
- ✅ Provide clear error messages if checks fail
- ✅ Upload build artifacts for deployment

## 🎯 Benefits

✅ **Automated Quality Checks**: No broken code reaches main branch  
✅ **Consistent CI/CD**: Same checks locally and in CI  
✅ **Fast Feedback**: Parallel job execution  
✅ **Deployment Automation**: Tag-based deployments  
✅ **PR Integration**: Status checks on pull requests

---

# TypeScript Configuration - Preventing `any` Usage

This project is configured to prevent the use of the `any` keyword and enforce strict type safety.

## Configuration Summary

### TypeScript Compiler Options (`tsconfig.app.json`)

The following strict options are enabled:

- ✅ `strict: true` - Enables all strict type checking options
- ✅ `noImplicitAny: true` - Prevents implicit `any` types
- ✅ `strictNullChecks: true` - Ensures null and undefined are handled properly
- ✅ `strictFunctionTypes: true` - Enforces strict checking of function types
- ✅ `strictBindCallApply: true` - Strict checking of bind, call, and apply methods
- ✅ `strictPropertyInitialization: true` - Ensures class properties are initialized
- ✅ `noImplicitThis: true` - Prevents implicit `any` for `this` context
- ✅ `alwaysStrict: true` - Parses in strict mode and emits "use strict"

### ESLint Rules (`eslint.config.js`)

The following rules prevent `any` usage and enforce type safety:

#### Critical Rules (Error Level)

- **`@typescript-eslint/no-explicit-any`**: **ERROR** - Prevents explicit `any` type usage
- **`@typescript-eslint/no-unsafe-assignment`**: **ERROR** - Prevents unsafe assignments
- **`@typescript-eslint/no-unsafe-member-access`**: **ERROR** - Prevents unsafe member access
- **`@typescript-eslint/no-unsafe-call`**: **ERROR** - Prevents unsafe function calls
- **`@typescript-eslint/no-unsafe-return`**: **ERROR** - Prevents unsafe return values
- **`@typescript-eslint/no-unsafe-argument`**: **ERROR** - Prevents unsafe function arguments

#### Code Quality Rules

- **`@typescript-eslint/explicit-function-return-type`**: **WARN** - Encourages explicit return types
- **`@typescript-eslint/consistent-type-definitions`**: **ERROR** - Enforces `interface` over `type` for object types
- **`@typescript-eslint/consistent-type-imports`**: **ERROR** - Enforces type-only imports

## Examples

### ❌ This will cause an ERROR:

```typescript
// Explicit 'any' - NOT ALLOWED
function processData(data: any): any {
  return data.something;
}

// Unsafe assignment - NOT ALLOWED
const result: string = someUnknownValue;

// Missing return type - WARNING
function getValue() {
  return 42;
}
```

### ✅ Correct approaches:

```typescript
// Use proper types
function processData<T>(data: T): T {
  return data;
}

// Use unknown for truly unknown values
function handleUnknown(value: unknown): void {
  if (typeof value === 'string') {
    console.log(value.toUpperCase());
  }
}

// Explicit return type
function getValue(): number {
  return 42;
}

// Use type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

## Type Safety Best Practices

### 1. Use `unknown` instead of `any`

When you truly don't know the type, use `unknown` and add type guards:

```typescript
function processUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  throw new Error('Expected string');
}
```

### 2. Use Generics for Reusable Code

```typescript
function identity<T>(arg: T): T {
  return arg;
}
```

### 3. Use Type Assertions Sparingly

Only when you're certain about the type:

```typescript
const element = document.getElementById('myId') as HTMLInputElement;
```

### 4. Use Type Guards

```typescript
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'name' in obj && 'email' in obj;
}
```

### 5. Use Discriminated Unions

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };
```

## Running Linting

```bash
npm run lint
```

This will catch all `any` usage and type safety violations before they reach production.

## Benefits

1. **Type Safety**: Prevents runtime errors by catching type issues at compile time
2. **Better IDE Support**: Improved autocomplete and refactoring capabilities
3. **Self-Documenting Code**: Types serve as inline documentation
4. **Easier Refactoring**: TypeScript can safely refactor code when types are explicit
5. **Team Collaboration**: Clear contracts between functions and components

## Migration Guide

If you have existing code with `any`:

1. **Identify the source**: Find where `any` is used
2. **Determine the actual type**: What should the type really be?
3. **Use type inference**: Let TypeScript infer types where possible
4. **Add type guards**: For truly unknown values, use `unknown` with guards
5. **Use generics**: For reusable functions, use generics
6. **Create interfaces**: For object shapes, create proper interfaces

## Common Patterns

### API Responses

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  // ...
}
```

### Event Handlers

```typescript
function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
  console.log(event.target.value);
}
```

### Redux/State Management

```typescript
interface RootState {
  user: UserState;
  counter: CounterState;
}

const selectUser = (state: RootState): UserState => state.user;
```

---

# Tailwind CSS Theme Variables Usage Guide

This project uses custom Tailwind CSS theme variables defined in `src/theme.module.css`.

## Quick Reference

### Colors

#### Primary Colors

```jsx
<div className="bg-primary-500 text-primary-50">Primary Background</div>
<div className="border-primary-600">Primary Border</div>
<div className="text-primary-700">Primary Text</div>
```

Available shades: `primary-50` through `primary-950`

#### Secondary Colors

```jsx
<div className="bg-secondary-500">Secondary Background</div>
```

Available shades: `secondary-50` through `secondary-950`

#### Accent Colors

```jsx
<div className="bg-accent-500">Accent Background</div>
```

Available shades: `accent-50` through `accent-950`

#### Semantic Colors

```jsx
<div className="bg-success text-white">Success Message</div>
<div className="bg-warning text-white">Warning Message</div>
<div className="bg-error text-white">Error Message</div>
<div className="bg-info text-white">Info Message</div>
```

### Typography

#### Font Families

```jsx
<h1 className="font-display">Display Font</h1>
<p className="font-body">Body Font</p>
<code className="font-mono">Monospace Font</code>
```

#### Font Sizes

```jsx
<p className="text-xs">Extra Small</p>
<p className="text-sm">Small</p>
<p className="text-base">Base</p>
<p className="text-lg">Large</p>
<p className="text-xl">Extra Large</p>
<p className="text-2xl">2X Large</p>
<p className="text-3xl">3X Large</p>
<p className="text-4xl">4X Large</p>
```

#### Font Weights

```jsx
<p className="font-light">Light (300)</p>
<p className="font-normal">Normal (400)</p>
<p className="font-medium">Medium (500)</p>
<p className="font-semibold">Semibold (600)</p>
<p className="font-bold">Bold (700)</p>
<p className="font-extrabold">Extrabold (800)</p>
```

### Spacing

```jsx
<div className="p-4">Padding 4 (1rem)</div>
<div className="m-8">Margin 8 (2rem)</div>
<div className="gap-6">Gap 6 (1.5rem)</div>
<div className="space-y-4">Vertical spacing 4</div>
```

### Border Radius

```jsx
<div className="rounded-sm">Small radius</div>
<div className="rounded-md">Medium radius</div>
<div className="rounded-lg">Large radius</div>
<div className="rounded-xl">Extra large radius</div>
<div className="rounded-2xl">2X large radius</div>
<div className="rounded-full">Full circle</div>
```

### Shadows

#### Box Shadows

```jsx
<div className="shadow-sm">Small shadow</div>
<div className="shadow-md">Medium shadow</div>
<div className="shadow-lg">Large shadow</div>
<div className="shadow-xl">Extra large shadow</div>
<div className="shadow-2xl">2X large shadow</div>
```

#### Drop Shadows

```jsx
<div className="drop-shadow-sm">Small drop shadow</div>
<div className="drop-shadow-md">Medium drop shadow</div>
<div className="drop-shadow-lg">Large drop shadow</div>
```

### Transitions

```jsx
<button className="transition-all duration-200 ease-in-out">
  Smooth transition
</button>
<button className="transition-colors duration-300 ease-out">
  Color transition
</button>
```

Available durations: `duration-75`, `duration-100`, `duration-150`, `duration-200`, `duration-300`, `duration-500`, `duration-700`, `duration-1000`

Available easings: `ease-linear`, `ease-in`, `ease-out`, `ease-in-out`, `ease-back`, `ease-elastic`

### Responsive Breakpoints

```jsx
<div className="text-sm md:text-base lg:text-lg xl:text-xl">
  Responsive text
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

Available breakpoints: `xs:`, `sm:`, `md:`, `lg:`, `xl:`, `2xl:`, `3xl:`, `4xl:`, `5xl:`, `6xl:`, `7xl:`

### Z-Index

```jsx
<div className="z-10">Layer 10</div>
<div className="z-20">Layer 20</div>
<div className="z-30">Layer 30</div>
<div className="z-40">Layer 40</div>
<div className="z-50">Layer 50</div>
```

### Blur Effects

```jsx
<div className="blur-sm">Small blur</div>
<div className="blur-md">Medium blur</div>
<div className="blur-lg">Large blur</div>
<div className="blur-xl">Extra large blur</div>
```

## Using CSS Variables Directly

You can also use the CSS variables directly in your CSS or inline styles:

```jsx
<div
  style={{
    backgroundColor: 'var(--theme-primary)',
    color: 'var(--theme-secondary)',
    fontFamily: 'var(--theme-font-display)',
  }}
>
  Using CSS variables directly
</div>
```

## Customizing Theme Variables

To customize theme variables, edit `src/theme.module.css` and modify the values inside the `@theme` block. After saving, Tailwind will automatically regenerate the utility classes.

Example:

```css
@theme {
  --color-primary-500: oklch(0.6 0.25 250); /* Change this value */
}
```

## Best Practices

1. **Use semantic color names**: Prefer `primary`, `secondary`, `accent` over specific color names
2. **Consistent spacing**: Use the spacing scale (4, 8, 12, 16, etc.) for consistent layouts
3. **Responsive design**: Always consider mobile-first approach with breakpoints
4. **Accessibility**: Ensure sufficient color contrast ratios
5. **Performance**: Tailwind automatically purges unused styles in production builds

---

# ✅ Complete Setup: Lint, Type Check, Format, Pre-commit & Pre-push

This project is now fully configured with comprehensive code quality checks based on industry best practices.

## 🎯 What's Configured

### 1. **Linting (ESLint)**

- ✅ TypeScript-aware ESLint configuration
- ✅ React hooks and refresh plugins
- ✅ Strict rules preventing `any` usage
- ✅ Auto-fix on staged files

### 2. **Type Checking (TypeScript)**

- ✅ Strict TypeScript configuration
- ✅ No implicit `any` allowed
- ✅ Type-safe code enforcement

### 3. **Formatting (Prettier)**

- ✅ Consistent code formatting
- ✅ Auto-format on commit
- ✅ Format check script available

### 4. **Pre-commit Hook**

- ✅ Runs on `git commit`
- ✅ Lints and formats staged files only (fast)
- ✅ Prevents committing broken code

### 5. **Pre-push Hook**

- ✅ Runs on `git push`
- ✅ Full lint check (all files)
- ✅ Format check (all files)
- ✅ Type check (all files)
- ✅ Build check (ensures compilation)

## 📋 Available Scripts

```bash
# Linting
npm run lint          # Check all files for linting errors
npm run lint:fix      # Auto-fix linting errors

# Type Checking
npm run type-check    # Check TypeScript types without building

# Formatting
npm run format        # Format all files with Prettier
npm run format:check  # Check if files are formatted (CI-friendly)

# Pre-push (runs automatically, but can be run manually)
npm run pre-push      # Run all checks: lint + format + type-check + build
```

## 🔄 Git Hooks Flow

### Pre-commit Hook (Fast - Staged Files Only)

```
git commit
    ↓
🔍 Pre-commit triggered
    ↓
📝 lint-staged (ESLint + Prettier on staged files)
    ↓
✅ Commit proceeds
```

### Pre-push Hook (Comprehensive - All Files)

```
git push
    ↓
🚀 Pre-push triggered
    ↓
🔎 ESLint (all files)
    ↓
💅 Prettier format (all files)
    ↓
📘 TypeScript type check (all files)
    ↓
🏗️  Build check (compile project)
    ↓
✅ Push proceeds
```

## 🎨 Configuration Files

### ESLint (`eslint.config.js`)

- Type-aware linting with TypeScript
- Prevents `any` usage
- React-specific rules
- Auto-fixable rules

### Prettier (`.prettierrc.json`)

- Consistent code formatting
- 100 character line width
- Single quotes for JS/TS
- Semicolons enabled

### TypeScript (`tsconfig.app.json`)

- Strict mode enabled
- No implicit `any`
- Full type checking

### Lint-staged (`package.json`)

- Runs ESLint + Prettier on staged files
- Only processes changed files (fast)

## 🚀 Usage Examples

### Daily Development Workflow

1. **Make changes:**

   ```bash
   # Edit files...
   ```

2. **Stage changes:**

   ```bash
   git add .
   ```

3. **Commit (pre-commit runs automatically):**

   ```bash
   git commit -m "feat: add new feature"
   # Pre-commit hook runs:
   # - Lints staged files
   # - Formats staged files
   # - If errors, commit is blocked
   ```

4. **Push (pre-push runs automatically):**
   ```bash
   git push
   # Pre-push hook runs:
   # - Lints all files
   # - Formats all files
   # - Type checks all files
   # - Builds project
   # - If errors, push is blocked
   ```

### Manual Checks

**Before committing:**

```bash
npm run lint:fix      # Fix linting issues
npm run format        # Format code
npm run type-check    # Check types
```

**Before pushing:**

```bash
npm run pre-push      # Run all checks
```

## ⚠️ What Happens If Checks Fail?

### Pre-commit Failure

- ❌ Commit is **blocked**
- 📋 Error messages shown
- 🔧 Fix issues and commit again

### Pre-push Failure

- ❌ Push is **blocked**
- 📋 Error messages shown
- 🔧 Fix issues and push again

## 🎯 Benefits

✅ **Fast pre-commit**: Only checks staged files  
✅ **Comprehensive pre-push**: Ensures entire codebase is clean  
✅ **Consistent formatting**: Prettier enforces style  
✅ **Type safety**: TypeScript catches errors early  
✅ **No broken builds**: Build check prevents compilation errors  
✅ **Team consistency**: Everyone follows same standards

## 🔧 Troubleshooting

### Hook Not Running?

```bash
# Reinstall hooks
npm run prepare
```

### Format Issues?

```bash
# Auto-format all files
npm run format
```

### Type Errors?

```bash
# Check types manually
npm run type-check
```

### Lint Errors?

```bash
# Auto-fix linting issues
npm run lint:fix
```

---

# Husky Pre-commit Hooks Setup

This project uses **Husky** to run automated checks before every commit, ensuring code quality and preventing broken code from entering the repository.

## 🎯 What Runs on Pre-commit

When you run `git commit`, the following checks are executed automatically:

### 1. **Lint-staged** (Staged Files Only)

- Runs ESLint with auto-fix on staged TypeScript/JavaScript files
- Only processes files that are staged for commit (faster)
- Automatically fixes fixable linting issues

### 2. **TypeScript Type Checking**

- Runs `tsc --noEmit` to check for type errors
- Validates all TypeScript files in the project
- Prevents commits with type errors

### 3. **ESLint** (All Files)

- Runs ESLint on the entire codebase
- Catches any linting issues that weren't auto-fixed
- Enforces code quality standards

### 4. **Build Check**

- Runs the full build process (`npm run build`)
- Ensures the project compiles successfully
- Prevents commits that would break the build

## 📋 Pre-commit Hook Flow

```
git commit
    ↓
🔍 Pre-commit hook triggered
    ↓
📝 Lint-staged (ESLint auto-fix on staged files)
    ↓
📘 TypeScript type check (all files)
    ↓
🔎 ESLint check (all files)
    ↓
🏗️  Build check (compile project)
    ↓
✅ All checks passed → Commit proceeds
❌ Any check fails → Commit blocked
```

## 🚀 Setup Instructions

### Initial Setup (Already Done)

1. **Install Husky and lint-staged:**

   ```bash
   npm install --save-dev husky lint-staged
   ```

2. **Initialize Husky:**

   ```bash
   npx husky init
   ```

3. **Configure package.json:**
   - Added `prepare` script: `"prepare": "husky"`
   - Added `lint-staged` configuration
   - Added `type-check` script

### For New Team Members

When cloning the repository:

```bash
npm install
```

The `prepare` script will automatically set up Husky hooks.

## 📝 Available Scripts

- `npm run type-check` - Check TypeScript types without building
- `npm run lint` - Run ESLint on all files
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run build` - Build the project

## 🔧 Configuration Files

### `.husky/pre-commit`

The pre-commit hook script that runs all checks.

### `package.json` - `lint-staged`

Configuration for lint-staged:

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix --max-warnings=0"],
  "*.{js,jsx}": ["eslint --fix --max-warnings=0"]
}
```

## ⚠️ What Happens If Checks Fail?

If any check fails:

1. ❌ The commit is **blocked**
2. 📋 Error messages are displayed
3. 🔧 Fix the issues
4. ✅ Stage your fixes and commit again

## 🎨 Bypassing Hooks (Not Recommended)

**⚠️ Only use in emergencies!**

To bypass hooks (not recommended):

```bash
git commit --no-verify
```

**Why this is bad:**

- Breaks CI/CD pipeline
- Allows broken code into the repository
- Defeats the purpose of quality checks

## 🔍 Troubleshooting

### Hook Not Running?

1. Ensure Husky is installed: `npm install`
2. Check `.husky/pre-commit` exists and is executable
3. Verify Git hooks are enabled: `git config core.hooksPath .husky`

### Type Check Failing?

- Run `npm run type-check` manually to see errors
- Fix TypeScript errors before committing

### ESLint Errors?

- Run `npm run lint:fix` to auto-fix issues
- Manually fix remaining errors

### Build Failing?

- Run `npm run build` manually to see errors
- Ensure all dependencies are installed: `npm install`

## 📚 Best Practices

1. **Run checks locally before committing:**

   ```bash
   npm run type-check && npm run lint && npm run build
   ```

2. **Fix linting issues immediately:**

   ```bash
   npm run lint:fix
   ```

3. **Keep hooks enabled:**
   - Don't disable hooks
   - Don't use `--no-verify` unless absolutely necessary

4. **Commit frequently:**
   - Smaller commits = faster hook execution
   - Easier to identify and fix issues

## 🎯 Benefits

✅ **Prevents broken code** from entering the repository  
✅ **Enforces code quality** standards automatically  
✅ **Catches errors early** before CI/CD pipeline  
✅ **Saves time** by catching issues locally  
✅ **Consistent code style** across the team

## 📖 Related Documentation

- [TypeScript Configuration](#typescript-configuration---preventing-any-usage)
- [Theme Usage Guide](#tailwind-css-theme-variables-usage-guide)

---

---

# shadcn/ui Setup Complete ✅

shadcn/ui has been successfully configured and integrated into the project following the existing coding patterns.

## 🎯 What's Configured

### 1. **Dependencies Installed**

- ✅ `class-variance-authority` - For component variants
- ✅ `clsx` - For conditional class names
- ✅ `tailwind-merge` - For merging Tailwind classes intelligently

### 2. **Configuration Files**

- ✅ `components.json` - shadcn/ui configuration matching project patterns
- ✅ `tailwind.config.ts` - Tailwind configuration for shadcn/ui compatibility
- ✅ `src/lib/utils.ts` - `cn()` utility function for class merging

### 3. **Directory Structure**

- ✅ `src/components/ui/` - Directory for shadcn/ui components
- ✅ `src/lib/` - Utility functions directory

### 4. **Theme Integration**

- ✅ CSS variables added to `src/index.css` for shadcn/ui components
- ✅ Dark mode support configured
- ✅ Theme variables integrated with existing Tailwind setup

## 🚀 Usage

### Adding shadcn/ui Components

Use the shadcn CLI to add components:

```bash
# Add a component (e.g., button)
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button input card

# List all available components
npx shadcn@latest add
```

Components will be added to `src/components/ui/` following your project structure.

### Using Components

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  );
}
```

### Using the `cn()` Utility

The `cn()` utility merges Tailwind classes intelligently:

```tsx
import { cn } from '@/lib/utils';

function MyComponent({ className }: { className?: string }) {
  return <div className={cn('base-classes', className)}>Content</div>;
}
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── index.ts
│   ├── atoms/           # Your existing atoms
│   ├── molecules/       # Your existing molecules
│   └── organisms/       # Your existing organisms
└── lib/
    └── utils.ts         # cn() utility function
```

## 🎨 Theme Customization

shadcn/ui uses CSS variables for theming. Variables are defined in `src/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 217.2 91.2% 59.8%;
  /* ... more variables */
}
```

To customize colors, edit the CSS variables in `src/index.css`. The theme integrates with your existing Tailwind configuration.

## 🔧 Configuration Details

### components.json

```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### Path Aliases

The configuration uses your existing path aliases:

- `@/components` → `src/components`
- `@/lib/utils` → `src/lib/utils`
- `@/components/ui` → `src/components/ui`

## 📚 Best Practices

1. **Component Organization**: shadcn/ui components go in `src/components/ui/`, while your custom components follow the atomic design pattern (atoms, molecules, organisms).

2. **Styling**: Use the `cn()` utility for conditional classes and class merging.

3. **Customization**: shadcn/ui components are copied into your project, so you can customize them directly.

4. **TypeScript**: All components are fully typed and work with your strict TypeScript configuration.

5. **Integration**: shadcn/ui components work seamlessly with your existing Tailwind setup and theme variables.

## 🎯 Next Steps

1. **Add Components**: Start adding shadcn/ui components as needed:

   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add dialog
   ```

2. **Customize**: Modify component files in `src/components/ui/` to match your design system.

3. **Export**: Update `src/components/ui/index.ts` to export components for easier imports.

## 📖 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Component Examples](https://ui.shadcn.com/docs/components)
- [Theming Guide](https://ui.shadcn.com/docs/theming)

---

## 📄 License

Private project
