import { ReactNode } from 'react'
import { HOC } from '../common/hoc'

export type AuthProps = HOC & {
  RBAC?: never
  showIf: boolean
  fallback?: ReactNode
}
