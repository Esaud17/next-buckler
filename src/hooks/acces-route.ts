import { RoleAccess } from '../types/common/role-access'

export function getAccessRoute(
  RBAC: RoleAccess<string[]> | undefined,
  userRoles: string[] | undefined,
  accessRoute?: string | undefined,
  defaultAccessRoute?: string | undefined
) {
  if (typeof accessRoute !== 'undefined') return accessRoute

  if (RBAC && userRoles) {
    for (const role of userRoles) {
      if (RBAC[role] && RBAC[role].hasOwnProperty('accessRoute')) {
        return RBAC[role].accessRoute
      }
    }
  }
  return defaultAccessRoute
}
