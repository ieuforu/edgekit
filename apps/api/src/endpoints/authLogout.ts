import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import type { AppContext } from '../types'
import { createDb } from '../db'
import { sessions } from '../db/schema'
import { authMiddleware, type AuthEnv } from '../middleware/auth'

export class AuthLogout extends OpenAPIRoute {
  schema = {
    tags: ['Auth'],
    summary: 'Log out and invalidate the current session',
    responses: {
      '200': {
        description: 'Session invalidated successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
    },
  }

  async handle(c: AppContext & AuthEnv) {
    // Extract token from header or cookie to delete it
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

    if (token) {
      const db = createDb(c.env)
      await db.delete(sessions).where(eq(sessions.token, token))
    }

    // Clear cookie
    c.header('Set-Cookie', 'session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')

    return c.json({
      success: true,
      message: 'Logged out successfully',
    })
  }
}
