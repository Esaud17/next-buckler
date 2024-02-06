export function verifyPath(routes: string[] | undefined, uri: string) {
  if (routes === undefined || routes?.length == 0) return false
  return routes?.some(route => route === uri)
}
