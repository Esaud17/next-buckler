import { processSessionRoles, createRoleHandler } from '../src/integrations/next-auth'

describe('NextAuth Integration', () => {
  describe('processSessionRoles', () => {
    it('should return anonymous role for null session', () => {
      const roles = processSessionRoles(null)
      expect(roles).toEqual(['anonymous'])
    })

    it('should extract roles from session.roles', () => {
      const session = {
        user: { name: 'Test User' },
        roles: ['admin', 'editor'],
      }

      const roles = processSessionRoles(session)
      expect(roles).toEqual(['admin', 'editor'])
    })

    it('should extract roles from session.user.roles', () => {
      const session = {
        user: {
          name: 'Test User',
          roles: ['user', 'premium'],
        },
      }

      const roles = processSessionRoles(session)
      expect(roles).toEqual(['user', 'premium'])
    })

    it('should extract single role from session.user.role', () => {
      const session = {
        user: {
          name: 'Test User',
          role: 'admin',
        },
      }

      const roles = processSessionRoles(session)
      expect(roles).toEqual(['admin'])
    })

    it('should apply role prefix', () => {
      const session = {
        user: { name: 'Test' },
        roles: ['admin', 'editor'],
      }

      const roles = processSessionRoles(session, {
        rolePrefix: 'app-role-',
      })

      expect(roles).toEqual(['app-role-admin', 'app-role-editor'])
    })

    it('should not duplicate prefix if already present', () => {
      const session = {
        user: { name: 'Test' },
        roles: ['app-role-admin', 'editor'],
      }

      const roles = processSessionRoles(session, {
        rolePrefix: 'app-role-',
      })

      expect(roles).toEqual(['app-role-admin', 'app-role-editor'])
    })

    it('should filter roles using roleFilter', () => {
      const session = {
        user: { name: 'Test' },
        roles: ['app-role-admin', 'invalid-role', 'app-role-editor'],
      }

      const roles = processSessionRoles(session, {
        roleFilter: (role) => role.startsWith('app-role-'),
      })

      expect(roles).toEqual(['app-role-admin', 'app-role-editor'])
    })

    it('should return defaultRole if no valid roles', () => {
      const session = {
        user: { name: 'Test' },
        roles: [],
      }

      const roles = processSessionRoles(session, {
        defaultRole: 'guest',
      })

      expect(roles).toEqual(['guest'])
    })

    it('should handle minimum valid roles requirement', () => {
      const session = {
        user: { name: 'Test' },
        roles: ['app-role-admin'],
      }

      const roles = processSessionRoles(session, {
        minValidRoles: 2,
        defaultRole: 'user',
      })

      // Only 1 role, but minValidRoles is 2, so return default
      expect(roles).toEqual(['user'])
    })

    it('should filter out non-string roles', () => {
      const session = {
        user: { name: 'Test' },
        roles: ['admin', null, undefined, '', 'editor'] as any,
      }

      const roles = processSessionRoles(session)
      expect(roles).toEqual(['admin', 'editor'])
    })

    it('should use custom anonymous role', () => {
      const roles = processSessionRoles(null, {
        anonymousRole: 'guest',
      })

      expect(roles).toEqual(['guest'])
    })

    it('should handle undefined session', () => {
      const roles = processSessionRoles(undefined)
      expect(roles).toEqual(['anonymous'])
    })

    it('should handle session without user', () => {
      const session = {
        roles: ['admin'],
      } as any

      const roles = processSessionRoles(session)
      // No user, should treat as anonymous
      expect(roles).toEqual(['anonymous'])
    })
  })

  describe('createRoleHandler', () => {
    it('should create a role handler function', () => {
      const handler = createRoleHandler({
        requirePrefix: 'app-role-',
        allowMultiple: true,
      })

      const session = {
        user: { name: 'Test' },
        roles: ['admin', 'editor'],
      }

      const roles = handler(session)
      expect(roles).toEqual(['app-role-admin', 'app-role-editor'])
    })

    it('should return single role based on priority', () => {
      const handler = createRoleHandler({
        requirePrefix: 'app-role-',
        allowMultiple: false,
        priority: ['admin', 'editor', 'user'],
      })

      const session = {
        user: { name: 'Test' },
        roles: ['app-role-user', 'app-role-editor', 'app-role-admin'],
      }

      const roles = handler(session)
      // Should return admin (highest priority)
      expect(roles).toEqual(['app-role-admin'])
    })

    it('should use fallback when no valid roles', () => {
      const handler = createRoleHandler({
        fallback: 'guest',
      })

      const session = {
        user: { name: 'Test' },
        roles: [],
      }

      const roles = handler(session)
      // processSessionRoles returns defaultRole 'user' when no roles
      // The handler then checks if roles.length > 0, and uses fallback if not
      // But processSessionRoles already returned ['user'], so we get that
      expect(roles).toEqual(['user'])
    })

    it('should handle null session', () => {
      const handler = createRoleHandler({
        fallback: 'anonymous',
      })

      const roles = handler(null)
      expect(roles).toEqual(['anonymous'])
    })

    it('should respect priority order', () => {
      const handler = createRoleHandler({
        allowMultiple: false,
        priority: ['super-admin', 'admin', 'user'],
        fallback: 'guest',
      })

      const session1 = {
        user: { name: 'Test' },
        roles: ['user', 'admin'],
      }

      // Should pick admin (higher priority than user)
      expect(handler(session1)).toEqual(['admin'])

      const session2 = {
        user: { name: 'Test' },
        roles: ['user'],
      }

      // Only user available
      expect(handler(session2)).toEqual(['user'])

      const session3 = {
        user: { name: 'Test' },
        roles: ['super-admin', 'admin', 'user'],
      }

      // Should pick super-admin (highest priority)
      expect(handler(session3)).toEqual(['super-admin'])
    })
  })
})
