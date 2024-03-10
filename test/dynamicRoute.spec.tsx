import { isDynamicRoute } from '../src/hooks/dynamic-route'
import { dynamicReplace } from '../src/hooks/dynamic-replace'
import { verifyPath } from '../src/hooks/verify-path'

describe('Verify different kinds of routes', () => {
  const dynamicRoutes = ['/users/[[...slug]]', '/users/[slug]', '/users/[...slugs]']
  const normalRoutes = ['/', '/login', '/about']
  //const hybridRoutes = ['/pricing', '/services', '/contact']

  it('returns true when a route is dynamic', () => {
    for (let i = 0; i < dynamicRoutes.length; i++) {
      expect(isDynamicRoute(dynamicRoutes[i])).toEqual(true)
    }
  })

  it('returns flase when a route is not dynamic', () => {
    for (let i = 0; i < normalRoutes.length; i++) {
      expect(isDynamicRoute(normalRoutes[i])).toEqual(false)
    }
  })

  it('returns value when a route is  dynamic', () => {
    for (let i = 0; i < dynamicRoutes.length; i++) {
      expect(dynamicReplace(dynamicRoutes[i])).toEqual('/users/')
    }
  })

  it('returns true when a route is  dynamic', () => {
    for (let i = 0; i < dynamicRoutes.length; i++) {
      expect(verifyPath(dynamicRoutes,'/users/a/b/c')).toEqual(true)
    }
  })

})
