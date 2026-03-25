import { RoleAccess } from '../types/common/role-access'

/**
 * Gets all routes the user has access to based on their roles
 * @param strictMode - When true, logs warnings for missing roles in development (never blocks users)
 */
export function getGrantedRoutes(
  RBAC: RoleAccess<string[]> | undefined,
  userRoles: string[] | undefined,
  accessRoute?: string | undefined,
  strictMode?: boolean
) {
  let grantedRoutes: string[] = []
  
  if (RBAC && userRoles) {
    for (const role of userRoles) {
      // Check if role exists and has granted routes
      if (RBAC.hasOwnProperty(role) && RBAC[role].hasOwnProperty('grantedRoutes')) {
        grantedRoutes = grantedRoutes.concat(RBAC[role].grantedRoutes)
      }
      
      // Optional validation: warn in development if role not found
      // NEVER blocks - just informational
      if (strictMode && !RBAC.hasOwnProperty(role) && process.env.NODE_ENV === 'development') {
        console.warn(
          `[Buckler] Role "${role}" not found in RBAC configuration.`,
          `Available roles: ${Object.keys(RBAC).join(', ')}`
        )
      }
    }
  }

  if (accessRoute && !grantedRoutes.includes(accessRoute)) {
    grantedRoutes.push(accessRoute)
  }
  
  return grantedRoutes
}
