import { RoleAccess } from '../types/common/role-access'

/**
 * Gets the access route for the user based on their roles
 * @param strictMode - When true, logs warnings for missing roles in development (never blocks users)
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
      // Check if role exists in RBAC
      if (RBAC[role] && RBAC[role].hasOwnProperty('accessRoute')) {
        return RBAC[role].accessRoute
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
  return defaultAccessRoute
}
