import { describe, it, expect } from 'vitest'
import {
  LoginSchema,
  RegisterSchema,
  WorkspaceRole,
  ProjectStatus,
  IssueStatus,
  IssuePriority,
  Workspace,
  Project,
  Issue,
  WorkspaceMember,
} from '../index'

describe('Zod Schemas', () => {
  describe('Enum schemas', () => {
    it('WorkspaceRole validates all roles', () => {
      expect(WorkspaceRole.parse('OWNER')).toBe('OWNER')
      expect(WorkspaceRole.parse('ADMIN')).toBe('ADMIN')
      expect(WorkspaceRole.parse('MEMBER')).toBe('MEMBER')
      expect(WorkspaceRole.parse('VIEWER')).toBe('VIEWER')
      expect(() => WorkspaceRole.parse('INVALID')).toThrow()
    })

    it('ProjectStatus validates all statuses', () => {
      expect(ProjectStatus.parse('ACTIVE')).toBe('ACTIVE')
      expect(ProjectStatus.parse('ARCHIVED')).toBe('ARCHIVED')
      expect(() => ProjectStatus.parse('INVALID')).toThrow()
    })

    it('IssueStatus validates all statuses', () => {
      expect(IssueStatus.parse('BACKLOG')).toBe('BACKLOG')
      expect(IssueStatus.parse('TODO')).toBe('TODO')
      expect(IssueStatus.parse('IN_PROGRESS')).toBe('IN_PROGRESS')
      expect(IssueStatus.parse('DONE')).toBe('DONE')
      expect(IssueStatus.parse('CANCELLED')).toBe('CANCELLED')
      expect(() => IssueStatus.parse('INVALID')).toThrow()
    })

    it('IssuePriority validates all priorities', () => {
      expect(IssuePriority.parse('NO_PRIORITY')).toBe('NO_PRIORITY')
      expect(IssuePriority.parse('LOW')).toBe('LOW')
      expect(IssuePriority.parse('MEDIUM')).toBe('MEDIUM')
      expect(IssuePriority.parse('HIGH')).toBe('HIGH')
      expect(IssuePriority.parse('URGENT')).toBe('URGENT')
      expect(() => IssuePriority.parse('INVALID')).toThrow()
    })
  })

  describe('Auth schemas', () => {
    it('LoginSchema validates valid login data', () => {
      const result = LoginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('LoginSchema rejects invalid email', () => {
      const result = LoginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })

    it('LoginSchema rejects short password', () => {
      const result = LoginSchema.safeParse({
        email: 'test@example.com',
        password: 'short',
      })
      expect(result.success).toBe(false)
    })

    it('RegisterSchema validates valid register data', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })
      expect(result.success).toBe(true)
    })

    it('RegisterSchema rejects empty name', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        name: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('Entity schemas', () => {
    it('Workspace validates valid workspace', () => {
      const result = Workspace.safeParse({
        name: 'My Workspace',
        slug: 'my-workspace',
        ownerId: 1,
      })
      expect(result.success).toBe(true)
    })

    it('Project validates valid project', () => {
      const result = Project.safeParse({
        workspaceId: 1,
        name: 'My Project',
      })
      expect(result.success).toBe(true)
    })

    it('Issue validates valid issue', () => {
      const result = Issue.safeParse({
        projectId: 1,
        title: 'Fix bug',
        creatorId: 1,
      })
      expect(result.success).toBe(true)
    })

    it('WorkspaceMember validates valid member', () => {
      const result = WorkspaceMember.safeParse({
        workspaceId: 1,
        userId: 1,
        role: 'MEMBER',
      })
      expect(result.success).toBe(true)
    })
  })
})
