import { verifyPath } from '../src/hooks/verify-path'

describe('Verify different kinds of routes', () => {
  const privateRoutes = ['/users', '/income', '/dashboard']
  const publicRoutes = ['/', '/login', '/about']
  const hybridRoutes = ['/pricing', '/services', '/contact']

  it('returns true when a public route is provided', () => {
    for (let i = 0; i < publicRoutes.length; i++) {
      expect(verifyPath(publicRoutes, publicRoutes[i])).toEqual(true)
    }
  })
  it('returns true when a private route is provided', () => {
    for (let i = 0; i < privateRoutes.length; i++) {
      expect(verifyPath(privateRoutes, privateRoutes[i])).toEqual(true)
    }
  })
  it('returns true when a hybrid route is provided', () => {
    for (let i = 0; i < hybridRoutes.length; i++) {
      expect(verifyPath(hybridRoutes, hybridRoutes[i])).toEqual(true)
    }
  })

  it('returns false when a public route is provided to a set of private routes', () => {
    for (let i = 0; i < privateRoutes.length; i++) {
      expect(verifyPath(privateRoutes, publicRoutes[i])).toEqual(false)
    }
  })
  it('returns false when a private route is provided to a set of public routes', () => {
    for (let i = 0; i < publicRoutes.length; i++) {
      expect(verifyPath(publicRoutes, privateRoutes[i])).toEqual(false)
    }
  })
  it('returns false when a hybrid route is provided to a set of private routes', () => {
    for (let i = 0; i < privateRoutes.length; i++) {
      expect(verifyPath(privateRoutes, hybridRoutes[i])).toEqual(false)
    }
  })
  it('returns false when a hybrid route is provided to a set of public routes', () => {
    for (let i = 0; i < publicRoutes.length; i++) {
      expect(verifyPath(publicRoutes, hybridRoutes[i])).toEqual(false)
    }
  })
  it('returns false when a public route is provided to a set of hybrid routes', () => {
    for (let i = 0; i < hybridRoutes.length; i++) {
      expect(verifyPath(hybridRoutes, publicRoutes[i])).toEqual(false)
    }
  })
  it('returns false when a private route is provided to a set of hybrid routes', () => {
    for (let i = 0; i < hybridRoutes.length; i++) {
      expect(verifyPath(hybridRoutes, publicRoutes[i])).toEqual(false)
    }
  })
})
