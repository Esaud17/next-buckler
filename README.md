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
  <a href="#-complete-implementation-examples">Examples</a> •
  <a href="#-menu-based-configuration-new-in-v125">Menu-Based Config</a> •
  <a href="#-key-advantages">Advantages</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-advanced-utilities">Advanced Utilities</a>
</p>

---

##  What's New in v1.2.6

🎉 **Menu-Based Configuration** - The biggest feature yet!

- **🎯 Single Source of Truth**: Define your navigation menu once, auto-generate RBAC configuration
- **📉 79% Less Code**: Reduce ~150-200 lines of boilerplate per project
- **🔒 Security Built-In**: Automatic validation prevents duplicate routes, role leakage, and misconfigurations
- **� Flexible Role Assignment**: Use `role: 'admin'` (single) OR `roles: ['admin', 'editor']` (multiple) - both formats supported!
- **�🔌 NextAuth Integration**: Optional `useBucklerSession()` hook and role processing helpers
- **🛠️ Advanced Utilities**: Access internal functions like `verifyPath`, `getGrantedRoutes`, `isDynamicRoute`
- **🌳 Tree-Shakeable**: Import only what you need - integrations don't bloat your bundle

[See Full Documentation](#-menu-based-configuration-new-in-v125) | [Before & After Comparison](#-before--after-comparison)

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
- **🎯 Menu-Based Configuration**: Auto-generate RBAC from menu structure - reduce boilerplate by 79%
- **🏭 Helper Utilities**: Process menus, group routes, merge configurations with security validation
- **🔌 Framework Integrations**: Optional NextAuth.js helpers (tree-shakeable)
- **🛠️ Advanced Utilities**: Export internal functions for custom auth logic
- **⚡ Optimized Performance**: Automatic memoization and route validation with caching
- **🛡️ Security First**: Built-in protection against path traversal and bypass attacks
- **📊 Monitoring**: Callbacks to track unauthorized access attempts
- **🎯 TypeScript First**: Full typing with intelligent inference
- **🪶 Lightweight**: ~4KB minified (under 25KB limit)
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

## � Import Reference

All exports are available from the main package entry point:

```typescript
import { /* any export */ } from 'next-buckler'
```

### Core Components

| Export | Category | Description |
|--------|----------|-------------|
| `Buckler` | Component | Main route protection wrapper component |
| `BucklerGuard` | Component | Conditional rendering component for role-based UI |

### Helper Functions (Menu-Based Configuration)

| Export | Category | Description |
|--------|----------|-------------|
| `processMenuItems` | Helper | Process menu structure with role-based visibility |
| `groupRoutesByType` | Helper | Auto-generate RBAC configuration from menu |
| `mergeGroupedRoutes` | Helper | Merge multiple route configurations |

### Utility Functions (Advanced)

| Export | Category | Description |
|--------|----------|-------------|
| `verifyPath` | Utility | Validate paths with security checks (dynamic routes support) |
| `isDynamicRoute` | Utility | Detect if route contains dynamic segments |
| `getAccessRoute` | Utility | Determine user's default route based on roles |
| `getGrantedRoutes` | Utility | Calculate all accessible routes for user |

### NextAuth.js Integration (Optional)

| Export | Category | Description |
|--------|----------|-------------|
| `useBucklerSession` | Hook | NextAuth session hook with Buckler-compatible output |
| `processSessionRoles` | Function | Extract and normalize roles from NextAuth session |
| `createRoleHandler` | Factory | Create custom role validation logic |

### TypeScript Types

| Export | Category | Description |
|--------|----------|-------------|
| `BucklerProps` | Type | Props for Buckler component |
| `UnauthorizedAccessInfo` | Type | Callback info for unauthorized access attempts |
| `RoleAccess` | Type | RBAC configuration type |
| `MenuItem` | Type | Menu item structure for menu-based configuration |
| `RouteType` | Type | Route type union: `'private' \| 'public' \| 'hybrid'` |
| `GroupedRoutes` | Type | Output type of `groupRoutesByType()` |
| `MenuProcessorOptions` | Type | Options for menu processing |
| `ValidationResult` | Type | Validation result structure |
| `ProcessedMenu` | Type | Output type of `processMenuItems()` |
| `BucklerSession` | Type | NextAuth session type for Buckler |
| `SessionProcessorOptions` | Type | Options for session role processing |

**Note:** All integrations are tree-shakeable. NextAuth helpers are only included in your bundle if you import them.

---

## �🚀 Quick Start

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

## 🎯 Menu-Based Configuration (NEW in v1.2.6)

**The Problem:** Most applications define navigation menus AND route permissions separately, leading to duplicate code and sync issues.

**The Solution:** Define your menu structure once with metadata, then automatically generate RBAC configuration and apply role-based visibility.

### 💪 Why Menu-Based Configuration?

✅ **Single Source of Truth** - Define routes and permissions in one place  
✅ **Reduce Boilerplate** - Eliminate ~150-200 lines of repetitive configuration  
✅ **Auto-Generated RBAC** - Generate route permissions from menu structure  
✅ **Type-Safe** - Full TypeScript support with intelligent inference  
✅ **Security Built-In** - Automatic validation prevents configuration errors  
✅ **Framework Integration** - Optional NextAuth.js helpers included  

---

### 📋 Before & After Comparison

<details>
<summary><strong>❌ Before: Manual Configuration (~165 lines)</strong></summary>

```typescript
// routes.ts
export const menuItems = [
  { path: '/', label: 'Home', icon: 'HomeIcon' },
  { path: '/dashboard', label: 'Dashboard', icon: 'DashboardIcon' },
  { path: '/admin', label: 'Admin', icon: 'AdminIcon' },
  { path: '/admin/users', label: 'Users', icon: 'UsersIcon' },
  { path: '/editor', label: 'Editor', icon: 'EditorIcon' },
]

// config/rbac.ts
export const RBAC_CONFIG = {
  admin: {
    accessRoute: '/admin',
    grantedRoutes: ['/dashboard', '/admin', '/admin/users', '/editor', '/profile']
  },
  editor: {
    accessRoute: '/editor',
    grantedRoutes: ['/dashboard', '/editor', '/profile']
  },
  user: {
    accessRoute: '/dashboard',
    grantedRoutes: ['/dashboard', '/profile']
  }
}

export const PRIVATE_ROUTES = ['/dashboard', '/admin', '/admin/users', '/editor', '/profile']
export const PUBLIC_ROUTES = ['/', '/login', '/register']

// helpers/menus.ts
export function processMenuItems(items: MenuItem[], userRoles: string[]) {
  return items.filter(item => {
    if (item.roles) {
      return item.roles.some(role => userRoles.includes(role))
    }
    return true
  }).map(item => ({
    ...item,
    children: item.children ? processMenuItems(item.children, userRoles) : undefined
  }))
}

export function groupRoutesByType(items: MenuItem[]) {
  const privateRoutes: string[] = []
  const publicRoutes: string[] = []
  
  function extract(items: MenuItem[]) {
    items.forEach(item => {
      if (item.type === 'private') privateRoutes.push(item.path)
      if (item.type === 'public') publicRoutes.push(item.path)
      if (item.children) extract(item.children)
    })
  }
  
  extract(items)
  return { privateRoutes, publicRoutes }
}

// pages/_app.tsx
import { RBAC_CONFIG, PRIVATE_ROUTES, PUBLIC_ROUTES } from '@/config/routes'
import { processMenuItems } from '@/helpers/menus'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { data: session } = useSession()
  
  const visibleMenu = processMenuItems(menuItems, session?.user?.roles || [])
  
  return (
    <Buckler
      isAuth={!!session}
      isLoading={status === 'loading'}
      router={router}
      loginRoute="/login"
      defaultRoute="/dashboard"
      privateRoutes={PRIVATE_ROUTES}
      publicRoutes={PUBLIC_ROUTES}
      RBAC={RBAC_CONFIG}
      userRoles={session?.user?.roles}
    >
      <Layout menu={visibleMenu}>
        <Component {...pageProps} />
      </Layout>
    </Buckler>
  )
}
```

**Total: ~165 lines** + manual sync between menu and RBAC config

</details>

<details open>
<summary><strong>✅ After: Menu-Based Configuration (~35 lines)</strong></summary>

```typescript
// config/menu.ts
import type { MenuItem } from 'next-buckler'

export const menuConfig: MenuItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: 'HomeIcon',
    type: 'public'
  },
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'DashboardIcon',
    type: 'private',
    roles: ['user', 'editor', 'admin']
  },
  {
    path: '/admin',
    label: 'Admin',
    icon: 'AdminIcon',
    type: 'private',
    roles: ['admin'],
    children: [
      {
        path: '/admin/users',
        label: 'Manage Users',
        icon: 'UsersIcon',
        type: 'private',
        roles: ['admin']
      }
    ]
  },
  {
    path: '/editor',
    label: 'Editor',
    icon: 'EditorIcon',
    type: 'private',
    roles: ['editor', 'admin']
  }
]

// pages/_app.tsx
import { Buckler, processMenuItems, groupRoutesByType, useBucklerSession } from 'next-buckler'
import { menuConfig } from '@/config/menu'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { isAuth, isLoading, userRoles } = useBucklerSession()
  
  // Process menu for visibility
  const { visibleItems: visibleMenu } = processMenuItems(menuConfig, userRoles)
  
  // Auto-generate route configuration
  const { privateRoutes, publicRoutes, rbacConfig } = groupRoutesByType(menuConfig)
  
  return (
    <Buckler
      isAuth={isAuth}
      isLoading={isLoading}
      router={router}
      loginRoute="/login"
      defaultRoute="/dashboard"
      privateRoutes={privateRoutes}
      publicRoutes={publicRoutes}
      RBAC={rbacConfig}
      userRoles={userRoles}
    >
      <Layout menu={visibleMenu}>
        <Component {...pageProps} />
      </Layout>
    </Buckler>
  )
}
```

**Total: ~35 lines** - Everything auto-generated, always in sync

</details>

**Result:** **130 lines eliminated** (79% reduction), zero sync issues, one source of truth! 🎉

---

### 🚀 Complete Menu-Based Implementation

#### Step 1: Define Your Menu Structure

```typescript
// config/menu.ts
import type { MenuItem } from 'next-buckler'

export const menuConfig: MenuItem[] = [
  // Public routes
  {
    path: '/',
    label: 'Home',
    icon: 'HomeIcon',
    type: 'public'
  },
  {
    path: '/about',
    label: 'About',
    icon: 'InfoIcon',
    type: 'public'
  },
  
  // Private routes with roles
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'DashboardIcon',
    type: 'private',
    roles: ['user', 'editor', 'admin'],
    children: [
      {
        path: '/dashboard/analytics',
        label: 'Analytics',
        icon: 'ChartIcon',
        type: 'private',
        roles: ['editor', 'admin']
      }
    ]
  },
  
  // Admin section
  {
    path: '/admin',
    label: 'Administration',
    icon: 'ShieldIcon',
    type: 'private',
    roles: ['admin'],
    children: [
      {
        path: '/admin/users',
        label: 'User Management',
        icon: 'UsersIcon',
        type: 'private',
        roles: ['admin']
      },
      {
        path: '/admin/settings',
        label: 'Settings',
        icon: 'SettingsIcon',
        type: 'private',
        roles: ['admin']
      }
    ]
  },
  
  // Hybrid route (accessible to all)
  {
    path: '/blog',
    label: 'Blog',
    icon: 'BookIcon',
    type: 'hybrid'  // Both authenticated and non-authenticated users
  }
]
```

#### Step 2: Use in Your App

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { SessionProvider } from 'next-auth/react'
import { 
  Buckler, 
  processMenuItems, 
  groupRoutesByType,
  useBucklerSession
} from 'next-buckler'
import { menuConfig } from '@/config/menu'
import Layout from '@/components/Layout'

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { isAuth, isLoading, userRoles } = useBucklerSession()
  
  // Process menu items - automatically filters based on roles
  const { visibleItems, hiddenItems } = processMenuItems(menuConfig, userRoles, {
    strictMode: process.env.NODE_ENV !== 'production'
  })
  
  // Auto-generate route configuration from menu
  const { privateRoutes, publicRoutes, hybridRoutes, rbacConfig } = groupRoutesByType(
    menuConfig,
    { strictMode: process.env.NODE_ENV !== 'production' }
  )
  
  return (
    <Buckler
      isAuth={isAuth}
      isLoading={isLoading}
      router={router}
      loginRoute="/login"
      defaultRoute="/dashboard"
      privateRoutes={privateRoutes}
      publicRoutes={publicRoutes}
      hybridRoutes={hybridRoutes}
      RBAC={rbacConfig}
      userRoles={userRoles}
      strictMode={process.env.NODE_ENV !== 'production'}
      onUnauthorizedAccess={(info) => {
        console.warn('[Security] Unauthorized access:', info)
      }}
      LoadingComponent={
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
        </div>
      }
    >
      <Layout navigation={visibleItems}>
        <Component {...pageProps} />
      </Layout>
    </Buckler>
  )
}

function MyApp(appProps: AppProps) {
  return (
    <SessionProvider session={appProps.pageProps.session}>
      <App {...appProps} />
    </SessionProvider>
  )
}

export default MyApp
```

#### Step 3: Use the Menu in Your Layout

```typescript
// components/Layout.tsx
import Link from 'next/link'
import { MenuItem } from 'next-buckler'

interface LayoutProps {
  navigation: MenuItem[]
  children: React.ReactNode
}

export default function Layout({ navigation, children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <nav className="bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-4 py-4">
            {navigation.map((item) => (
              <li key={item.path}>
                <Link href={item.path} className="hover:text-blue-400">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Link>
                
                {/* Render nested menu items */}
                {item.children && item.children.length > 0 && (
                  <ul className="ml-4 mt-2">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <Link href={child.path} className="text-sm hover:text-blue-400">
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

---

### 📚 Menu-Based API Reference

#### `MenuItem<TIcon>` Type

```typescript
interface MenuItem<TIcon = any> {
  path: string
  label: string
  icon?: TIcon
  type: 'private' | 'public' | 'hybrid'
  role?: string | null        // Single role (alternative to roles array)
  roles?: string[] | null     // Multiple roles (alternative to role)
  hidden?: boolean | null     // Explicit visibility control
  children?: MenuItem<TIcon>[]
  metadata?: Record<string, any>
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `path` | `string \| null` | ✅ | Route path (supports Next.js dynamic routes, `null` for parent-only items) |
| `label` | `string` | ✅ | Display label for the menu item |
| `icon` | `TIcon` | ❌ | Icon component or identifier (generic type) |
| `type` | `'private' \| 'public' \| 'hybrid'` | ✅ | Route access type |
| `role` | `string \| null` | ❌ | **Single role** - Only this role can access (use `role` OR `roles`, not both) |
| `roles` | `string[] \| null` | ❌ | **Multiple roles** - Any of these roles can access (use `role` OR `roles`, not both) |
| `hidden` | `boolean \| null` | ❌ | Explicit visibility: `true` = hidden, `false` = visible, `null` = force visible |
| `children` | `MenuItem<TIcon>[]` | ❌ | Nested menu items |
| `metadata` | `Record<string, any>` | ❌ | Custom metadata for your app |

**Role Configuration:**

You can use **either** `role` (singular) **or** `roles` (array), depending on your needs:

```typescript
// Option 1: Single role
{
  path: '/admin',
  label: 'Admin Panel',
  type: 'private',
  role: 'admin'  // Only 'admin' role can access
}

// Option 2: Multiple roles (any role grants access)
{
  path: '/dashboard',
  label: 'Dashboard',
  type: 'private',
  roles: ['admin', 'editor', 'viewer']  // Any of these roles can access
}

// Option 3: No role (all authenticated users for private, or public)
{
  path: '/profile',
  label: 'My Profile',
  type: 'private',
  role: null  // All authenticated users can access
}
```

---

#### `processMenuItems()` Function

Process menu structure and apply role-based visibility.

```typescript
function processMenuItems<TIcon = any>(
  items: MenuItem<TIcon>[],
  userRoles?: string[],
  options?: MenuProcessorOptions
): ProcessedMenu<TIcon>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `items` | `MenuItem<TIcon>[]` | Menu structure to process |
| `userRoles` | `string[]` | Current user's roles (undefined for non-authenticated) |
| `options` | `MenuProcessorOptions` | Configuration options |

**Options:**

```typescript
interface MenuProcessorOptions {
  strictMode?: boolean        // Throw errors vs warnings (default: false)
  maxDepth?: number          // Maximum nesting depth (default: 5)
  removeEmptyParents?: boolean  // Remove parents with no visible children (default: false)
}
```

**Returns:**

```typescript
interface ProcessedMenu<TIcon> {
  visibleItems: MenuItem<TIcon>[]  // Items the user can see
  hiddenItems: MenuItem<TIcon>[]   // Items hidden from user
  validationErrors: string[]       // Any validation errors found
}
```

**Example:**

```typescript
const { visibleItems, hiddenItems, validationErrors } = processMenuItems(
  menuConfig,
  ['editor'],
  { strictMode: true, removeEmptyParents: true }
)

if (validationErrors.length > 0) {
  console.error('Menu validation errors:', validationErrors)
}

// Use visibleItems in your navigation
<Navigation items={visibleItems} />
```

---

#### `ValidationResult` Type

Validation result returned by menu processing functions.

```typescript
interface ValidationResult {
  valid: boolean      // Overall validation status
  errors: string[]    // Critical validation errors
  warnings: string[]  // Non-critical warnings
}
```

| Property | Type | Description |
|----------|------|-------------|
| `valid` | `boolean` | `true` if validation passed, `false` if errors found |
| `errors` | `string[]` | Array of critical validation errors |
| `warnings` | `string[]` | Array of non-critical warnings |

**Example:**

```typescript
import { processMenuItems, ValidationResult } from 'next-buckler'

const result = processMenuItems(menuConfig, userRoles, { strictMode: true })

// Check validation results
if (!result.validation.valid) {
  console.error('Menu validation failed:', result.validation.errors)
}

if (result.validation.warnings.length > 0) {
  console.warn('Menu validation warnings:', result.validation.warnings)
}
```

---

#### `groupRoutesByType()` Function

Generate route configuration and RBAC config from menu structure.

```typescript
function groupRoutesByType<TIcon = any>(
  items: MenuItem<TIcon>[],
  options?: { strictMode?: boolean }
): GroupedRoutes
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `items` | `MenuItem<TIcon>[]` | Menu structure to process |
| `options` | `{ strictMode?: boolean }` | Throw errors vs warnings |

**Returns:**

```typescript
interface GroupedRoutes {
  privateRoutes: string[]      // All private routes extracted
  publicRoutes: string[]       // All public routes extracted
  hybridRoutes: string[]       // All hybrid routes extracted
  rbacConfig: RoleAccess       // Auto-generated RBAC configuration
  validationErrors: string[]   // Security validation errors
}
```

**Generated RBAC Config Format:**

```typescript
// For menu with roles: ['admin', 'editor', 'user']
{
  admin: {
    accessRoute: '/admin',           // First route for this role
    grantedRoutes: ['/admin', '/dashboard', ...]
  },
  editor: {
    accessRoute: '/editor',
    grantedRoutes: ['/editor', '/dashboard', ...]
  },
  user: {
    accessRoute: '/dashboard',
    grantedRoutes: ['/dashboard', ...]
  }
}
```

**Security Validations:**

- ✅ Detects duplicate routes across types
- ✅ Validates role references are consistent
- ✅ Prevents private routes from leaking into public
- ✅ Normalizes paths (removes trailing slashes, path traversal)
- ✅ Validates route patterns

**Example:**

```typescript
const { 
  privateRoutes, 
  publicRoutes, 
  rbacConfig, 
  validationErrors 
} = groupRoutesByType(menuConfig, { strictMode: true })

if (validationErrors.length > 0) {
  throw new Error(`Route configuration errors: ${validationErrors.join(', ')}`)
}

// Use in Buckler
<Buckler
  privateRoutes={privateRoutes}
  publicRoutes={publicRoutes}
  RBAC={rbacConfig}
  // ...
/>
```

---

#### `mergeGroupedRoutes()` Function

Merge multiple route configurations (useful for modular apps).

```typescript
function mergeGroupedRoutes(...configs: GroupedRoutes[]): GroupedRoutes
```

**Example:**

```typescript
// Feature 1 routes
const blogRoutes = groupRoutesByType(blogMenuConfig)

// Feature 2 routes
const adminRoutes = groupRoutesByType(adminMenuConfig)

// Merge them
const allRoutes = mergeGroupedRoutes(blogRoutes, adminRoutes)

<Buckler
  privateRoutes={allRoutes.privateRoutes}
  publicRoutes={allRoutes.publicRoutes}
  RBAC={allRoutes.rbacConfig}
  // ...
/>
```

---

### 🔗 NextAuth.js Integration

Next-Buckler provides optional helpers for NextAuth.js integration.

#### `useBucklerSession()` Hook

Wraps NextAuth's `useSession` with Buckler-compatible output.

```typescript
import { useBucklerSession } from 'next-buckler'

function MyComponent() {
  const { isAuth, isLoading, userRoles, session } = useBucklerSession()
  
  // isAuth: boolean
  // isLoading: boolean
  // userRoles: string[] | undefined
  // session: Session | null (original NextAuth session)
  
  return <div>User roles: {userRoles?.join(', ')}</div>
}
```

**Features:**

- ✅ Automatically extracts roles from NextAuth session
- ✅ Handles role prefixes (e.g., `app-role-admin` → `admin`)
- ✅ Provides default `'user'` role for authenticated users without roles
- ✅ Returns `undefined` for non-authenticated users

---

#### `processSessionRoles()` Function

Extract and normalize roles from NextAuth session.

```typescript
import { processSessionRoles } from 'next-buckler'
import { useSession } from 'next-auth/react'

function MyApp() {
  const { data: session } = useSession()
  const userRoles = processSessionRoles(session)
  
  // userRoles: string[] | undefined
}
```

**Handles Multiple Formats:**

```typescript
// Azure AD format
session.user.roles = ['app-role-admin', 'app-role-editor']
// → ['admin', 'editor']

// Simple array
session.user.roles = ['admin', 'user']
// → ['admin', 'user']

// Nested roles
session.accessToken.roles = ['admin']
// → ['admin']

// No session
null
// → undefined

// Authenticated but no roles
session.user = {}
// → ['user'] (default fallback)
```

**Options:**

`processSessionRoles()` accepts an optional `SessionProcessorOptions` parameter:

```typescript
interface SessionProcessorOptions {
  anonymousRole?: string       // Role for unauthenticated users (default: 'anonymous')
  defaultRole?: string         // Role for authenticated users without specific roles (default: 'user')
  rolePrefix?: string          // Prefix for role normalization (e.g., 'app-role-')
  roleFilter?: (role: string) => boolean  // Filter function to validate roles
  minValidRoles?: number       // Minimum valid roles required (default: 1)
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `anonymousRole` | `string` | `'anonymous'` | Role assigned to unauthenticated users |
| `defaultRole` | `string` | `'user'` | Fallback role for authenticated users without specific roles |
| `rolePrefix` | `string` | `''` | Prefix for role normalization (e.g., `'app-role-'` → `'admin'` becomes `'app-role-admin'`) |
| `roleFilter` | `function` | `() => true` | Filter function to validate roles before processing |
| `minValidRoles` | `number` | `1` | If user has fewer valid roles, `defaultRole` is used |

**Example with Options:**

```typescript
import { processSessionRoles } from 'next-buckler'

const userRoles = processSessionRoles(session, {
  rolePrefix: 'app-role-',
  roleFilter: (role) => role.startsWith('app-role-'),
  defaultRole: 'viewer',
  minValidRoles: 1
})

// Session with roles: ['app-role-admin', 'app-role-editor']
// → ['app-role-admin', 'app-role-editor']

// Session with invalid roles: ['guest', 'temp']
// → ['viewer'] (fallback to defaultRole)
```

---

#### `createRoleHandler()` Function

Create custom role validation logic with priority rules.

```typescript
import { createRoleHandler } from 'next-buckler'

const roleHandler = createRoleHandler({
  roleOrder: ['super-admin', 'admin', 'editor', 'user'],
  fallbackRole: 'guest',
  filterRoles: (roles) => roles.filter(r => r.startsWith('app-')),
})

const { data: session } = useSession()
const userRoles = roleHandler(session)
```

**Options:**

```typescript
interface RoleHandlerOptions {
  roleOrder?: string[]                          // Priority order for roles
  fallbackRole?: string                         // Default when no roles found
  filterRoles?: (roles: string[]) => string[]  // Custom role filtering
}
```

---

### 🎓 Advanced Patterns

#### Pattern 1: Multi-Module Configuration

```typescript
// modules/admin/menu.ts
export const adminMenu: MenuItem[] = [
  { path: '/admin', label: 'Admin', type: 'private', roles: ['admin'] }
]

// modules/blog/menu.ts
export const blogMenu: MenuItem[] = [
  { path: '/blog', label: 'Blog', type: 'hybrid' }
]

// config/menu.ts
import { adminMenu } from '@/modules/admin/menu'
import { blogMenu } from '@/modules/blog/menu'
import { mergeGroupedRoutes, groupRoutesByType } from 'next-buckler'

const adminConfig = groupRoutesByType(adminMenu)
const blogConfig = groupRoutesByType(blogMenu)

export const appConfig = mergeGroupedRoutes(adminConfig, blogConfig)
```

#### Pattern 2: Conditional Menu Items

```typescript
// config/menu.ts
export function getMenuConfig(features: FeatureFlags): MenuItem[] {
  const baseMenu: MenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', type: 'private', roles: ['user'] }
  ]
  
  if (features.enableAdmin) {
    baseMenu.push({
      path: '/admin',
      label: 'Admin',
      type: 'private',
      roles: ['admin']
    })
  }
  
  return baseMenu
}

// pages/_app.tsx
const menuConfig = getMenuConfig(featureFlags)
const { privateRoutes, rbacConfig } = groupRoutesByType(menuConfig)
```

#### Pattern 3: Icon Type Safety

```typescript
// Use with your icon library
import { Home, Settings, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const menuConfig: MenuItem<LucideIcon>[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: Home,  // ✅ Type-safe
    type: 'private',
    roles: ['user']
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,  // ✅ Type-safe
    type: 'private',
    roles: ['user']
  }
]

// In your component
{navigation.map(item => {
  const Icon = item.icon
  return <Icon key={item.path} />  // ✅ Fully typed
})}
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

## 🔧 Advanced Utilities

Next-Buckler exports powerful internal utilities for advanced use cases.

### `verifyPath()` - Path Validation & Security

Validates and normalizes paths with security checks.

```typescript
import { verifyPath } from 'next-buckler'

const result = verifyPath('/users/[id]', '/users/123', ['user'])

// Returns:
{
  valid: boolean,        // true if path matches route pattern
  normalizedPath: string, // Normalized path (removes .., //, etc.)
  isDynamic: boolean,    // true if route has dynamic segments
  matched: boolean       // true if path matches the route
}
```

**Security Features:**

```typescript
// Path traversal prevention
verifyPath('/admin', '/public/../admin', [])
// → { valid: true, normalizedPath: '/admin', ... }

// Double slash normalization
verifyPath('/admin', '//admin', [])
// → { valid: true, normalizedPath: '/admin', ... }

// Current directory removal
verifyPath('/admin', '/./admin', [])
// → { valid: true, normalizedPath: '/admin', ... }
```

**Dynamic Route Matching:**

```typescript
// Exact matching for security
verifyPath('/users/[id]', '/users/123', [])
// → { valid: true, matched: true, isDynamic: true }

verifyPath('/users/[id]', '/users/123/admin', [])
// → { valid: false, matched: false } // Prevents bypass!

// Catch-all routes
verifyPath('/blog/[...slug]', '/blog/a/b/c', [])
// → { valid: true, matched: true }

// Optional catch-all
verifyPath('/shop/[[...slug]]', '/shop', [])
// → { valid: true, matched: true }
```

**Use Cases:**

- Custom route protection logic
- API route validation
- Middleware path checking
- Custom redirect logic

---

### `isDynamicRoute()` - Route Pattern Detection

Check if a route contains dynamic segments.

```typescript
import { isDynamicRoute } from 'next-buckler'

isDynamicRoute('/users/[id]')          // → true
isDynamicRoute('/posts/[...slug]')     // → true
isDynamicRoute('/shop/[[...slug]]')    // → true
isDynamicRoute('/dashboard')           // → false

// Use case: Different handling for dynamic routes
const routes = ['/users/[id]', '/dashboard', '/posts/[slug]']
const dynamicRoutes = routes.filter(isDynamicRoute)
const staticRoutes = routes.filter(r => !isDynamicRoute(r))
```

---

### `getAccessRoute()` - Determine User's Access Route

Get the appropriate route for a user based on their roles.

```typescript
import { getAccessRoute } from 'next-buckler'

const RBAC = {
  admin: {
    accessRoute: '/admin',
    grantedRoutes: ['/admin', '/dashboard']
  },
  user: {
    accessRoute: '/dashboard',
    grantedRoutes: ['/dashboard']
  }
}

// User with admin role
getAccessRoute(['admin', 'user'], RBAC, '/dashboard')
// → '/admin' (first matching role's accessRoute)

// User with only user role
getAccessRoute(['user'], RBAC, '/dashboard')
// → '/dashboard'

// User with no matching roles
getAccessRoute(['guest'], RBAC, '/dashboard')
// → '/dashboard' (fallback)

// No authenticated user
getAccessRoute(undefined, RBAC, '/home')
// → '/home' (fallback)
```

**Use Cases:**

- Custom login redirect logic
- Multi-tenant applications
- Role-based dashboard routing
- Post-authentication navigation

---

### `getGrantedRoutes()` - Calculate User Permissions

Get all routes a user can access based on their roles.

```typescript
import { getGrantedRoutes } from 'next-buckler'

const RBAC = {
  admin: {
    grantedRoutes: ['/admin', '/users', '/dashboard']
  },
  editor: {
    grantedRoutes: ['/editor', '/dashboard']
  }
}

// User with multiple roles gets union of all permissions
const routes = getGrantedRoutes(['admin', 'editor'], RBAC)
// → ['/admin', '/users', '/dashboard', '/editor']

// Duplicates are automatically removed
const routes2 = getGrantedRoutes(['user'], {
  user: { grantedRoutes: ['/dashboard', '/profile', '/dashboard'] }
})
// → ['/dashboard', '/profile']

// Invalid roles trigger warnings in development
const routes3 = getGrantedRoutes(['invalid-role'], RBAC, true)
// ⚠️  Logs: "[Buckler Security Warning] Role 'invalid-role' not found"
// → [] (empty array)
```

**Parameters:**

```typescript
function getGrantedRoutes(
  userRoles: string[] | undefined,
  RBAC: RoleAccess,
  throwOnError?: boolean  // strictMode (default: false)
): string[]
```

**Use Cases:**

- Check if user can access a specific route
- Generate dynamic navigation based on permissions
- Implement custom authorization logic
- Build permission-aware UI components

**Example: Custom Authorization Check**

```typescript
import { getGrantedRoutes } from 'next-buckler'

function useAuthorization() {
  const { user } = useAuth()
  const grantedRoutes = getGrantedRoutes(user?.roles, RBAC_CONFIG)
  
  const canAccess = (path: string) => {
    return grantedRoutes.some(route => {
      // Handle dynamic routes
      if (route.includes('[')) {
        const pattern = route.replace(/\[.*?\]/g, '[^/]+')
        return new RegExp(`^${pattern}$`).test(path)
      }
      return route === path
    })
  }
  
  return { canAccess, grantedRoutes }
}

// In your component
function AdminButton() {
  const { canAccess } = useAuthorization()
  
  if (!canAccess('/admin')) {
    return null
  }
  
  return <Link href="/admin">Go to Admin</Link>
}
```

---

### 🛠️ Complete Advanced Example

Combining all utilities for a custom authorization system:

```typescript
// lib/auth/permissions.ts
import {
  verifyPath,
  isDynamicRoute,
  getAccessRoute,
  getGrantedRoutes
} from 'next-buckler'
import { RBAC_CONFIG } from '@/config/rbac'

export class PermissionManager {
  constructor(private userRoles: string[] | undefined) {}
  
  /**
   * Check if user can access a specific path
   */
  canAccess(path: string): boolean {
    const grantedRoutes = getGrantedRoutes(this.userRoles, RBAC_CONFIG)
    
    return grantedRoutes.some(route => {
      const { matched } = verifyPath(route, path, this.userRoles || [])
      return matched
    })
  }
  
  /**
   * Get user's default landing page
   */
  getDefaultRoute(fallback: string = '/dashboard'): string {
    return getAccessRoute(this.userRoles, RBAC_CONFIG, fallback)
  }
  
  /**
   * Get all accessible routes for UI generation
   */
  getAccessibleRoutes(): string[] {
    return getGrantedRoutes(this.userRoles, RBAC_CONFIG)
  }
  
  /**
   * Filter menu items based on user permissions
   */
  filterMenuItems<T extends { path: string }>(items: T[]): T[] {
    return items.filter(item => this.canAccess(item.path))
  }
  
  /**
   * Check if user has any of the required roles
   */
  hasRole(...roles: string[]): boolean {
    if (!this.userRoles) return false
    return roles.some(role => this.userRoles!.includes(role))
  }
  
  /**
   * Get role priority (useful for UI display)
   */
  getPrimaryRole(): string | undefined {
    const roleOrder = ['super-admin', 'admin', 'editor', 'user']
    return roleOrder.find(role => this.userRoles?.includes(role))
  }
}

// Usage in components
import { useAuth } from '@/hooks/useAuth'
import { PermissionManager } from '@/lib/auth/permissions'

export function usePermissions() {
  const { user } = useAuth()
  const permissions = new PermissionManager(user?.roles)
  
  return permissions
}

// In your component
function FeatureComponent() {
  const permissions = usePermissions()
  
  if (!permissions.canAccess('/premium-feature')) {
    return <UpgradePrompt />
  }
  
  return <PremiumFeature />
}
```

---

### 📊 Performance Considerations

All utilities are optimized for production use:

```typescript
// ✅ Route validation results are cached
verifyPath('/users/[id]', '/users/123', [])  // Computed
verifyPath('/users/[id]', '/users/456', [])  // Uses cached regex

// ✅ Granted routes are calculated once per role set
const granted1 = getGrantedRoutes(['admin'], RBAC)
const granted2 = getGrantedRoutes(['admin'], RBAC)  // Same result

// ✅ Use memoization for expensive operations
import { useMemo } from 'react'

function MyComponent() {
  const { userRoles } = useAuth()
  
  const grantedRoutes = useMemo(
    () => getGrantedRoutes(userRoles, RBAC_CONFIG),
    [userRoles]
  )
  
  // grantedRoutes only recalculated when userRoles changes
}
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

### Development

```bash
# Clone the repository
git clone https://github.com/esaud17/next-buckler.git

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Check bundle size
npm run size
```

---

## 📊 Project Stats

- **Bundle Size**: ~4KB (CJS) / ~4KB (ESM) - Well under 25KB limit ✅
- **Test Coverage**: 70+ tests across 6 suites ✅
- **TypeScript**: 100% type-safe ✅
- **Dependencies**: Zero runtime dependencies ✅
- **Tree-Shakeable**: Import only what you need ✅

---

## 🙏 Motivation & Credits

After countless hours writing the same authentication boilerplate across projects, **Next-Buckler** was born from the frustration of:

- Copying auth logic between projects
- Managing complex redirect flows
- Preventing flash of unauthorized content
- Handling role-based permissions manually
- Writing repetitive `useEffect` hooks for route protection
- Keeping menu configurations in sync with route permissions

**Next-Buckler** solves all of this in a single, elegant solution. With v1.2.6's menu-based configuration, you can now eliminate an additional 150-200 lines of boilerplate per project.

### 💙 Credits

This library was inspired by **[NextShield](https://github.com/imjulianeral/next-shield)** (2021), built with 💙 by [@imjulianeral](https://github.com/imjulianeral).

**Next-Buckler** extends and enhances these foundational ideas with menu-based RBAC configuration, advanced security features, framework integrations, and modern Next.js patterns.

**Thank you, Julián!** 🙌

---

## 🔗 Useful Links

- **📦 npm Package**: [next-buckler](https://www.npmjs.com/package/next-buckler)
- **🐙 GitHub Repository**: [esaud/next-buckler](https://github.com/esaud17/next-buckler)
- **📝 Changelog**: [CHANGELOG.md](./CHANGELOG.md)
- **🐛 Report Issues**: [GitHub Issues](https://github.com/esaud17/next-buckler/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/esaud17/next-buckler/discussions)

---

## 📄 License

MIT © [esaud.rivera](https://github.com/esaud17)

---

## 🌟 Show Your Support

If **Next-Buckler** saves you time and makes your Next.js projects more secure:

- ⭐ **Star this repo** on GitHub
- 🐦 **Share it** with the Next.js community
- 💬 **Tell us** how you're using it
- 🤝 **Contribute** improvements or new features

Every star motivates continued development! 🚀

---

<p align="center">
  <strong>Made with ❤️ for the Next.js community</strong>
</p>

<p align="center">
  <sub>Built by developers, for developers</sub>
</p>

---

<p align="center">
  <strong>🔒 Secure your Next.js app the easy way with Next-Buckler 🛡️</strong>
</p>
