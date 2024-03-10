export function dynamicReplace(path: string) {
  const dynamicRoutePattern = /\[\.\.\.(\w+)\]|\[(\w+)\]|\[\.\.\.(\w+)\]|\[\[(\.\.\.\w+)\]\]/g

  const replacedString = path.replace(dynamicRoutePattern, '')
  return replacedString
}
