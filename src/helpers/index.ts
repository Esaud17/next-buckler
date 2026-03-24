/**
 * Next-Buckler Helpers
 * Framework-agnostic utilities for menu-based RBAC configuration
 * 
 * @example
 * ```ts
 * import { groupRoutesByType, processMenuItems } from 'next-buckler/helpers'
 * 
 * const config = groupRoutesByType(menuConfig)
 * const processed = processMenuItems(menuConfig, userRoles)
 * ```
 */

export { processMenuItems } from './menu-processor'
export { groupRoutesByType, mergeGroupedRoutes } from './route-grouper'
export type {
  MenuItem,
  RouteType,
  GroupedRoutes,
  MenuProcessorOptions,
  ValidationResult,
  ProcessedMenu,
} from './types'
