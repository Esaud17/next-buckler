// Core Components
export { BucklerGuard } from './guard/buckler-guard'
export { BucklerStrategy as Buckler } from './guard/buckler-strategy'

// Types
export { BucklerProps, UnauthorizedAccessInfo } from './types/properties/buckler-props'
export type { RoleAccess } from './types/common/role-access'

// Helpers (Framework-agnostic menu utilities)
export {
  processMenuItems,
  groupRoutesByType,
  mergeGroupedRoutes,
} from './helpers'

export type {
  MenuItem,
  RouteType,
  GroupedRoutes,
  MenuProcessorOptions,
  ValidationResult,
  ProcessedMenu,
} from './helpers'

// Utilities (Advanced use cases)
export {
  verifyPath,
  isDynamicRoute,
  getAccessRoute,
  getGrantedRoutes,
} from './utils'

// Integrations (Optional, tree-shakeable)
export {
  processSessionRoles,
  useBucklerSession,
  createRoleHandler,
} from './integrations/next-auth'

export type {
  BucklerSession,
  SessionProcessorOptions,
} from './integrations/next-auth'

