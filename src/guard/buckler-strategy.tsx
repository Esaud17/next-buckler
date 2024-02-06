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
         userRole,
         children,
       }: BucklerProps<PrivateRoutesList, PublicRoutesList> & { children: ReactNode }) {
         let view = <>{children}</>

         const pathIsPrivate = verifyPath(privateRoutes, pathname)
         const pathIsPublic = verifyPath(publicRoutes, pathname)
         const pathIsHybrid = verifyPath(hybridRoutes, pathname)

         const access = getAccessRoute(RBAC, userRole, accessRoute, defaultRoute)
         const grantedRoutes = getGrantedRoutes(RBAC, userRole, access)
         const pathIsAuthorized = RBAC && userRole && verifyPath(grantedRoutes, pathname)

         useEffect(() => {
           if (!isAuth && !isLoading && pathIsPrivate) replace(loginRoute)
           if (isAuth && !isLoading && pathIsPublic) replace(access || defaultRoute)
           if (isAuth && userRole && !isLoading && !pathIsHybrid && !pathIsAuthorized)
             replace(access || '/')
         }, [
           replace,
           userRole,
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
           (isLoading || userRole) && !pathIsAuthorized && !pathIsHybrid
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
