/**
 * Checks if a route contains Next.js dynamic segments
 * Uses precise regex to avoid false positives
 */
export function isDynamicRoute(route: string): boolean {
  // Match valid Next.js dynamic patterns only
  // [[...slug]] - optional catch-all
  // [...slug] - catch-all
  // [id] - single param
  const dynamicPattern = /\[\[\.\.\.\w+\]\]|\[\.\.\.\w+\]|\[\w+\]/
  
  return dynamicPattern.test(route)
}