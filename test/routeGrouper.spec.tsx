import { groupRoutesByType, mergeGroupedRoutes } from '../src/helpers/route-grouper'
import { MenuItem } from '../src/helpers/types'

describe('Route Grouper', () => {
  describe('groupRoutesByType', () => {
    it('should group routes by type correctly', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'home',
          path: '/',
          type: 'public',
          role: null,
        },
        {
          key: 'dashboard',
          path: '/dashboard',
          type: 'private',
          role: 'user',
        },
        {
          key: 'blog',
          path: '/blog',
          type: 'hybrid',
          role: null,
        },
      ]

      const result = groupRoutesByType(menuItems)

      expect(result.routes.routesPublic).toContain('/')
      expect(result.routes.routesPrivate).toContain('/dashboard')
      expect(result.routes.routesHybrid).toContain('/blog')
    })

    it('should generate RBAC configuration from menu', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'admin1',
          path: '/admin/dashboard',
          type: 'private',
          role: 'admin',
        },
        {
          key: 'admin2',
          path: '/admin/users',
          type: 'private',
          role: 'admin',
        },
        {
          key: 'user1',
          path: '/profile',
          type: 'private',
          role: 'user',
        },
      ]

      const result = groupRoutesByType(menuItems)

      expect(result.roles['admin']).toBeDefined()
      expect(result.roles['admin'].grantedRoutes).toContain('/admin/dashboard')
      expect(result.roles['admin'].grantedRoutes).toContain('/admin/users')
      expect(result.roles['admin'].accessRoute).toBe('/admin/dashboard')

      expect(result.roles['user']).toBeDefined()
      expect(result.roles['user'].grantedRoutes).toContain('/profile')
    })

    it('should handle nested menu items', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'parent',
          path: null,
          type: 'private',
          role: null,
          children: [
            {
              key: 'child1',
              path: '/parent/child1',
              type: 'private',
              role: 'admin',
            },
            {
              key: 'child2',
              path: '/parent/child2',
              type: 'private',
              role: 'admin',
            },
          ],
        },
      ]

      const result = groupRoutesByType(menuItems)

      expect(result.routes.routesPrivate).toContain('/parent/child1')
      expect(result.routes.routesPrivate).toContain('/parent/child2')
      expect(result.roles['admin'].grantedRoutes).toHaveLength(2)
    })

    it('should normalize paths by removing trailing slashes', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'test',
          path: '/test/',
          type: 'private',
          role: 'user',
        },
      ]

      const result = groupRoutesByType(menuItems)

      expect(result.routes.routesPrivate).toContain('/test')
      expect(result.routes.routesPrivate).not.toContain('/test/')
    })

    it('should detect duplicate routes across types', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'dup1',
          path: '/duplicate',
          type: 'private',
          role: 'admin',
        },
        {
          key: 'dup2',
          path: '/duplicate',
          type: 'public',
          role: null,
        },
      ]

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      // Should log warning in development
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      groupRoutesByType(menuItems)

      expect(consoleSpy).toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
      consoleSpy.mockRestore()
    })

    it('should throw in strict mode for route leakage', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'leak1',
          path: '/leaked',
          type: 'private',
          role: 'admin',
        },
        {
          key: 'leak2',
          path: '/leaked',
          type: 'public',
          role: null,
        },
      ]

      expect(() => {
        groupRoutesByType(menuItems, { strictMode: true })
      }).toThrow()
    })

    it('should deduplicate routes within the same type', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'item1',
          path: '/dashboard',
          type: 'private',
          role: 'user',
        },
        {
          key: 'item2',
          path: '/dashboard',
          type: 'private',
          role: 'admin',
        },
      ]

      const result = groupRoutesByType(menuItems)

      // Should appear only once in routesPrivate
      const dashboardCount = result.routes.routesPrivate.filter(
        r => r === '/dashboard'
      ).length
      expect(dashboardCount).toBe(1)

      // But both roles should have it in their granted routes
      expect(result.roles['user'].grantedRoutes).toContain('/dashboard')
      expect(result.roles['admin'].grantedRoutes).toContain('/dashboard')
    })

    it('should handle dynamic routes', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'dynamic',
          path: '/users/[id]',
          type: 'private',
          role: 'admin',
        },
        {
          key: 'catchall',
          path: '/posts/[...slug]',
          type: 'private',
          role: 'editor',
        },
      ]

      const result = groupRoutesByType(menuItems)

      expect(result.routes.routesPrivate).toContain('/users/[id]')
      expect(result.routes.routesPrivate).toContain('/posts/[...slug]')
    })
  })

  describe('mergeGroupedRoutes', () => {
    it('should merge multiple grouped route configurations', () => {
      const config1 = groupRoutesByType([
        {
          key: 'admin',
          path: '/admin',
          type: 'private',
          role: 'admin',
        },
      ])

      const config2 = groupRoutesByType([
        {
          key: 'user',
          path: '/profile',
          type: 'private',
          role: 'user',
        },
      ])

      const merged = mergeGroupedRoutes(config1, config2)

      expect(merged.routes.routesPrivate).toContain('/admin')
      expect(merged.routes.routesPrivate).toContain('/profile')
      expect(merged.roles['admin']).toBeDefined()
      expect(merged.roles['user']).toBeDefined()
    })

    it('should deduplicate routes when merging', () => {
      const config1 = groupRoutesByType([
        {
          key: 'dup1',
          path: '/dashboard',
          type: 'private',
          role: 'user',
        },
      ])

      const config2 = groupRoutesByType([
        {
          key: 'dup2',
          path: '/dashboard',
          type: 'private',
          role: 'admin',
        },
      ])

      const merged = mergeGroupedRoutes(config1, config2)

      const dashboardCount = merged.routes.routesPrivate.filter(
        r => r === '/dashboard'
      ).length
      expect(dashboardCount).toBe(1)

      // Both roles should have the route
      expect(merged.roles['user'].grantedRoutes).toContain('/dashboard')
      expect(merged.roles['admin'].grantedRoutes).toContain('/dashboard')
    })

    it('should merge granted routes for the same role', () => {
      const config1 = groupRoutesByType([
        {
          key: 'admin1',
          path: '/admin/dashboard',
          type: 'private',
          role: 'admin',
        },
      ])

      const config2 = groupRoutesByType([
        {
          key: 'admin2',
          path: '/admin/users',
          type: 'private',
          role: 'admin',
        },
      ])

      const merged = mergeGroupedRoutes(config1, config2)

      expect(merged.roles['admin'].grantedRoutes).toContain('/admin/dashboard')
      expect(merged.roles['admin'].grantedRoutes).toContain('/admin/users')
    })

    it('should preserve first access route when merging', () => {
      const config1 = groupRoutesByType([
        {
          key: 'admin1',
          path: '/admin/dashboard',
          type: 'private',
          role: 'admin',
        },
      ])

      const config2 = groupRoutesByType([
        {
          key: 'admin2',
          path: '/admin/settings',
          type: 'private',
          role: 'admin',
        },
      ])

      const merged = mergeGroupedRoutes(config1, config2)

      // Should keep the first access route
      expect(merged.roles['admin'].accessRoute).toBe('/admin/dashboard')
    })
  })
})
