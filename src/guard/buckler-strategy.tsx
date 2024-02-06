import React, { ReactNode, useEffect } from 'react'
import { verifyPath } from '../hooks/verify-path'
import { getAccessRoute } from '../hooks/acces-route'
import { getGrantedRoutes } from '../hooks/granted-route'
import { BucklerProps } from '../types/properties/buckler-props'


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
         children,
       }: BucklerProps<PrivateRoutesList, PublicRoutesList> & { children: ReactNode }) {
         let view = <>{children}</>

         const pathIsPrivate = verifyPath(privateRoutes, pathname)
         const pathIsPublic = verifyPath(publicRoutes, pathname)
         const pathIsHybrid = verifyPath(hybridRoutes, pathname)

         const access = getAccessRoute(RBAC, userRoles, accessRoute, defaultRoute)
         const grantedRoutes = getGrantedRoutes(RBAC, userRoles, access)
         const pathIsAuthorized = RBAC && userRoles && verifyPath(grantedRoutes, pathname)

         useEffect(() => {
           if (!isAuth && !isLoading && pathIsPrivate) replace(loginRoute)
           if (isAuth && !isLoading && pathIsPublic) replace(access || defaultRoute)
           if (isAuth && userRoles && !isLoading && !pathIsHybrid && !pathIsAuthorized)
             replace(access || '/')
         }, [
           replace,
           userRoles,
           access,
           isAuth,
           isLoading,
           loginRoute,
           pathIsPrivate,
           pathIsPublic,
           pathIsHybrid,
           pathIsAuthorized,
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
