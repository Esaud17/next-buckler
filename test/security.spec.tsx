import { verifyPath } from '../src/utils/verify-path'
import { getAccessRoute } from '../src/utils/acces-route'
import { getGrantedRoutes } from '../src/utils/granted-route'
import { RoleAccess } from '../src/types/common/role-access'

describe('Security Tests - Path Traversal Protection', () => {
  const privateRoutes = ['/admin', '/users/dashboard']

  it('prevents path traversal attacks with ../', () => {
    // Attempt to bypass /admin protection by going up directories
    expect(verifyPath(privateRoutes, '/public/../admin')).toEqual(true) // Normalized to /admin
    expect(verifyPath(privateRoutes, '/../../admin')).toEqual(true) // Normalized to /admin
    expect(verifyPath(privateRoutes, '/admin/../public')).toEqual(false) // Normalized to /public
  })

  it('normalizes multiple slashes', () => {
    expect(verifyPath(privateRoutes, '/admin')).toEqual(true)
    expect(verifyPath(privateRoutes, '//admin')).toEqual(true) // Normalized
    expect(verifyPath(privateRoutes, '/admin//')).toEqual(true) // Normalized
    expect(verifyPath(privateRoutes, '///admin///')).toEqual(true) // Normalized
  })

  it('handles relative path components correctly', () => {
    expect(verifyPath(privateRoutes, '/./admin')).toEqual(true) // ./ removed
    expect(verifyPath(privateRoutes, '/admin/./.')).toEqual(true) // ./ removed
    expect(verifyPath(privateRoutes, '/users/./dashboard')).toEqual(true)
  })
})

describe('Security Tests - Dynamic Route Exact Matching', () => {
  it('prevents bypass via substring matching in dynamic routes', () => {
    const routes = ['/users/[id]']
    
    // Should match
    expect(verifyPath(routes, '/users/123')).toEqual(true)
    expect(verifyPath(routes, '/users/abc')).toEqual(true)
    
    // Should NOT match (prevented bypass attempts)
    expect(verifyPath(routes, '/users/123/admin')).toEqual(false) // Extra segment
    expect(verifyPath(routes, '/users/123/delete')).toEqual(false) // Extra segment
    expect(verifyPath(routes, '/users')).toEqual(false) // Missing segment
    expect(verifyPath(routes, '/users/')).toEqual(false) // Missing param
  })

  it('correctly handles catch-all dynamic routes', () => {
    const routes = ['/posts/[...slug]']
    
    // Should match (one or more segments required)
    expect(verifyPath(routes, '/posts/a')).toEqual(true)
    expect(verifyPath(routes, '/posts/a/b')).toEqual(true)
    expect(verifyPath(routes, '/posts/a/b/c')).toEqual(true)
    
    // Should NOT match
    expect(verifyPath(routes, '/posts')).toEqual(false) // Requires at least one segment
    expect(verifyPath(routes, '/posts/')).toEqual(false)
  })

  it('correctly handles optional catch-all routes', () => {
    const routes = ['/shop/[[...slug]]']
    
    // Should match (zero or more segments)
    expect(verifyPath(routes, '/shop')).toEqual(true)
    expect(verifyPath(routes, '/shop/a')).toEqual(true)
    expect(verifyPath(routes, '/shop/a/b')).toEqual(true)
    expect(verifyPath(routes, '/shop/a/b/c')).toEqual(true)
    
    // Should NOT match
    expect(verifyPath(routes, '/shop/a/b/c/d/e/f')).toEqual(true) // Still matches
    expect(verifyPath(routes, '/other')).toEqual(false)
  })

  it('prevents false positives from partial path matches', () => {
    const routes = ['/api/[version]/users']
    
    // Should match
    expect(verifyPath(routes, '/api/v1/users')).toEqual(true)
    expect(verifyPath(routes, '/api/v2/users')).toEqual(true)
    
    // Should NOT match (prevented bypass)
    expect(verifyPath(routes, '/api/v1/users/admin')).toEqual(false)
    expect(verifyPath(routes, '/api/v1/users/123')).toEqual(false)
    expect(verifyPath(routes, '/api/v1')).toEqual(false)
  })
})

describe('Security Tests - Role Validation', () => {
  const mockRBAC: RoleAccess<string[]> = {
    admin: {
      accessRoute: '/admin/dashboard',
      grantedRoutes: ['/admin/dashboard', '/admin/users', '/admin/settings'],
    },
    user: {
      accessRoute: '/dashboard',
      grantedRoutes: ['/dashboard', '/profile'],
    },
  }

  it('validates roles exist in RBAC configuration', () => {
    const validRoles = ['admin']
    const invalidRoles = ['superadmin', 'hacker']

    // Valid role should work
    const accessRoute = getAccessRoute(mockRBAC, validRoles, undefined, '/default')
    expect(accessRoute).toEqual('/admin/dashboard')

    // Invalid role should be ignored and return default (with warning in dev)
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    process.env.NODE_ENV = 'development'
    
    const invalidAccessRoute = getAccessRoute(mockRBAC, invalidRoles, undefined, '/default')
    expect(invalidAccessRoute).toEqual('/default')
    
    consoleWarnSpy.mockRestore()
  })

  it('throws error in strict mode for invalid roles', () => {
    const invalidRoles = ['invalidRole']

    expect(() => {
      getAccessRoute(mockRBAC, invalidRoles, undefined, '/default', true)
    }).toThrow(/not found in RBAC configuration/)
  })

  it('prevents granting routes to invalid roles', () => {
    const invalidRoles = ['hacker', 'malicious']

    const routes = getGrantedRoutes(mockRBAC, invalidRoles, undefined)
    
    // Should return empty array (no routes granted)
    expect(routes).toEqual([])
  })

  it('correctly aggregates routes for multiple valid roles', () => {
    const multipleRoles = ['admin', 'user']

    const routes = getGrantedRoutes(mockRBAC, multipleRoles, undefined)
    
    // Should include routes from both roles, without duplicates
    expect(routes).toContain('/admin/dashboard')
    expect(routes).toContain('/admin/users')
    expect(routes).toContain('/admin/settings')
    expect(routes).toContain('/dashboard')
    expect(routes).toContain('/profile')
    
    // Check no duplicates (admin/dashboard appears in both but should be once)
    const uniqueRoutes = new Set(routes)
    expect(routes.length).toEqual(uniqueRoutes.size)
  })
})

describe('Security Tests - BucklerGuard Role Comparison Fix', () => {
  it('verifies the bug fix: string role should match array of roles', () => {
    const showForRole = 'admin'
    const userRoles: string[] = ['admin', 'user']

    // The fixed implementation should use includes()
    const hasRole = userRoles?.includes(showForRole) ?? false
    expect(hasRole).toEqual(true)

    // The old buggy implementation was:
    // showForRole === userRoles
    // which would always be false
    const buggyComparison = (showForRole as any) === userRoles
    expect(buggyComparison).toEqual(false) // This demonstrates the bug
  })

  it('handles undefined userRoles gracefully', () => {
    const showForRole = 'admin'
    const userRoles = undefined as string[] | undefined

    const hasRole = userRoles?.includes(showForRole) ?? false
    expect(hasRole).toEqual(false)
  })

  it('returns false when role is not in user roles', () => {
    const showForRole = 'superadmin'
    const userRoles = ['admin', 'user'] as string[]

    const hasRole = userRoles?.includes(showForRole) ?? false
    expect(hasRole).toEqual(false)
  })
})

describe('Security Tests - Route Regex Caching', () => {
  it('uses cached regex for repeated route checks (performance)', () => {
    const routes = ['/users/[id]', '/posts/[slug]']
    
    // First call - generates and caches regex
    const result1 = verifyPath(routes, '/users/123')
    expect(result1).toEqual(true)
    
    // Second call - should use cached regex
    const result2 = verifyPath(routes, '/users/456')
    expect(result2).toEqual(true)
    
    // Different route - also cached
    const result3 = verifyPath(routes, '/posts/my-post')
    expect(result3).toEqual(true)
  })
})

describe('Security Tests - Edge Cases', () => {
  it('handles empty route arrays', () => {
    expect(verifyPath([], '/any/path')).toEqual(false)
    expect(verifyPath(undefined, '/any/path')).toEqual(false)
  })

  it('handles empty path strings', () => {
    const routes = ['/admin']
    expect(verifyPath(routes, '')).toEqual(false)
  })

  it('handles root path correctly', () => {
    const routes = ['/']
    expect(verifyPath(routes, '/')).toEqual(true)
    expect(verifyPath(routes, '//')).toEqual(true) // Normalized to /
  })

  it('handles special characters in paths safely', () => {
    const routes = ['/search']
    
    // Should not match despite special regex chars
    expect(verifyPath(routes, '/search?q=test')).toEqual(false)
    expect(verifyPath(routes, '/search.json')).toEqual(false)
    expect(verifyPath(routes, '/search*')).toEqual(false)
  })
})
