import type { MenuItem, GroupedRoutes, MenuProcessorOptions } from './types'

/**
 * Security warnings for route configuration
 */
type SecurityWarning = {
  type: 'duplicate_route' | 'route_type_mismatch' | 'missing_role' | 'invalid_path'
  message: string
  path?: string
  role?: string
}

/**
 * Detects duplicate routes across different types
 * This could indicate a security misconfiguration
 */
function detectDuplicateRoutes(
  privateRoutes: string[],
  publicRoutes: string[],
  hybridRoutes: string[]
): SecurityWarning[] {
  const warnings: SecurityWarning[] = []
  const allRoutes = new Map<string, string[]>()

  // Track which types each route appears in
  privateRoutes.forEach(route => {
    if (!allRoutes.has(route)) allRoutes.set(route, [])
    allRoutes.get(route)!.push('private')
  })
  
  publicRoutes.forEach(route => {
    if (!allRoutes.has(route)) allRoutes.set(route, [])
    allRoutes.get(route)!.push('public')
  })
  
  hybridRoutes.forEach(route => {
    if (!allRoutes.has(route)) allRoutes.set(route, [])
    allRoutes.get(route)!.push('hybrid')
  })

  // Check for routes appearing in multiple types
  allRoutes.forEach((types, route) => {
    if (types.length > 1) {
      warnings.push({
        type: 'duplicate_route',
        message: `Route "${route}" appears as ${types.join(', ')} - this may cause unexpected behavior`,
        path: route,
      })
    }
  })

  return warnings
}

/**
 * Validates that roles referenced in routes are defined
 */
function validateRoleReferences(
  items: MenuItem[],
  definedRoles: Set<string>,
  strictMode: boolean
): SecurityWarning[] {
  const warnings: SecurityWarning[] = []

  const checkItem = (item: MenuItem) => {
    if (item.role && !definedRoles.has(item.role)) {
      const warning: SecurityWarning = {
        type: 'missing_role',
        message: `Route "${item.path}" references undefined role "${item.role}"`,
        path: item.path || undefined,
        role: item.role,
      }
      warnings.push(warning)
    }
    
    item.children?.forEach(checkItem)
  }

  items.forEach(checkItem)

  // In strict mode, throw if roles are undefined
  if (strictMode && warnings.length > 0) {
    throw new Error(
      `Role validation failed:\n${warnings.map(w => `  - ${w.message}`).join('\n')}`
    )
  }

  return warnings
}

/**
 * Ensures no private routes accidentally leak into public routes
 * This is a critical security check
 */
function detectRouteLeakage(
  privateRoutes: string[],
  publicRoutes: string[]
): SecurityWarning[] {
  const warnings: SecurityWarning[] = []
  const privateSet = new Set(privateRoutes)

  publicRoutes.forEach(route => {
    if (privateSet.has(route)) {
      warnings.push({
        type: 'route_type_mismatch',
        message: `SECURITY WARNING: Route "${route}" is marked as both private and public!`,
        path: route,
      })
    }
  })

  return warnings
}

/**
 * Recursively extracts routes from menu items
 */
function extractRoutes(
  items: MenuItem[],
  groupedRoutes: GroupedRoutes,
  parentPath?: string
): void {
  for (const item of items) {
    if (item.path && typeof item.path === 'string') {
      // Normalize path (remove trailing slashes, etc.)
      const normalizedPath = item.path.endsWith('/') && item.path !== '/' 
        ? item.path.slice(0, -1) 
        : item.path

      // Add to appropriate route list based on type
      if (item.type === 'private') {
        if (!groupedRoutes.routes.routesPrivate.includes(normalizedPath)) {
          groupedRoutes.routes.routesPrivate.push(normalizedPath)
        }
      } else if (item.type === 'public') {
        if (!groupedRoutes.routes.routesPublic.includes(normalizedPath)) {
          groupedRoutes.routes.routesPublic.push(normalizedPath)
        }
      } else if (item.type === 'hybrid') {
        if (!groupedRoutes.routes.routesHybrid.includes(normalizedPath)) {
          groupedRoutes.routes.routesHybrid.push(normalizedPath)
        }
      }

      // Process role and granted routes
      if (item.role) {
        if (!groupedRoutes.roles[item.role]) {
          groupedRoutes.roles[item.role] = {
            grantedRoutes: [],
          }
        }

        // Add route to role's granted routes if not already present
        if (!groupedRoutes.roles[item.role].grantedRoutes.includes(normalizedPath)) {
          groupedRoutes.roles[item.role].grantedRoutes.push(normalizedPath)
        }

        // Set access route if not already set (first route encountered becomes access route)
        if (!groupedRoutes.roles[item.role].accessRoute && item.type === 'private') {
          groupedRoutes.roles[item.role].accessRoute = normalizedPath
        }
      }
    }

    // Process children recursively
    if (item.children && item.children.length > 0) {
      extractRoutes(item.children, groupedRoutes, item.path || parentPath)
    }
  }
}

/**
 * Groups routes by type and generates RBAC configuration from menu structure
 * 
 * **Security Features:**
 * - Detects duplicate routes across types
 * - Validates role references
 * - Prevents private route leakage to public
 * - Normalizes paths to prevent inconsistencies
 * 
 * @param menuItems - Array of menu items to process
 * @param options - Processing options
 * @returns Grouped routes and RBAC configuration
 * 
 * @example
 * ```ts
 * const config = groupRoutesByType(menuConfig, { strictMode: true })
 * 
 * // Use in Buckler
 * <Buckler
 *   privateRoutes={config.routes.routesPrivate}
 *   publicRoutes={config.routes.routesPublic}
 *   hybridRoutes={config.routes.routesHybrid}
 *   RBAC={config.roles}
 * />
 * ```
 */
export function groupRoutesByType(
  menuItems: MenuItem[],
  options?: MenuProcessorOptions
): GroupedRoutes {
  const strictMode = options?.strictMode ?? false

  // Initialize grouped routes structure
  const groupedRoutes: GroupedRoutes = {
    routes: {
      routesPrivate: [],
      routesPublic: [],
      routesHybrid: [],
    },
    roles: {},
  }

  // Extract routes recursively
  extractRoutes(menuItems, groupedRoutes)

  // Security checks
  const warnings: SecurityWarning[] = []

  // 1. Check for duplicate routes
  const duplicateWarnings = detectDuplicateRoutes(
    groupedRoutes.routes.routesPrivate,
    groupedRoutes.routes.routesPublic,
    groupedRoutes.routes.routesHybrid
  )
  warnings.push(...duplicateWarnings)

  // 2. Check for route leakage (critical security issue)
  const leakageWarnings = detectRouteLeakage(
    groupedRoutes.routes.routesPrivate,
    groupedRoutes.routes.routesPublic
  )
  warnings.push(...leakageWarnings)

  // 3. Validate role references
  const definedRoles = new Set(Object.keys(groupedRoutes.roles))
  const roleWarnings = validateRoleReferences(menuItems, definedRoles, strictMode)
  warnings.push(...roleWarnings)

  // Log warnings in development or strict mode
  if (warnings.length > 0) {
    const criticalWarnings = warnings.filter(w => 
      w.type === 'route_type_mismatch'
    )
    
    if (criticalWarnings.length > 0 || strictMode) {
      const message = `[Buckler Security] Configuration warnings:\n${
        warnings.map(w => `  - ${w.message}`).join('\n')
      }`
      
      if (strictMode) {
        throw new Error(message)
      } else if (process.env.NODE_ENV === 'development') {
        console.warn(message)
      }
    }
  }

  return groupedRoutes
}

/**
 * Helper to merge multiple grouped routes configurations
 * Useful when combining routes from different menu sources
 * 
 * @param configs - Array of grouped route configurations to merge
 * @returns Merged configuration
 */
export function mergeGroupedRoutes(...configs: GroupedRoutes[]): GroupedRoutes {
  const merged: GroupedRoutes = {
    routes: {
      routesPrivate: [],
      routesPublic: [],
      routesHybrid: [],
    },
    roles: {},
  }

  for (const config of configs) {
    // Merge routes (deduplicate)
    const privateSet = new Set([...merged.routes.routesPrivate, ...config.routes.routesPrivate])
    const publicSet = new Set([...merged.routes.routesPublic, ...config.routes.routesPublic])
    const hybridSet = new Set([...merged.routes.routesHybrid, ...config.routes.routesHybrid])

    merged.routes.routesPrivate = Array.from(privateSet)
    merged.routes.routesPublic = Array.from(publicSet)
    merged.routes.routesHybrid = Array.from(hybridSet)

    // Merge roles
    for (const [role, roleConfig] of Object.entries(config.roles)) {
      if (!merged.roles[role]) {
        merged.roles[role] = {
          grantedRoutes: [...roleConfig.grantedRoutes],
          accessRoute: roleConfig.accessRoute,
        }
      } else {
        // Merge granted routes
        const grantedSet = new Set([
          ...merged.roles[role].grantedRoutes,
          ...roleConfig.grantedRoutes,
        ])
        merged.roles[role].grantedRoutes = Array.from(grantedSet)
        
        // Keep first access route encountered
        if (!merged.roles[role].accessRoute && roleConfig.accessRoute) {
          merged.roles[role].accessRoute = roleConfig.accessRoute
        }
      }
    }
  }

  return merged
}
