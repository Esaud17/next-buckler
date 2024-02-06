import type { ReactNode } from "react";
import type { NextRouter } from 'next/router'
import { RoleAccess } from "../common/role-access";

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
  
  userRole?: never
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
  
  userRole: string[] | undefined
}
