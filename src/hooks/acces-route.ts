import { RoleAccess } from "../types/common/role-access"

export function getAccessRoute(
  RBAC: RoleAccess<string[]> | undefined,
  userRole: string[] | undefined,
  accessRoute?: string | undefined,
  defaultAccessRoute?: string | undefined
) {
  if (typeof accessRoute !== 'undefined') return accessRoute

  if (RBAC && userRole) {
    for (const role of userRole) {
      if (RBAC[role] && RBAC[role].hasOwnProperty('accessRoute')) {
        return RBAC[role].accessRoute
      }
    }
  }
  return defaultAccessRoute
}
