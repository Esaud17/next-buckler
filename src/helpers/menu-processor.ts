import type { MenuItem, MenuProcessorOptions, ProcessedMenu, ValidationResult } from './types'

/**
 * Default options for menu processing
 */
const DEFAULT_OPTIONS: Required<MenuProcessorOptions> = {
  strictMode: false,
  defaultRouteType: 'private', // Secure by default
  maxDepth: 10,
  rolePrefix: '',
}

/**
 * Validates a menu item structure
 * @param item - Menu item to validate
 * @param depth - Current depth in the tree
 * @param options - Processing options
 * @returns Validation result
 */
function validateMenuItem(
  item: any,
  depth: number,
  options: Required<MenuProcessorOptions>
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!item || typeof item !== 'object') {
    errors.push('Menu item must be an object')
    return { valid: false, errors, warnings }
  }

  if (!item.key) {
    errors.push(`Menu item missing required field: key`)
  }

  // Validate route type
  if (item.path !== null && item.type) {
    const validTypes = ['private', 'public', 'hybrid']
    if (!validTypes.includes(item.type)) {
      errors.push(
        `Invalid route type "${item.type}" for path "${item.path}". Must be one of: ${validTypes.join(', ')}`
      )
    }
  }

  // Validate path format (basic check)
  if (item.path && typeof item.path === 'string') {
    // Check for common path traversal patterns
    if (item.path.includes('..')) {
      warnings.push(`Path "${item.path}" contains ".." - will be normalized by verifyPath`)
    }
    
    // Ensure path starts with / (Next.js convention)
    if (!item.path.startsWith('/') && !item.path.startsWith('http')) {
      warnings.push(`Path "${item.path}" should start with "/" for Next.js routes`)
    }
  }

  // Check depth
  if (depth > options.maxDepth) {
    errors.push(`Menu nesting exceeds maximum depth of ${options.maxDepth}`)
  }

  // Validate children recursively
  if (item.children && Array.isArray(item.children)) {
    for (const child of item.children) {
      const childValidation = validateMenuItem(child, depth + 1, options)
      errors.push(...childValidation.errors)
      warnings.push(...childValidation.warnings)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Detects circular dependencies in menu structure
 * @param items - Menu items to check
 * @param visited - Set of visited keys
 * @returns Array of circular dependency errors
 */
function detectCircularDependencies(
  items: MenuItem[],
  visited: Set<string> = new Set()
): string[] {
  const errors: string[] = []

  for (const item of items) {
    if (visited.has(item.key)) {
      errors.push(`Circular dependency detected: menu item "${item.key}" appears multiple times`)
    } else {
      visited.add(item.key)
      
      if (item.children) {
        const childErrors = detectCircularDependencies(item.children, new Set(visited))
        errors.push(...childErrors)
      }
    }
  }

  return errors
}

/**
 * Normalizes a role name with optional prefix
 * @param role - Role name to normalize
 * @param prefix - Optional prefix to add
 * @returns Normalized role name
 */
function normalizeRole(role: string | null, prefix: string): string | null {
  if (!role) return null
  if (prefix && !role.startsWith(prefix)) {
    return `${prefix}${role}`
  }
  return role
}

/**
 * Processes menu items and filters by user roles
 * Applies visibility rules based on user's roles
 * 
 * @param menuItems - Array of menu items to process
 * @param userRoles - Current user's roles (null/undefined = anonymous)
 * @param options - Processing options
 * @returns Processed menu with visibility applied
 * 
 * @example
 * ```ts
 * const processedMenu = processMenuItems(menuConfig, ['admin'], {
 *   strictMode: true,
 *   rolePrefix: 'app-role-'
 * })
 * ```
 */
export function processMenuItems<TIcon = unknown>(
  menuItems: MenuItem<TIcon>[],
  userRoles?: string[] | null,
  options?: MenuProcessorOptions
): ProcessedMenu<TIcon> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const errors: string[] = []
  const warnings: string[] = []

  // Validate menu structure
  for (const item of menuItems) {
    const validation = validateMenuItem(item, 0, opts)
    errors.push(...validation.errors)
    warnings.push(...validation.warnings)
  }

  // Detect circular dependencies
  const circularErrors = detectCircularDependencies(menuItems)
  errors.push(...circularErrors)

  // If validation failed and strictMode is enabled, throw
  if (errors.length > 0 && opts.strictMode) {
    throw new Error(
      `Menu validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    )
  }

  // Log warnings in development
  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('[Buckler Menu Warning]', warnings)
  }

  // Normalize user roles
  const normalizedRoles = userRoles?.map(role => normalizeRole(role, opts.rolePrefix)) || []
  const roleSet = new Set(normalizedRoles.filter((r): r is string => r !== null))

  // Process menu items recursively
  const processItem = (item: MenuItem<TIcon>): MenuItem<TIcon> => {
    // Determine visibility based on role
    let isVisible = true
    
    if (item.role) {
      const normalizedItemRole = normalizeRole(item.role, opts.rolePrefix)
      // Item is visible if user has the required role
      isVisible = normalizedItemRole ? roleSet.has(normalizedItemRole) : false
    }
    
    // Handle explicit hidden flag
    if (item.hidden === null) {
      isVisible = true // Force visible if explicitly set to null
    } else if (item.hidden === true) {
      isVisible = false // Force hidden if explicitly set to true
    }

    // Process children recursively
    const processedChildren = item.children?.map(processItem) || undefined

    return {
      ...item,
      hidden: !isVisible,
      children: processedChildren,
    }
  }

  const processedItems = menuItems.map(processItem)

  return {
    menuItems: processedItems,
    validation: {
      valid: errors.length === 0,
      errors,
      warnings,
    },
  }
}
