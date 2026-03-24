import { RoleAccess } from '../types/common/role-access'

/**
 * Gets the access route for the user based on their roles
 * Validates that roles exist in RBAC configuration
 */
export function getAccessRoute(
  RBAC: RoleAccess<string[]> | undefined,
  userRoles: string[] | undefined,
  accessRoute?: string | undefined,
  defaultAccessRoute?: string | undefined,
  strictMode?: boolean
) {
  if (typeof accessRoute !== 'undefined') return accessRoute

  if (RBAC && userRoles) {
    for (const role of userRoles) {
      // Validate role exists in RBAC configuration
      if (!RBAC.hasOwnProperty(role)) {
        const errorMsg = 
          `[Buckler Security Warning] Role "${role}" not found in RBAC configuration. ` +
          `Available roles: ${Object.keys(RBAC).join(', ')}`
        
        if (strictMode) {
          throw new Error(errorMsg)
        } else if (process.env.NODE_ENV === 'development') {
          console.warn(errorMsg)
        }
        continue
      }
      
      if (RBAC[role] && RBAC[role].hasOwnProperty('accessRoute')) {
        return RBAC[role].accessRoute
      }
    }
  }
  return defaultAccessRoute
}
