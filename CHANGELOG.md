# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-03-24

### 🎉 Major Features

#### Menu-Based Configuration System
- **Added** `processMenuItems()` function to process navigation menus with role-based visibility
- **Added** `groupRoutesByType()` function to auto-generate RBAC configuration from menu structure
- **Added** `mergeGroupedRoutes()` function to combine multiple route configurations
- **Added** `MenuItem` TypeScript type for defining menu structures
- **Added** Security validations: circular dependency detection, duplicate route detection, route leakage prevention
- **Reduced** boilerplate by ~150-200 lines per project (79% reduction)

#### NextAuth.js Integration (Optional)
- **Added** `useBucklerSession()` hook for seamless NextAuth integration
- **Added** `processSessionRoles()` function to extract and normalize roles from NextAuth sessions
- **Added** `createRoleHandler()` factory for custom role validation logic
- **Added** Support for role prefixes (e.g., `app-role-admin` → `admin`)
- **Added** Tree-shakeable exports - integrations don't bloat your bundle

#### Advanced Utilities Export
- **Exported** `verifyPath()` - Path validation with security checks
- **Exported** `isDynamicRoute()` - Dynamic route pattern detection
- **Exported** `getAccessRoute()` - Determine user's access route based on roles
- **Exported** `getGrantedRoutes()` - Calculate user permissions from RBAC config
- **Enabled** Custom authorization implementations using internal utilities

### ✨ Enhancements

- **Improved** Path normalization with enhanced security checks
- **Improved** Type definitions with generic support for icon types
- **Improved** Documentation with comprehensive examples and API reference
- **Improved** Error messages in strict mode for better debugging
- **Added** `strictMode` option to helper functions
- **Added** `maxDepth` option to prevent excessive nesting
- **Added** `removeEmptyParents` option to clean up processed menus
- **Added** Validation error reporting in all helper functions

### 🧪 Testing

- **Added** 32 new unit tests across 3 test suites
  - `test/menuProcessor.spec.tsx` - 8 tests for menu processing
  - `test/routeGrouper.spec.tsx` - 9 tests for route grouping
  - `test/nextAuthIntegration.spec.tsx` - 15 tests for NextAuth integration
- **Maintained** 100% pass rate across all 70 tests

### 📚 Documentation

- **Added** Complete menu-based configuration guide
- **Added** Before/After comparison showing 79% code reduction
- **Added** NextAuth integration examples
- **Added** Advanced utilities documentation with examples
- **Added** Complete API reference for all new exports
- **Added** Advanced patterns section
- **Added** Performance considerations guide
- **Updated** README with navigation links and better structure

### 🔧 Internal Changes

- **Refactored** `src/hooks/` → `src/utils/` for better semantics
- **Created** `src/helpers/` directory for menu-based utilities
- **Created** `src/integrations/` directory for framework integrations
- **Updated** `src/index.ts` with comprehensive exports (3 → 16 exports + 8 type exports)
- **Maintained** Zero runtime dependencies
- **Maintained** Bundle size under 25KB limit (currently ~4KB)

### 🛡️ Security

- **Added** Circular dependency detection in menu structures
- **Added** Duplicate route detection across types
- **Added** Route leakage prevention (private routes in public)
- **Added** Path traversal attack prevention in all utilities
- **Enhanced** Path normalization with edge case handling
- **Added** Validation warnings/errors based on strictMode

### ⚠️ Breaking Changes

**None** - This release is fully backward compatible with v1.1.x

All existing code continues to work without modifications. New features are opt-in.

### 📦 Migration Guide

No migration needed! To use new features:

```typescript
// Before: Manual configuration (~165 lines)
const RBAC_CONFIG = { /* manual config */ }
const PRIVATE_ROUTES = [/* manual list */]
const visibleMenu = processMenuItems(/* custom helper */)

// After: Menu-based configuration (~35 lines)
import { processMenuItems, groupRoutesByType } from 'next-buckler'
const { visibleItems } = processMenuItems(menuConfig, userRoles)
const { privateRoutes, rbacConfig } = groupRoutesByType(menuConfig)
```

See [README.md](./README.md#-menu-based-configuration-new-in-v120) for complete examples.

---

## [1.1.5] - 2024-XX-XX

### Features

- Core authentication and authorization functionality
- `Buckler` component for route protection
- `BucklerGuard` component for conditional rendering
- RBAC support with multiple roles
- Dynamic route support (Next.js patterns)
- Hybrid routes support
- Path traversal protection
- Automatic memoization and caching
- TypeScript support with strict typing
- Zero dependencies

---

## Links

- [GitHub Repository](https://github.com/esaud/next-buckler)
- [npm Package](https://www.npmjs.com/package/next-buckler)
- [Documentation](./README.md)
