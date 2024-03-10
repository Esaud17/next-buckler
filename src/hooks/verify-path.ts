import { dynamicReplace } from './dynamic-replace'
import { isDynamicRoute } from './dynamic-route'

export function verifyPath(routes: string[] | undefined, uri: string) {
  if (routes === undefined || routes?.length == 0) return false
  return routes?.some(route => {
    if (isDynamicRoute(route)) {
      const dynamycRoute = dynamicReplace(route)
      const isIncludeUrl = uri.includes(dynamycRoute)
      return isIncludeUrl
    }

    return route === uri
  })
}
