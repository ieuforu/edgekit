import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { LoginSchema } from '@edgekit/shared'
import { createDb } from '../../db'
import { users, sessions } from '../../db/schema'
import bcrypt from 'bcryptjs'
import type { AppContext } from '../../types'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export class AuthLogin extends OpenAPIRoute {
  schema = {
    tags: ['Auth'],
    summary: 'Log in with email and password',
    request: {
      body: {
        content: {
          'application/json': {
            schema: LoginSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Returns session token and user info',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              token: z.string(),
              user: z.object({
                id: z.number(),
                email: z.string(),
                name: z.string(),
              }),
            }),
          },
        },
      },
      '401': {
        description: 'Invalid credentials',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              error: z.string(),
            }),
          },
        },
      },
    },
  }

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>()
    const { email, password } = data.body

    const db = createDb(c.env)

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!user) {
      return c.json({ success: false, error: 'Invalid email or password' }, 401)
    }

    const valid = bcrypt.compareSync(password, user.passwordHash)
    if (!valid) {
      return c.json({ success: false, error: 'Invalid email or password' }, 401)
    }

    const token = generateToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    await db.insert(sessions).values({
      token,
      userId: user.id,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    })

    c.header(
      'Set-Cookie',
      `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
    )

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  }
}
