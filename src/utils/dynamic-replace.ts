/**
 * Removes dynamic segments from Next.js route patterns
 * Supports: [id], [...slug], [[...slug]]
 * Note: This is kept for backward compatibility but verify-path.ts 
 * now uses proper regex conversion instead
 */
export function dynamicReplace(path: string) {
  // Match all Next.js dynamic route patterns:
  // [[...slug]] - optional catch-all
  // [...slug] - catch-all  
  // [id] - single param
  const dynamicRoutePattern = /\[\[\.\.\.\w+\]\]|\[\.\.\.\w+\]|\[\w+\]/g

  const replacedString = path.replace(dynamicRoutePattern, '')
  return replacedString
}
