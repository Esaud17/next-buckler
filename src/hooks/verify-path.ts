import { isDynamicRoute } from './dynamic-route'

// Cache for compiled route patterns (performance optimization)
const routeRegexCache = new Map<string, RegExp>()

/**
 * Normalizes URI to prevent path traversal attacks
 * Removes //, ./, ../ and ensures clean path
 */
function normalizeUri(uri: string): string {
  // Remove multiple slashes
  let normalized = uri.replace(/\/+/g, '/')
  
  // Remove trailing slash (except for root)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  
  // Prevent path traversal by resolving relative paths
  const parts = normalized.split('/').filter(Boolean)
  const resolved: string[] = []
  
  for (const part of parts) {
    if (part === '..') {
      // Try to go up, but never above root
      if (resolved.length > 0) {
        resolved.pop()
      }
    } else if (part !== '.') {
      resolved.push(part)
    }
  }
  
  return '/' + resolved.join('/')
}

/**
 * Converts Next.js route pattern to exact match regex
 * Examples:
 *   /users/[id] -> /^\/users\/[^\/]+$/
 *   /posts/[...slug] -> /^\/posts(?:\/[^\/]+)+$/
 *   /shop/[[...slug]] -> /^\/shop(?:\/[^\/]+)*$/
 */
function routeToRegex(route: string): RegExp {
  // Check cache first
  if (routeRegexCache.has(route)) {
    return routeRegexCache.get(route)!
  }
  
  let pattern = route
  
  // Replace Next.js dynamic segments with placeholders BEFORE escaping
  // Important: Include the leading slash in the placeholder to avoid double slashes
  
  // /[[...slug]] - optional catch-all (can match zero or more segments)
  pattern = pattern.replace(/\/\[\[\.\.\.\w+\]\]/g, '___OPTIONAL_CATCHALL___')
  
  // /[...slug] - catch-all (must match one or more segments)
  pattern = pattern.replace(/\/\[\.\.\.\w+\]/g, '___CATCHALL___')
  
  // /[param] - single dynamic segment
  pattern = pattern.replace(/\/\[\w+\]/g, '___PARAM___')
  
  // Escape all special regex chars including forward slashes
  pattern = pattern.replace(/[.+?^${}()|[\]\\\/]/g, '\\$&')
  
  // Replace placeholders with actual regex patterns (including the leading slash)
  pattern = pattern.replace(/___OPTIONAL_CATCHALL___/g, '(?:\\/[^\\/]+)*')
  pattern = pattern.replace(/___CATCHALL___/g, '(?:\\/[^\\/]+)+')
  pattern = pattern.replace(/___PARAM___/g, '\\/[^\\/]+')
  
  // Create exact match regex
  const regex = new RegExp(`^${pattern}$`)
  
  // Cache the compiled regex
  routeRegexCache.set(route, regex)
  
  return regex
}

export function verifyPath(routes: string[] | undefined, uri: string) {
  if (routes === undefined || routes?.length === 0) return false
  
  // Sanitize URI to prevent path traversal attacks
  const normalizedUri = normalizeUri(uri)
  
  return routes.some(route => {
    if (isDynamicRoute(route)) {
      const regex = routeToRegex(route)
      return regex.test(normalizedUri)
    }
    
    // Exact match for static routes
    return route === normalizedUri
  })
}
