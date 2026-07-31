import type { Context, Next } from 'hono'
import { createDb } from '../db'
import { sessions, users } from '../db/schema'
import { eq } from 'drizzle-orm'

export type AuthEnv = {
  Bindings: import('@edgekit/shared').Bindings
  Variables: {
    userId: number
    userEmail: string
    userName: string
  }
}

/**
 * Middleware that extracts the session token from the Authorization header
 * (Bearer <token>) or from a cookie named "session_token", validates it,
 * and sets userId / userEmail / userName on the Hono context.
 *
 * Responds 401 if no valid session is found.
 */
export async function authMiddleware(c: Context<AuthEnv>, next: Next) {
  // Try Authorization header first, then cookie
  let token: string | null = null

  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  }

  if (!token) {
    const cookie = c.req.header('Cookie') ?? ''
    const match = cookie.match(/session_token=([^;]+)/)
    if (match) {
      token = match[1]
    }
  }

  if (!token) {
    return c.json({ success: false, error: 'Authentication required' }, 401)
  }

  // Look up the session
  const db = createDb(c.env)
  const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1)

  if (!session) {
    return c.json({ success: false, error: 'Invalid or expired session' }, 401)
  }

  // Check expiry
  if (new Date(session.expiresAt) < new Date()) {
    // Clean up expired session
    await db.delete(sessions).where(eq(sessions.id, session.id))
    return c.json({ success: false, error: 'Session expired' }, 401)
  }

  // Look up the user
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 401)
  }

  // Set auth context
  c.set('userId', user.id)
  c.set('userEmail', user.email)
  c.set('userName', user.name)

  await next()
}
