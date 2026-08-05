import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestDb } from './helpers'

// Mock createDb to use our in-memory test database
let testDb: ReturnType<typeof createTestDb>

vi.mock('../db', () => ({
  get createDb() {
    return () => testDb.db
  },
}))

// Import app AFTER mocking
const { default: app } = await import('../index')

describe('Database CRUD (full integration)', () => {
  beforeEach(() => {
    testDb = createTestDb()
  })

  // Helper: register a user and return token
  async function registerAndGetToken(
    email = 'owner@test.com',
    password = 'password123',
    name = 'Owner',
  ) {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = (await res.json()) as { token: string }
    return data.token
  }

  // Helper: create workspace via API
  let wsCounter = 0
  async function createWorkspace(token: string, name = 'My Workspace') {
    wsCounter++
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${wsCounter}`
    const res = await app.request('/api/workspaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, slug }),
    })
    return (await res.json()) as {
      success: boolean
      workspace: { id: number; name: string; slug: string }
    }
  }

  describe('Workspace CRUD', () => {
    it('creates a workspace', async () => {
      const token = await registerAndGetToken()
      const res = await app.request('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: 'Test Workspace', slug: 'test-workspace' }),
      })
      expect(res.status).toBe(201)

      const data = (await res.json()) as { success: boolean; workspace: { name: string } }
      expect(data.success).toBe(true)
      expect(data.workspace.name).toBe('Test Workspace')
    })

    it('lists workspaces', async () => {
      const token = await registerAndGetToken()
      await createWorkspace(token, 'WS 1')

      const res = await app.request('/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res.status).toBe(200)

      const data = (await res.json()) as { success: boolean; workspaces: { name: string }[] }
      expect(data.success).toBe(true)
      expect(data.workspaces.length).toBeGreaterThan(0)
    })

    it('gets workspace detail', async () => {
      const token = await registerAndGetToken()
      const { workspace } = await createWorkspace(token, 'Detail WS')

      const res = await app.request(`/api/workspaces/${workspace.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res.status).toBe(200)

      const data = (await res.json()) as {
        success: boolean
        workspace: { name: string }
      }
      expect(data.success).toBe(true)
      expect(data.workspace.name).toBe('Detail WS')
    })

    it('rejects non-member from workspace', async () => {
      const token = await registerAndGetToken('owner@test.com')
      const { workspace } = await createWorkspace(token)

      // Register another user
      const otherToken = await registerAndGetToken('other@test.com')

      const res = await app.request(`/api/workspaces/${workspace.id}`, {
        headers: { Authorization: `Bearer ${otherToken}` },
      })
      expect(res.status).toBe(403)
    })
  })

  describe('Project CRUD', () => {
    it('creates a project in workspace', async () => {
      const token = await registerAndGetToken()
      const { workspace } = await createWorkspace(token)

      const res = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: workspace.id, name: 'Test Project' }),
      })
      expect(res.status).toBe(201)

      const data = (await res.json()) as {
        success: boolean
        project: { name: string; status: string }
      }
      expect(data.success).toBe(true)
      expect(data.project.name).toBe('Test Project')
      expect(data.project.status).toBe('ACTIVE')
    })

    it('lists projects in workspace', async () => {
      const token = await registerAndGetToken()
      const { workspace } = await createWorkspace(token)

      // Create two projects
      await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: workspace.id, name: 'Project A' }),
      })
      await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: workspace.id, name: 'Project B' }),
      })

      const res = await app.request(`/api/projects?workspaceId=${workspace.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res.status).toBe(200)

      const data = (await res.json()) as {
        success: boolean
        projects: { name: string }[]
      }
      expect(data.success).toBe(true)
      expect(data.projects.length).toBe(2)
    })

    it('updates a project', async () => {
      const token = await registerAndGetToken()
      const { workspace } = await createWorkspace(token)

      const createRes = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: workspace.id, name: 'Old Name' }),
      })
      const created = (await createRes.json()) as { project: { id: number } }

      const res = await app.request(`/api/projects/${created.project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: 'New Name' }),
      })
      expect(res.status).toBe(200)

      const data = (await res.json()) as { project: { name: string } }
      expect(data.project.name).toBe('New Name')
    })

    it('deletes a project', async () => {
      const token = await registerAndGetToken()
      const { workspace } = await createWorkspace(token)

      const createRes = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: workspace.id, name: 'To Delete' }),
      })
      const created = (await createRes.json()) as { project: { id: number } }

      const res = await app.request(`/api/projects/${created.project.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res.status).toBe(200)
    })
  })

  describe('Issue CRUD', () => {
    it('creates an issue in project', async () => {
      const token = await registerAndGetToken()
      const { workspace } = await createWorkspace(token)

      const projRes = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: workspace.id, name: 'Proj' }),
      })
      const { project } = (await projRes.json()) as { project: { id: number } }

      const res = await app.request('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: project.id,
          title: 'First Issue',
          status: 'TODO',
          priority: 'HIGH',
        }),
      })
      expect(res.status).toBe(201)

      const data = (await res.json()) as {
        success: boolean
        issue: { title: string; status: string; priority: string }
      }
      expect(data.success).toBe(true)
      expect(data.issue.title).toBe('First Issue')
      expect(data.issue.status).toBe('TODO')
      expect(data.issue.priority).toBe('HIGH')
    })

    it('lists issues for a project', async () => {
      const token = await registerAndGetToken()
      const { workspace } = await createWorkspace(token)

      const projRes = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: workspace.id, name: 'Proj' }),
      })
      const { project } = (await projRes.json()) as { project: { id: number } }

      // Create 3 issues
      for (let i = 1; i <= 3; i++) {
        await app.request('/api/issues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ projectId: project.id, title: `Issue ${i}` }),
        })
      }

      const res = await app.request(`/api/issues?projectId=${project.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res.status).toBe(200)

      const data = (await res.json()) as {
        success: boolean
        issues: { title: string }[]
      }
      expect(data.success).toBe(true)
      expect(data.issues.length).toBe(3)
    })

    it('updates an issue status', async () => {
      const token = await registerAndGetToken()
      const { workspace } = await createWorkspace(token)

      const projRes = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: workspace.id, name: 'Proj' }),
      })
      const { project } = (await projRes.json()) as { project: { id: number } }

      const issueRes = await app.request('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId: project.id, title: 'Move me' }),
      })
      const { issue } = (await issueRes.json()) as { issue: { id: number } }

      // Update status from TODO to IN_PROGRESS
      const res = await app.request(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      })
      expect(res.status).toBe(200)

      const data = (await res.json()) as {
        success: boolean
        issue: { status: string }
      }
      expect(data.issue.status).toBe('IN_PROGRESS')
    })

    it('deletes an issue', async () => {
      const token = await registerAndGetToken()
      const { workspace } = await createWorkspace(token)

      const projRes = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: workspace.id, name: 'Proj' }),
      })
      const { project } = (await projRes.json()) as { project: { id: number } }

      const issueRes = await app.request('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId: project.id, title: 'Delete me' }),
      })
      const { issue } = (await issueRes.json()) as { issue: { id: number } }

      const res = await app.request(`/api/issues/${issue.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res.status).toBe(200)

      // Verify deleted
      const getRes = await app.request(`/api/issues/${issue.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(getRes.status).toBe(404)
    })

    it('rejects issue creation for non-member', async () => {
      const ownerToken = await registerAndGetToken('owner@test.com')
      const { workspace } = await createWorkspace(ownerToken)

      const projRes = await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({ workspaceId: workspace.id, name: 'Proj' }),
      })
      const { project } = (await projRes.json()) as { project: { id: number } }

      // Another user tries to create issue
      const otherToken = await registerAndGetToken('other@test.com')
      const res = await app.request('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${otherToken}`,
        },
        body: JSON.stringify({ projectId: project.id, title: 'No access' }),
      })
      expect(res.status).toBe(403)
    })
  })

  describe('Data isolation', () => {
    it("users cannot see other workspace's projects", async () => {
      const token1 = await registerAndGetToken('user1@test.com')
      const token2 = await registerAndGetToken('user2@test.com')

      const { workspace: ws1 } = await createWorkspace(token1, 'WS 1')
      const { workspace: ws2 } = await createWorkspace(token2, 'WS 2')

      // Create project in ws1
      await app.request('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({ workspaceId: ws1.id, name: 'WS1 Project' }),
      })

      // User2 lists projects in ws2 - should not see ws1's project
      const res = await app.request(`/api/projects?workspaceId=${ws2.id}`, {
        headers: { Authorization: `Bearer ${token2}` },
      })
      const data = (await res.json()) as { projects: { name: string }[] }
      expect(data.projects).toHaveLength(0)
    })
  })
})
