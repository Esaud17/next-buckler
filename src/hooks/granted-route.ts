import { RoleAccess } from "../types/common/role-access"

export function getGrantedRoutes(
  RBAC: RoleAccess<string[]> | undefined,
  userRole: string[] | undefined,
  accessRoute?: string | undefined
) {
  let grantedRoutes: string[] = []
  if (RBAC && userRole) {
    for (const role of userRole) {
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
