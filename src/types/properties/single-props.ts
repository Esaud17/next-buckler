import { ReactNode } from 'react'
import { HOC } from '../common/hoc'

export type SingleProps = HOC & {
  RBAC?: boolean
  userRole?: string[] |undefined
  showForRole?: string
  showIf?: boolean
  fallback?: ReactNode
}
