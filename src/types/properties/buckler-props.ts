import type { ReactNode } from "react";
import type { NextRouter } from 'next/router'
import { RoleAccess } from "../common/role-access";

/**
 * Information about unauthorized access attempts
 * Passed to onUnauthorizedAccess callback
 */
export type UnauthorizedAccessInfo = {
  /** The path that was attempted */
  path: string
  /** The user's current roles (if any) */
  userRoles: string[] | undefined
  /** When the attempt occurred */
  timestamp: Date
  /** Reason for denial */
  reason: 'not_authenticated' | 'insufficient_permissions' | 'invalid_route'
}

export type BucklerProps<
  PrivateRoutesList extends string[],
  PublicRoutesList extends string[]
> = {
 
  isAuth: boolean
  
  isLoading: boolean
  
  router: NextRouter
  
  loginRoute: PublicRoutesList[number]
  
  accessRoute: PrivateRoutesList[number]

  defaultRoute: PublicRoutesList[number]
  
  privateRoutes: PrivateRoutesList
  
  publicRoutes: PublicRoutesList
  
  hybridRoutes?: string[]
  
  LoadingComponent: ReactNode

  RBAC?: never
  
  userRoles?: never

  /**
   * When true, logs warnings in development for RBAC configuration issues
   * Never blocks users - only informational
   * @default false
   */
  strictMode?: boolean

  /**
   * Optional callback invoked when user attempts to access unauthorized route
   * Useful for logging, analytics, or security monitoring
   */
  onUnauthorizedAccess?: (info: UnauthorizedAccessInfo) => void
} | {
  
  isAuth: boolean
  
  isLoading: boolean
  
  router: NextRouter
  
  loginRoute: PublicRoutesList[number]
 
  accessRoute?: never

  defaultRoute: string
  
  privateRoutes: PrivateRoutesList
  
  publicRoutes: PublicRoutesList
  
  hybridRoutes?: string[]
  
  LoadingComponent: ReactNode

  RBAC: RoleAccess<PrivateRoutesList[number][]>
  
  userRoles: string[] | undefined

  /**
   * When true, logs warnings in development for RBAC configuration issues
   * Never blocks users - only informational
   * @default false
   */
  strictMode?: boolean

  /**
   * Optional callback invoked when user attempts to access unauthorized route
   * Useful for logging, analytics, or security monitoring
   */
  onUnauthorizedAccess?: (info: UnauthorizedAccessInfo) => void
}
