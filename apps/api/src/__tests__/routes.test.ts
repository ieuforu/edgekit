import { describe, it, expect } from 'vitest'
import app from '../index'

describe('API Routes', () => {
  describe('GET /api/hello', () => {
    it('returns hello message', async () => {
      const res = await app.request('/api/hello')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toEqual({ message: 'hello from worker' })
    })
  })

  describe('Auth routes', () => {
    it('POST /api/auth/register requires body', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      // Should fail validation
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('POST /api/auth/login requires body', async () => {
      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('Protected routes', () => {
    it('GET /api/auth/me requires auth', async () => {
      const res = await app.request('/api/auth/me')
      expect(res.status).toBe(401)
    })

    it('GET /api/workspaces requires auth', async () => {
      const res = await app.request('/api/workspaces')
      expect(res.status).toBe(401)
    })

    it('GET /api/projects requires auth', async () => {
      const res = await app.request('/api/projects')
      expect(res.status).toBe(401)
    })

    it('GET /api/issues requires auth', async () => {
      const res = await app.request('/api/issues')
      expect(res.status).toBe(401)
    })
  })
})
