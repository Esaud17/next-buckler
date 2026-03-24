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

  // RBAC mode: check if user has the required role
  if (RBAC && showForRole) {
    const hasRole = userRoles?.includes(showForRole) ?? false
    return <>{hasRole ? children : fallback}</>
  }

  // Simple conditional rendering
  if (showIf) return <>{children}</>

  return <>{fallback}</>
}
