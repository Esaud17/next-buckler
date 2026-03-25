/**
 * Route type definitions
 * Strict union type to prevent invalid route types
 */
export type RouteType = 'private' | 'public' | 'hybrid'

/**
 * Menu item definition
 * Represents a single menu entry with routing and RBAC information
 */
export type MenuItem<TIcon = unknown> = {
  /** Unique identifier for the menu item */
  key: string
  
  /** Display label (can be ReactNode, string, or any renderable content) */
  label?: unknown
  
  /** Icon component or string identifier */
  icon?: TIcon
  
  /** Route path (Next.js format: /path, /path/[id], /path/[...slug]) */
  path: string | null
  
  /** Route type - determines access control behavior */
  type: RouteType
  
  /** Role required to access this route (null = no specific role) */
  role?: string | null
  
  /** Roles array - any of these roles grants access (alternative to role) */
  roles?: string[] | null
  
  /** UI visibility flag (separate from security) */
  hidden?: boolean | null
  
  /** Nested menu items */
  children?: MenuItem<TIcon>[]
}

/**
 * Grouped routes by type
 * Output of groupRoutesByType function
 */
export type GroupedRoutes = {
  routes: {
    routesPrivate: string[]
    routesPublic: string[]
    routesHybrid: string[]
  }
  roles: {
    [roleName: string]: {
      grantedRoutes: string[]
      accessRoute?: string
    }
  }
}

/**
 * Configuration for menu processing
 */
export type MenuProcessorOptions = {
  /** When true, throws errors for invalid configurations */
  strictMode?: boolean
  
  /** Default route type when ambiguous (defaults to 'private' for security) */
  defaultRouteType?: RouteType
  
  /** Maximum depth for nested menus (prevents infinite recursion) */
  maxDepth?: number
  
  /** Role prefix for normalization (e.g., 'app-role-') */
  rolePrefix?: string
}

/**
 * Result of menu validation
 */
export type ValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Menu processing result
 */
export type ProcessedMenu<TIcon = unknown> = {
  menuItems: MenuItem<TIcon>[]
  validation: ValidationResult
}
