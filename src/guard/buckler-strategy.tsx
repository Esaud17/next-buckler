import React, { ReactNode, useEffect, useMemo, useRef } from 'react'
import { verifyPath } from '../hooks/verify-path'
import { getAccessRoute } from '../hooks/acces-route'
import { getGrantedRoutes } from '../hooks/granted-route'
import { BucklerProps, UnauthorizedAccessInfo } from '../types/properties/buckler-props'

export function BucklerStrategy<
  PrivateRoutesList extends string[],
  PublicRoutesList extends string[]
>({
  isAuth,
  isLoading,
  router: { pathname, replace },
  loginRoute,
  accessRoute,
  defaultRoute,
  privateRoutes,
  publicRoutes,
  hybridRoutes,
  LoadingComponent,
  RBAC,
  userRoles,
  strictMode = false,
  onUnauthorizedAccess,
  children,
}: BucklerProps<PrivateRoutesList, PublicRoutesList> & { children: ReactNode }) {
  let view = <>{children}</>
  
  // Track previous path to avoid duplicate callbacks
  const prevPathRef = useRef<string>()

  // Memoize path verification calculations (performance optimization)
  const pathIsPrivate = useMemo(
    () => verifyPath(privateRoutes, pathname),
    [privateRoutes, pathname]
  )
  
  const pathIsPublic = useMemo(
    () => verifyPath(publicRoutes, pathname),
    [publicRoutes, pathname]
  )
  
  const pathIsHybrid = useMemo(
    () => verifyPath(hybridRoutes, pathname),
    [hybridRoutes, pathname]
  )

  // Memoize access route and granted routes calculations
  const access = useMemo(
    () => getAccessRoute(RBAC, userRoles, accessRoute, defaultRoute, strictMode),
    [RBAC, userRoles, accessRoute, defaultRoute, strictMode]
  )
  
  const grantedRoutes = useMemo(
    () => getGrantedRoutes(RBAC, userRoles, access, strictMode),
    [RBAC, userRoles, access, strictMode]
  )
  
  const pathIsAuthorized = useMemo(
    () => RBAC && userRoles && verifyPath(grantedRoutes, pathname),
    [RBAC, userRoles, grantedRoutes, pathname]
  )

  // Helper function to invoke unauthorized access callback
  const notifyUnauthorizedAccess = (reason: UnauthorizedAccessInfo['reason']) => {
    if (onUnauthorizedAccess && prevPathRef.current !== pathname) {
      const info: UnauthorizedAccessInfo = {
        path: pathname,
        userRoles,
        timestamp: new Date(),
        reason,
      }
      onUnauthorizedAccess(info)
      prevPathRef.current = pathname
    }
  }

  useEffect(() => {
    // Not authenticated trying to access private route
    if (!isAuth && !isLoading && pathIsPrivate) {
      notifyUnauthorizedAccess('not_authenticated')
      replace(loginRoute)
    }
    
    // Authenticated user on public route (redirect to their access route)
    if (isAuth && !isLoading && pathIsPublic) {
      replace(access || defaultRoute)
    }
    
    // Authenticated but insufficient permissions
    if (isAuth && userRoles && !isLoading && !pathIsHybrid && !pathIsAuthorized) {
      notifyUnauthorizedAccess('insufficient_permissions')
      replace(access || '/')
    }
  }, [
    isAuth,
    isLoading,
    pathIsPrivate,
    pathIsPublic,
    pathIsHybrid,
    pathIsAuthorized,
    loginRoute,
    access,
    defaultRoute,
    pathname,
    userRoles,
    replace,
  ])

  const loadingPathPrivate = (isLoading || !isAuth) && pathIsPrivate
  const loadingPathPublic = (isLoading || isAuth) && pathIsPublic
  const loadingPathAuthHybrid =
    (isLoading || userRoles) && !pathIsAuthorized && !pathIsHybrid
  const loadingPathHybrid = isLoading && pathIsHybrid

  if (
    loadingPathPrivate ||
    loadingPathPublic ||
    loadingPathAuthHybrid ||
    loadingPathHybrid
  ) {
    view = <>{LoadingComponent}</>
  }

  return view
}
