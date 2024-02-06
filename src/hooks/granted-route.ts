import { RoleAccess } from '../types/common/role-access'

export function getGrantedRoutes(
  RBAC: RoleAccess<string[]> | undefined,
  userRoles: string[] | undefined,
  accessRoute?: string | undefined
) {
  let grantedRoutes: string[] = []
  if (RBAC && userRoles) {
    for (const role of userRoles) {
      if (RBAC.hasOwnProperty(role) && RBAC[role].hasOwnProperty('grantedRoutes')) {
        grantedRoutes = grantedRoutes.concat(RBAC[role].grantedRoutes)
      }
    }
  }

  if (accessRoute) {
    if (!grantedRoutes.includes(accessRoute)) {
      grantedRoutes.push(accessRoute)
    }
  }
  return grantedRoutes
}
