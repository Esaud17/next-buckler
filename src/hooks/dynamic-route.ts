export function isDynamicRoute(route: string) {
  return route.includes('[') || route.includes('...');
}