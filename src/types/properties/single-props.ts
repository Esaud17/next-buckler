import { ReactNode } from 'react'
import { HOC } from '../common/hoc'

export type SingleProps = HOC & {
  RBAC?: boolean
  userRoles?: string[] |undefined
  showForRole?: string
  showIf?: boolean
  fallback?: ReactNode
}
