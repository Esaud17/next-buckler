<p align="center">
  <img alt="Next-Buckler" src="./assets/images/buckler.png" width="300" />
</p>
<h1 align="center">
  Next-Buckler
</h1>

<p align="center">
  🔒 <strong>The shield that every Next.js app needs</strong>
</p>

<p align="center">
  Effortless authentication and authorization management for Next.js applications
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-usage-examples">Examples</a> •
  <a href="#-api-reference">API</a>
</p>

---

## 🎯 Why Next-Buckler?

After implementing authentication and authorization boilerplate across countless projects, I created **Next-Buckler** to solve these pain points once and for all:

- ✅ No more repetitive auth boilerplate code
- ✅ No hardcoded redirects - state-driven routing
- ✅ Zero flash of unauthenticated content (FOUC)
- ✅ Type-safe routes and roles
- ✅ Works with any auth provider (NextAuth, Auth0, Clerk, custom, etc.)

---

## ✨ Features

- **🔐 Role-Based Access Control (RBAC)**: Manage complex permissions with multiple roles
- **🚦 Automatic Route Protection**: Smart redirection based on authentication state
- **🎭 Conditional Rendering**: `BucklerGuard` component to show/hide UI based on roles
- **🔄 Hybrid Routes**: Support for routes accessible by both authenticated and non-authenticated users
- **⚡ Optimized Performance**: Automatic memoization and route validation with caching
- **🛡️ Security First**: Built-in protection against path traversal and bypass attacks
- **📊 Monitoring**: Callbacks to track unauthorized access attempts
- **🎯 TypeScript First**: Full typing with intelligent inference
- **🪶 Lightweight**: ~25KB minified
- **🔧 Framework Agnostic**: Compatible with any authentication solution

---

## 📦 Installation

```bash
npm install next-buckler
# or
yarn add next-buckler
# or
pnpm add next-buckler
```

---

## 🚀 Quick Start

### Step 1: Import Components

```typescript
import { Buckler, BucklerGuard } from 'next-buckler'
```

### Step 2: Wrap Your App

Update your `_app.tsx` to protect your routes:

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { Buckler } from 'next-buckler'
import { useAuth } from './hooks/useAuth' // Your auth hook

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <Buckler
      isAuth={isAuthenticated}
      isLoading={isLoading}
      router={router}
      loginRoute="/login"
      defaultRoute="/dashboard"
      privateRoutes={['/dashboard', '/profile', '/settings']}
      publicRoutes={['/login', '/register', '/']}
      LoadingComponent={<div>Loading...</div>}
    >
      <Component {...pageProps} />
    </Buckler>
  )
}

export default MyApp
```

### Step 3: Use BucklerGuard for Conditional UI

```typescript
// components/AdminPanel.tsx
import { BucklerGuard } from 'next-buckler'

export function AdminPanel() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <BucklerGuard
        RBAC
        showForRole="admin"
        userRoles={['admin']}
        fallback={<p>Access denied</p>}
      >
        <AdminContent />
      </BucklerGuard>
    </div>
  )
}
```

---

## 📚 Complete Implementation Examples

### Example 1: Basic Authentication (No RBAC)

Perfect for apps with simple authenticated/non-authenticated states.

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { Buckler } from 'next-buckler'
import { useSession } from 'next-auth/react'

// Define your routes as constants for type safety
const PRIVATE_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/projects',
  '/projects/[id]'
] as const

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/pricing'
] as const

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const isAuthenticated = !!session
  const isLoading = status === 'loading'

  return (
    <Buckler
      isAuth={isAuthenticated}
      isLoading={isLoading}
      router={router}
      loginRoute="/login"
      defaultRoute="/dashboard"
      privateRoutes={PRIVATE_ROUTES}
      publicRoutes={PUBLIC_ROUTES}
      LoadingComponent={
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      }
    >
      <Component {...pageProps} />
    </Buckler>
  )
}

export default MyApp
```

**What happens:**
- ✅ Unauthenticated users accessing `/dashboard` → Redirected to `/login`
- ✅ Authenticated users accessing `/login` → Redirected to `/dashboard`
- ✅ No flash of content during authentication check
- ✅ Loading spinner shown during state transitions

---

### Example 2: Role-Based Access Control (RBAC)

For apps with multiple user roles and complex permissions.

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { Buckler } from 'next-buckler'
import { useAuth } from '@/hooks/useAuth'

// Define routes with type safety
const PRIVATE_ROUTES = [
  '/dashboard',
  '/admin',
  '/admin/users',
  '/admin/settings',
  '/editor',
  '/editor/posts',
  '/profile'
] as const

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register'
] as const

// Define RBAC configuration
const RBAC_CONFIG = {
  admin: {
    accessRoute: '/admin',
    grantedRoutes: [
      '/dashboard',
      '/admin',
      '/admin/users',
      '/admin/settings',
      '/editor',
      '/editor/posts',
      '/profile'
    ]
  },
  editor: {
    accessRoute: '/editor',
    grantedRoutes: [
      '/dashboard',
      '/editor',
      '/editor/posts',
      '/profile'
    ]
  },
  user: {
    accessRoute: '/dashboard',
    grantedRoutes: [
      '/dashboard',
      '/profile'
    ]
  }
} as const

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <Buckler
      isAuth={isAuthenticated}
      isLoading={isLoading}
      router={router}
      loginRoute="/login"
      defaultRoute="/dashboard"
      privateRoutes={PRIVATE_ROUTES}
      publicRoutes={PUBLIC_ROUTES}
      RBAC={RBAC_CONFIG}
      userRoles={user?.roles} // e.g., ['admin', 'editor']
      strictMode={process.env.NODE_ENV !== 'production'}
      onUnauthorizedAccess={(info) => {
        // Log unauthorized access attempts
        console.warn('Unauthorized access attempt:', info)
        // Send to analytics
        analytics.track('unauthorized_access', {
          path: info.path,
          reason: info.reason,
          userRoles: info.userRoles
        })
      }}
      LoadingComponent={<LoadingSpinner />}
    >
      <Component {...pageProps} />
    </Buckler>
  )
}

export default MyApp
```

**What happens:**
- ✅ Admin accessing `/editor` → ✅ Allowed (admin has access)
- ✅ Editor accessing `/admin` → ❌ Redirected to `/editor` (insufficient permissions)
- ✅ User accessing `/editor` → ❌ Redirected to `/dashboard` (insufficient permissions)
- ✅ Each role automatically redirected to their designated `accessRoute`
- ✅ Unauthorized attempts logged via callback

---

### Example 3: Hybrid Routes

Routes that are accessible to both authenticated and non-authenticated users.

```typescript
// pages/_app.tsx
import { Buckler } from 'next-buckler'

const PRIVATE_ROUTES = ['/dashboard', '/settings'] as const
const PUBLIC_ROUTES = ['/login', '/register'] as const
const HYBRID_ROUTES = ['/blog', '/blog/[slug]', '/docs', '/about'] as const

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <Buckler
      isAuth={isAuthenticated}
      isLoading={isLoading}
      router={router}
      loginRoute="/login"
      defaultRoute="/dashboard"
      privateRoutes={PRIVATE_ROUTES}
      publicRoutes={PUBLIC_ROUTES}
      hybridRoutes={HYBRID_ROUTES} // ← No redirects for these routes
      LoadingComponent={<LoadingSpinner />}
    >
      <Component {...pageProps} />
    </Buckler>
  )
}
```

**Use cases for hybrid routes:**
- Blog posts accessible to everyone, with extra features for logged-in users
- Documentation pages
- Landing pages with conditional content
- Marketing pages

---

### Example 4: Conditional UI with BucklerGuard

Control what UI elements users see based on their roles.

```typescript
// components/Dashboard.tsx
import { BucklerGuard } from 'next-buckler'
import { useAuth } from '@/hooks/useAuth'

export function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="container">
      <h1>Dashboard</h1>

      {/* Show admin panel only to admins */}
      <BucklerGuard
        RBAC
        showForRole="admin"
        userRoles={user?.roles}
        fallback={null}
      >
        <AdminPanel />
      </BucklerGuard>

      {/* Show editor tools to editors and admins */}
      <BucklerGuard
        RBAC
        showForRole="editor"
        userRoles={user?.roles}
        fallback={<p className="text-gray-500">Upgrade to editor to access these tools</p>}
      >
        <EditorTools />
      </BucklerGuard>

      {/* Simple conditional rendering */}
      <BucklerGuard
        showIf={user?.isPremium}
        fallback={<UpgradePrompt />}
      >
        <PremiumFeatures />
      </BucklerGuard>

      {/* Always visible content */}
      <UserProfile user={user} />
    </div>
  )
}
```

**Multiple guards in action:**

```typescript
// components/Navbar.tsx
import { BucklerGuard } from 'next-buckler'

export function Navbar({ userRoles }: { userRoles?: string[] }) {
  return (
    <nav>
      <Logo />
      
      {/* Admin link */}
      <BucklerGuard RBAC showForRole="admin" userRoles={userRoles}>
        <NavLink href="/admin">Admin Panel</NavLink>
      </BucklerGuard>
      
      {/* Editor link */}
      <BucklerGuard RBAC showForRole="editor" userRoles={userRoles}>
        <NavLink href="/editor">Editor</NavLink>
      </BucklerGuard>
      
      {/* User link (everyone) */}
      <NavLink href="/dashboard">Dashboard</NavLink>
      <NavLink href="/profile">Profile</NavLink>
    </nav>
  )
}
```

---

### Example 5: With NextAuth.js

```typescript
// pages/_app.tsx
import { SessionProvider, useSession } from 'next-auth/react'
import { Buckler } from 'next-buckler'

function BucklerWrapper({ Component, pageProps }: any) {
  const router = useRouter()
  const { data: session, status } = useSession()

  return (
    <Buckler
      isAuth={!!session}
      isLoading={status === 'loading'}
      router={router}
      loginRoute="/login"
      defaultRoute="/dashboard"
      privateRoutes={['/dashboard', '/profile']}
      publicRoutes={['/login', '/']}
      RBAC={{
        admin: {
          accessRoute: '/admin',
          grantedRoutes: ['/admin', '/dashboard', '/profile']
        },
        user: {
          accessRoute: '/dashboard',
          grantedRoutes: ['/dashboard', '/profile']
        }
      }}
      userRoles={session?.user?.roles}
      LoadingComponent={<div>Loading...</div>}
    >
      <Component {...pageProps} />
    </Buckler>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <BucklerWrapper Component={Component} pageProps={pageProps} />
    </SessionProvider>
  )
}

export default MyApp
```

---

### Example 6: With Custom Auth Hook

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch user from your API
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user)
        setIsLoading(false)
      })
      .catch(() => {
        setUser(null)
        setIsLoading(false)
      })
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  }
}

// pages/_app.tsx
import { useAuth } from '@/hooks/useAuth'
import { Buckler } from 'next-buckler'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <Buckler
      isAuth={isAuthenticated}
      isLoading={isLoading}
      router={router}
      loginRoute="/login"
      defaultRoute="/dashboard"
      privateRoutes={['/dashboard', '/profile']}
      publicRoutes={['/login', '/register']}
      userRoles={user?.roles}
      LoadingComponent={<div>Loading...</div>}
    >
      <Component {...pageProps} />
    </Buckler>
  )
}
```

---

## 💎 Key Advantages

### 1. **No More Authentication Boilerplate**

**Without Next-Buckler:**

```typescript
// Every protected page needs this boilerplate
function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <Loading />
  if (!user) return null // Prevents flash

  return <Dashboard />
}
```

**With Next-Buckler:**

```typescript
// Just wrap once in _app.tsx, all routes protected automatically
function DashboardPage() {
  return <Dashboard /> // That's it!
}
```

**Result:** Remove hundreds of lines of repetitive code across your app.

---

### 2. **Zero Flash of Unauthenticated Content (FOUC)**

Next-Buckler handles the authentication state transitions intelligently:

```typescript
<Buckler
  isAuth={isAuthenticated}
  isLoading={isLoading}
  LoadingComponent={<Spinner />} // Shown during checks
  // ...
>
```

- While checking auth status → Shows loading component
- Invalid access detected → Instant redirect before render
- No flash, no flicker, professional UX

---

### 3. **Type-Safe Routes**

Define routes once, get autocomplete and type checking:

```typescript
const PRIVATE_ROUTES = ['/dashboard', '/admin'] as const
const PUBLIC_ROUTES = ['/login', '/'] as const

<Buckler
  loginRoute="/login" // ✅ Autocomplete from PUBLIC_ROUTES
  defaultRoute="/dashboard" // ✅ Autocomplete from PRIVATE_ROUTES
  privateRoutes={PRIVATE_ROUTES}
  publicRoutes={PUBLIC_ROUTES}
/>
```

TypeScript will catch typos and invalid route references at compile time.

---

### 4. **Dynamic Routes Support**

Next-Buckler understands Next.js dynamic routes:

```typescript
const PRIVATE_ROUTES = [
  '/users/[id]',           // /users/123 ✅
  '/posts/[...slug]',      // /posts/a/b/c ✅
  '/shop/[[...slug]]',     // /shop OR /shop/a/b ✅
]
```

Automatic matching with security built-in (prevents path traversal attacks).

---

### 5. **Complex RBAC Made Simple**

Manage multi-role, multi-permission systems effortlessly:

```typescript
const RBAC = {
  'super-admin': {
    accessRoute: '/super-admin',
    grantedRoutes: ['/admin', '/editor', '/dashboard', '/super-admin']
  },
  'admin': {
    accessRoute: '/admin',
    grantedRoutes: ['/admin', '/editor', '/dashboard']
  },
  'editor': {
    accessRoute: '/editor',
    grantedRoutes: ['/editor', '/dashboard']
  },
  'viewer': {
    accessRoute: '/dashboard',
    grantedRoutes: ['/dashboard']
  }
}
```

Users can have multiple roles - Next-Buckler checks all of them automatically.

---

### 6. **Security Monitoring**

Track and log unauthorized access attempts:

```typescript
<Buckler
  onUnauthorizedAccess={(info) => {
    // Log to your monitoring service
    Sentry.captureMessage('Unauthorized access attempt', {
      extra: {
        path: info.path,
        reason: info.reason, // 'not_authenticated' | 'insufficient_permissions'
        userRoles: info.userRoles,
        timestamp: info.timestamp
      }
    })
  }}
  // ...
/>
```

Perfect for security audits and analytics.

---

### 7. **Framework Agnostic**

Works with any authentication provider:

- ✅ NextAuth.js
- ✅ Auth0
- ✅ Clerk
- ✅ Firebase Auth
- ✅ Supabase Auth
- ✅ Custom JWT auth
- ✅ Cookie-based auth
- ✅ Session-based auth

Just provide `isAuth` and `isLoading` states.

---

### 8. **Performance Optimized**

```typescript
// Internal optimizations:
// - Route validation results are cached
// - Path calculations are memoized
// - Regex patterns compiled once
// - No unnecessary re-renders
```

Your auth checks don't slow down your app.

---

### 9. **Developer Experience**

```typescript
// Strict mode for development
<Buckler
  strictMode={process.env.NODE_ENV !== 'production'}
  // Throws errors for misconfigurations in dev
  // Logs warnings in production
  // ...
/>
```

Catch configuration errors early in development.

---

### 10. **Flexible UI Control**

```typescript
// Hide features for non-premium users
<BucklerGuard showIf={user.isPremium} fallback={<UpgradeButton />}>
  <PremiumFeature />
</BucklerGuard>

// Show different content based on role
<BucklerGuard RBAC showForRole="admin" userRoles={roles} fallback={<StandardView />}>
  <AdminView />
</BucklerGuard>
```

Granular control over what users see.

---

## 📖 API Reference

### `Buckler` Component

Main wrapper component for route protection.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isAuth` | `boolean` | ✅ | Whether the user is authenticated |
| `isLoading` | `boolean` | ✅ | Whether auth state is loading |
| `router` | `NextRouter` | ✅ | Next.js router instance |
| `loginRoute` | `string` | ✅ | Route to redirect unauthenticated users |
| `defaultRoute` | `string` | ✅ | Default route for authenticated users |
| `privateRoutes` | `string[]` | ✅ | Array of protected routes |
| `publicRoutes` | `string[]` | ✅ | Array of public routes |
| `hybridRoutes` | `string[]` | ❌ | Routes accessible to all users |
| `LoadingComponent` | `ReactNode` | ✅ | Component shown during loading |
| `RBAC` | `RoleAccess` | ❌ | RBAC configuration object |
| `userRoles` | `string[]` | ❌ | Current user's roles (required if RBAC is used) |
| `accessRoute` | `string` | ❌ | Override access route (not used with RBAC) |
| `strictMode` | `boolean` | ❌ | Throw errors instead of warnings (default: `false`) |
| `onUnauthorizedAccess` | `function` | ❌ | Callback for unauthorized access attempts |

#### RBAC Configuration Type

```typescript
type RoleAccess<Routes extends string[]> = {
  [roleName: string]: {
    accessRoute?: string        // Where to redirect this role on login
    grantedRoutes: Routes       // Routes this role can access
  }
}
```

#### UnauthorizedAccessInfo Type

```typescript
type UnauthorizedAccessInfo = {
  path: string                  // Attempted path
  userRoles: string[] | undefined
  timestamp: Date
  reason: 'not_authenticated' | 'insufficient_permissions' | 'invalid_route'
}
```

---

### `BucklerGuard` Component

Conditional rendering component for UI elements.

#### Props (Variant 1: Simple Conditional)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `showIf` | `boolean` | ✅ | Condition to show children |
| `fallback` | `ReactNode` | ❌ | Content to show when condition is false (default: `null`) |
| `children` | `ReactNode` | ✅ | Content to show when condition is true |

#### Props (Variant 2: RBAC)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `RBAC` | `true` | ✅ | Enable RBAC mode |
| `showForRole` | `string` | ✅ | Role required to see children |
| `userRoles` | `string[]` | ✅ | Current user's roles |
| `fallback` | `ReactNode` | ❌ | Content to show when role not matched (default: `null`) |
| `children` | `ReactNode` | ✅ | Content to show when role matches |

#### Usage Examples

```typescript
// Simple conditional
<BucklerGuard showIf={isPremium}>
  <PremiumFeature />
</BucklerGuard>

// With fallback
<BucklerGuard showIf={isPremium} fallback={<UpgradePrompt />}>
  <PremiumFeature />
</BucklerGuard>

// RBAC mode
<BucklerGuard RBAC showForRole="admin" userRoles={['user', 'editor']}>
  <AdminPanel /> {/* Won't show - user doesn't have 'admin' role */}
</BucklerGuard>

// RBAC with fallback
<BucklerGuard 
  RBAC 
  showForRole="admin" 
  userRoles={['admin']}
  fallback={<AccessDenied />}
>
  <AdminPanel /> {/* Will show - user has 'admin' role */}
</BucklerGuard>
```

---

## 🎯 Route Patterns

Next-Buckler supports all Next.js routing patterns:

```typescript
const routes = [
  '/dashboard',              // Static route
  '/users/[id]',            // Dynamic route
  '/posts/[...slug]',       // Catch-all route
  '/shop/[[...slug]]',      // Optional catch-all
  '/api/[version]/users',   // Multiple dynamic segments
]
```

### Pattern Matching Examples

| Route Pattern | Matches | Doesn't Match |
|--------------|---------|---------------|
| `/users/[id]` | `/users/123`, `/users/abc` | `/users`, `/users/123/edit` |
| `/posts/[...slug]` | `/posts/a`, `/posts/a/b/c` | `/posts` (requires at least one segment) |
| `/shop/[[...slug]]` | `/shop`, `/shop/a`, `/shop/a/b` | `/other` |

---

## 🛡️ Security Features

### Path Traversal Protection

Next-Buckler automatically normalizes and validates paths:

```typescript
// These attacks are prevented:
'/public/../admin'    // Normalized to /admin (blocked if admin is private)
'//admin'             // Normalized to /admin
'/./admin'            // Normalized to /admin
```

### Exact Route Matching

Dynamic routes use exact matching to prevent bypasses:

```typescript
// Route: /users/[id]
'/users/123'          // ✅ Match
'/users/123/admin'    // ❌ No match (prevents privilege escalation)
'/users'              // ❌ No match
```

### Role Validation

```typescript
// In strictMode, invalid roles throw errors
<Buckler
  RBAC={{
    admin: { grantedRoutes: ['/admin'] }
  }}
  userRoles={['superadmin']}  // ❌ Role doesn't exist
  strictMode={true}           // Will throw error
/>
```

---

## 📝 Naming Conventions

### Recommended Route Naming

```typescript
// ✅ Good: Clear and semantic
const PRIVATE_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/admin/users',
]

// ❌ Avoid: Inconsistent naming
const routes = ['/dash', '/user-profile', '/admin_panel']
```

### Role Naming Best Practices

```typescript
// ✅ Good: Descriptive role names
const RBAC = {
  'super-admin': { ... },
  'admin': { ... },
  'content-editor': { ... },
  'viewer': { ... },
}

// ❌ Avoid: Cryptic or inconsistent
const RBAC = {
  'sa': { ... },
  'Admin': { ... },        // Inconsistent casing
  'content_editor': { ... }, // Mixed separators
}
```

### Route Groups Organization

```typescript
// ✅ Good: Organized by feature
const ADMIN_ROUTES = ['/admin', '/admin/users', '/admin/settings']
const EDITOR_ROUTES = ['/editor', '/editor/posts', '/editor/media']
const USER_ROUTES = ['/dashboard', '/profile', '/settings']

const PRIVATE_ROUTES = [
  ...ADMIN_ROUTES,
  ...EDITOR_ROUTES,
  ...USER_ROUTES,
]
```

---

## 🎨 Best Practices

### 1. Define Routes as Constants

```typescript
// ✅ Good: Type-safe and reusable
const PRIVATE_ROUTES = ['/dashboard', '/profile'] as const
const PUBLIC_ROUTES = ['/login', '/'] as const

export { PRIVATE_ROUTES, PUBLIC_ROUTES }
```

### 2. Use Strict Mode in Development

```typescript
<Buckler
  strictMode={process.env.NODE_ENV !== 'production'}
  // Catches configuration errors early
/>
```

### 3. Implement onUnauthorizedAccess

```typescript
<Buckler
  onUnauthorizedAccess={(info) => {
    // Log to analytics
    analytics.track('unauthorized_access', info)
    
    // Alert on repeated attempts
    if (isRepeatedAttempt(info.path)) {
      alertSecurityTeam(info)
    }
  }}
/>
```

### 4. Use Hybrid Routes Wisely

```typescript
// Good use case: Public content with auth-specific features
const HYBRID_ROUTES = [
  '/blog',           // Anyone can read
  '/blog/[slug]',    // Anyone can read
  '/docs',           // Anyone can read
]

// In the page, show extra features for authenticated users
<BucklerGuard showIf={isAuth} fallback={null}>
  <BookmarkButton />
  <CommentSection />
</BucklerGuard>
```

### 5. Organize RBAC Configuration

```typescript
// config/rbac.ts
export const RBAC_CONFIG = {
  admin: {
    accessRoute: '/admin',
    grantedRoutes: ['...']
  },
  // ... other roles
} as const

// Use in _app.tsx
import { RBAC_CONFIG } from '@/config/rbac'
```

### 6. Custom Loading Components

```typescript
// components/AuthLoading.tsx
export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner className="h-12 w-12" />
        <p className="mt-4 text-gray-600">Verifying authentication...</p>
      </div>
    </div>
  )
}

// Use in Buckler
<Buckler LoadingComponent={<AuthLoading />} />
```

### 7. Handle Multiple Roles

```typescript
// User can have multiple roles
const userRoles = ['editor', 'moderator', 'premium']

// Buckler checks if ANY role has access
<Buckler
  RBAC={{
    editor: { grantedRoutes: ['/editor'] },
    moderator: { grantedRoutes: ['/moderation'] },
    premium: { grantedRoutes: ['/premium'] },
  }}
  userRoles={userRoles}  // User gets access to all granted routes
/>
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT © esaud.rivera

---

## 🙏 Motivation

After countless hours writing the same authentication boilerplate across projects, **Next-Buckler** was born from the frustration of:

- Copying auth logic between projects
- Managing complex redirect flows
- Preventing flash of unauthorized content
- Handling role-based permissions manually
- Writing repetitive `useEffect` hooks for route protection

**Next-Buckler** solves all of this in a single, elegant component.

---

<p align="center">
  Made with ❤️ for the Next.js community
</p>

<p align="center">
  <strong>If Next-Buckler saves you time, consider giving it a ⭐️ on GitHub!</strong>
</p>
