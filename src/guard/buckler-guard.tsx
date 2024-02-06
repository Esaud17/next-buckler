import React from 'react'
import { BaseProps } from '../types/properties/base-props'
import { AuthProps } from '../types/properties/auth-props'
import { RBACProps } from '../types/properties/rbac-props'
import { SingleProps } from '../types/properties/single-props'

export function BucklerGuard(props: BaseProps): JSX.Element
export function BucklerGuard(props: AuthProps): JSX.Element
export function BucklerGuard(props: RBACProps): JSX.Element

export function BucklerGuard(props: SingleProps) {
  const { showForRole, showIf, fallback = null, RBAC, userRoles, children } = props

  if (RBAC) return <>{showForRole === userRoles ? children : null}</>
  if (showIf) return <>{children}</>

  return <>{fallback}</>
}
