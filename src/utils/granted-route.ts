import { RoleAccess } from '../types/common/role-access'

/**
 * Gets all routes the user has access to based on their roles
 * Validates roles and optimizes route collection
 */
export function getGrantedRoutes(
  RBAC: RoleAccess<string[]> | undefined,
  userRoles: string[] | undefined,
  accessRoute?: string | undefined,
  strictMode?: boolean
) {
  const grantedRoutesSet = new Set<string>()
  
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
      
      if (RBAC[role]?.hasOwnProperty('grantedRoutes')) {
        // Use Set to avoid duplicates and improve performance
        RBAC[role].grantedRoutes.forEach(route => grantedRoutesSet.add(route))
      }
    }
  }

  // Add accessRoute if provided
  if (accessRoute) {
    grantedRoutesSet.add(accessRoute)
  }
  
  return Array.from(grantedRoutesSet)
}
