import { ReactNode } from 'react'
import { HOC } from '../common/hoc'

export type RBACProps = HOC & {
  RBAC: true
  showForRole: string
  userRoles: string[] | undefined
}
