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

describe('Auth Flow (full integration)', () => {
  beforeEach(() => {
    testDb = createTestDb()
  })

  async function registerUser(
    email = 'user@test.com',
    password = 'password123',
    name = 'Test User',
  ) {
    return app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
  }

  async function loginUser(email: string, password: string) {
    return app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  }

  describe('Register → Login → Me → Logout', () => {
    it('registers a new user', async () => {
      const res = await registerUser()
      expect(res.status).toBe(201)

      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('user@test.com')
      expect(data.user.name).toBe('Test User')
      expect(data.token).toBeTruthy()
    })

    it('rejects duplicate email', async () => {
      await registerUser('dup@test.com')
      const res = await registerUser('dup@test.com')
      expect(res.status).toBe(409)

      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('already exists')
    })

    it('logs in with correct credentials', async () => {
      await registerUser('login@test.com', 'mypassword123', 'Login User')

      const res = await loginUser('login@test.com', 'mypassword123')
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('login@test.com')
      expect(data.token).toBeTruthy()
    })

    it('rejects wrong password', async () => {
      await registerUser('wrong@test.com', 'correctpass')

      const res = await loginUser('wrong@test.com', 'wrongpassword')
      expect(res.status).toBe(401)

      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid')
    })

    it('rejects non-existent email', async () => {
      const res = await loginUser('nobody@test.com', 'anypassword')
      expect(res.status).toBe(401)
    })

    it('returns user info via /me with valid token', async () => {
      const regRes = await registerUser('me@test.com', 'password123', 'Me User')
      const { token } = await regRes.json()

      const meRes = await app.request('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(meRes.status).toBe(200)

      const meData = await meRes.json()
      expect(meData.success).toBe(true)
      expect(meData.user.email).toBe('me@test.com')
    })

    it('returns 401 for /me without token', async () => {
      const res = await app.request('/api/auth/me')
      expect(res.status).toBe(401)
    })

    it('returns 401 for /me with invalid token', async () => {
      const res = await app.request('/api/auth/me', {
        headers: { Authorization: 'Bearer invalid-token-here' },
      })
      expect(res.status).toBe(401)
    })

    it('logs out and invalidates session', async () => {
      const regRes = await registerUser('logout@test.com', 'password123')
      const { token } = await regRes.json()

      // Verify session works
      const me1 = await app.request('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(me1.status).toBe(200)

      // Logout
      const logoutRes = await app.request('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(logoutRes.status).toBe(200)

      // Session should be invalid now
      const me2 = await app.request('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(me2.status).toBe(401)
    })

    it('supports cookie-based auth', async () => {
      const regRes = await registerUser('cookie@test.com', 'password123')
      const setCookie = regRes.headers.get('Set-Cookie')
      expect(setCookie).toContain('session_token=')

      // Extract token from cookie
      const tokenMatch = setCookie?.match(/session_token=([^;]+)/)
      const token = tokenMatch?.[1]
      expect(token).toBeTruthy()

      // Use cookie for /me
      const meRes = await app.request('/api/auth/me', {
        headers: { Cookie: `session_token=${token}` },
      })
      expect(meRes.status).toBe(200)
    })
  })

  describe('Validation', () => {
    it('rejects registration with invalid email', async () => {
      const res = await registerUser('not-an-email', 'password123', 'Name')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('rejects registration with short password', async () => {
      const res = await registerUser('valid@test.com', 'short', 'Name')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('rejects registration with empty name', async () => {
      const res = await registerUser('valid@test.com', 'password123', '')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    it('rejects login with invalid email format', async () => {
      const res = await loginUser('not-email', 'password123')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })
})
