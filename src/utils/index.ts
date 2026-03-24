/**
 * Next-Buckler Utilities
 * Internal utilities exposed for advanced use cases
 * 
 * @example
 * ```ts
 * import { verifyPath, isDynamicRoute } from 'next-buckler/utils'
 * 
 * const isProtected = verifyPath(['/admin', '/admin/[id]'], '/admin/123') // true
 * const isDynamic = isDynamicRoute('/users/[id]') // true
 * ```
 */

export { verifyPath } from './verify-path'
export { isDynamicRoute } from './dynamic-route'
export { getAccessRoute } from './acces-route'
export { getGrantedRoutes } from './granted-route'
