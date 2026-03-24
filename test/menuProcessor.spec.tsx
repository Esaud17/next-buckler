import { processMenuItems } from '../src/helpers/menu-processor'
import { MenuItem } from '../src/helpers/types'

describe('Menu Processor', () => {
  describe('processMenuItems', () => {
    it('should process menu items and apply visibility based on roles', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'admin',
          label: 'Admin Panel',
          path: '/admin',
          type: 'private',
          role: 'admin',
        },
        {
          key: 'dashboard',
          label: 'Dashboard',
          path: '/dashboard',
          type: 'private',
          role: 'user',
        },
      ]

      const result = processMenuItems(menuItems, ['admin'])

      expect(result.menuItems[0].hidden).toBe(false) // Admin visible
      expect(result.menuItems[1].hidden).toBe(true) // Dashboard hidden
    })

    it('should handle nested menu items', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'parent',
          label: 'Parent',
          path: null,
          type: 'private',
          role: 'admin',
          children: [
            {
              key: 'child',
              label: 'Child',
              path: '/child',
              type: 'private',
              role: 'admin',
            },
          ],
        },
      ]

      const result = processMenuItems(menuItems, ['admin'])

      expect(result.menuItems[0].hidden).toBe(false)
      expect(result.menuItems[0].children![0].hidden).toBe(false)
    })

    it('should validate menu structure in strict mode', () => {
      const invalidMenu: any = [
        {
          // Missing key
          path: '/test',
          type: 'invalid-type',
          role: 'admin',
        },
      ]

      expect(() => {
        processMenuItems(invalidMenu, ['admin'], { strictMode: true })
      }).toThrow()
    })

    it('should detect circular dependencies', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'item1',
          label: 'Item 1',
          path: '/item1',
          type: 'private',
          role: null,
        },
        {
          key: 'item1', // Duplicate key
          label: 'Item 1 Duplicate',
          path: '/item1-dup',
          type: 'private',
          role: null,
        },
      ]

      expect(() => {
        processMenuItems(menuItems, [], { strictMode: true })
      }).toThrow(/circular/i)
    })

    it('should handle null/undefined userRoles', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'public',
          label: 'Public',
          path: '/public',
          type: 'public',
          role: null,
        },
      ]

      const result = processMenuItems(menuItems, null)
      expect(result.validation.valid).toBe(true)
    })

    it('should apply role prefix normalization', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'admin',
          label: 'Admin',
          path: '/admin',
          type: 'private',
          role: 'admin',
        },
      ]

      const result = processMenuItems(menuItems, ['app-role-admin'], {
        rolePrefix: 'app-role-',
      })

      expect(result.menuItems[0].hidden).toBe(false)
    })

    it('should warn about path traversal patterns', () => {
      const menuItems: MenuItem[] = [
        {
          key: 'test',
          label: 'Test',
          path: '/test/../admin',
          type: 'private',
          role: null,
        },
      ]

      const result = processMenuItems(menuItems)
      expect(result.validation.warnings.length).toBeGreaterThan(0)
    })

    it('should enforce maximum nesting depth', () => {
      const deepMenu: MenuItem = {
        key: 'level1',
        path: null,
        type: 'private',
        role: null,
        children: [
          {
            key: 'level2',
            path: null,
            type: 'private',
            role: null,
            children: [],
          },
        ],
      }

      // Create deep nesting
      let current = deepMenu.children![0]
      for (let i = 3; i <= 15; i++) {
        current.children = [
          {
            key: `level${i}`,
            path: null,
            type: 'private',
            role: null,
            children: [],
          },
        ]
        current = current.children[0]
      }

      expect(() => {
        processMenuItems([deepMenu], [], { strictMode: true, maxDepth: 10 })
      }).toThrow(/depth/)
    })
  })
})
