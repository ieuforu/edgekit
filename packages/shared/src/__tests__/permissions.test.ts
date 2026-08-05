import { describe, it, expect } from 'vitest'
import { can, Permissions, RoleHierarchy, AllRoles } from '../permissions'
import type { Permission } from '../permissions'

describe('RBAC Permissions', () => {
  describe('RoleHierarchy', () => {
    it('defines correct hierarchy levels', () => {
      expect(RoleHierarchy.OWNER).toBe(4)
      expect(RoleHierarchy.ADMIN).toBe(3)
      expect(RoleHierarchy.MEMBER).toBe(2)
      expect(RoleHierarchy.VIEWER).toBe(1)
    })

    it('OWNER > ADMIN > MEMBER > VIEWER', () => {
      expect(RoleHierarchy.OWNER).toBeGreaterThan(RoleHierarchy.ADMIN)
      expect(RoleHierarchy.ADMIN).toBeGreaterThan(RoleHierarchy.MEMBER)
      expect(RoleHierarchy.MEMBER).toBeGreaterThan(RoleHierarchy.VIEWER)
    })
  })

  describe('AllRoles', () => {
    it('contains exactly 4 roles', () => {
      expect(AllRoles).toHaveLength(4)
    })

    it('contains expected roles', () => {
      expect(AllRoles).toContain('OWNER')
      expect(AllRoles).toContain('ADMIN')
      expect(AllRoles).toContain('MEMBER')
      expect(AllRoles).toContain('VIEWER')
    })
  })

  describe('can()', () => {
    describe('workspace permissions', () => {
      it('OWNER can update workspace', () => {
        expect(can('OWNER', 'workspace:update')).toBe(true)
      })

      it('ADMIN can update workspace', () => {
        expect(can('ADMIN', 'workspace:update')).toBe(true)
      })

      it('MEMBER cannot update workspace', () => {
        expect(can('MEMBER', 'workspace:update')).toBe(false)
      })

      it('VIEWER cannot update workspace', () => {
        expect(can('VIEWER', 'workspace:update')).toBe(false)
      })

      it('only OWNER can delete workspace', () => {
        expect(can('OWNER', 'workspace:delete')).toBe(true)
        expect(can('ADMIN', 'workspace:delete')).toBe(false)
        expect(can('MEMBER', 'workspace:delete')).toBe(false)
        expect(can('VIEWER', 'workspace:delete')).toBe(false)
      })
    })

    describe('member management permissions', () => {
      it('OWNER and ADMIN can invite members', () => {
        expect(can('OWNER', 'member:invite')).toBe(true)
        expect(can('ADMIN', 'member:invite')).toBe(true)
      })

      it('MEMBER and VIEWER cannot invite members', () => {
        expect(can('MEMBER', 'member:invite')).toBe(false)
        expect(can('VIEWER', 'member:invite')).toBe(false)
      })

      it('only OWNER can update member roles', () => {
        expect(can('OWNER', 'member:update-role')).toBe(true)
        expect(can('ADMIN', 'member:update-role')).toBe(false)
        expect(can('MEMBER', 'member:update-role')).toBe(false)
        expect(can('VIEWER', 'member:update-role')).toBe(false)
      })
    })

    describe('project permissions', () => {
      it('OWNER, ADMIN, MEMBER can create projects', () => {
        expect(can('OWNER', 'project:create')).toBe(true)
        expect(can('ADMIN', 'project:create')).toBe(true)
        expect(can('MEMBER', 'project:create')).toBe(true)
      })

      it('VIEWER cannot create projects', () => {
        expect(can('VIEWER', 'project:create')).toBe(false)
      })

      it('OWNER, ADMIN, MEMBER can delete projects', () => {
        expect(can('OWNER', 'project:delete')).toBe(true)
        expect(can('ADMIN', 'project:delete')).toBe(true)
        expect(can('MEMBER', 'project:delete')).toBe(true)
      })

      it('VIEWER cannot delete projects', () => {
        expect(can('VIEWER', 'project:delete')).toBe(false)
      })
    })

    describe('issue permissions', () => {
      it('OWNER, ADMIN, MEMBER can create issues', () => {
        expect(can('OWNER', 'issue:create')).toBe(true)
        expect(can('ADMIN', 'issue:create')).toBe(true)
        expect(can('MEMBER', 'issue:create')).toBe(true)
      })

      it('VIEWER cannot create issues', () => {
        expect(can('VIEWER', 'issue:create')).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('returns false for unknown permission', () => {
        expect(can('OWNER', 'unknown:perm' as Permission)).toBe(false)
      })
    })
  })

  describe('Permissions object', () => {
    it('has all expected permission keys', () => {
      const expectedPermissions = [
        'workspace:update',
        'workspace:delete',
        'member:invite',
        'member:remove',
        'member:update-role',
        'project:create',
        'project:update',
        'project:delete',
        'issue:create',
        'issue:update',
        'issue:delete',
        'issue:assign',
      ]

      for (const perm of expectedPermissions) {
        expect(Permissions).toHaveProperty(perm)
      }
    })
  })
})
