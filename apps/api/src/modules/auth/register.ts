import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { RegisterSchema } from '@edgekit/shared'
import { createDb } from '../../db'
import { users, sessions } from '../../db/schema'
import bcrypt from 'bcryptjs'
import type { AppContext } from '../../types'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export class AuthRegister extends OpenAPIRoute {
  schema = {
    tags: ['Auth'],
    summary: 'Register a new user',
    request: {
      body: {
        content: {
          'application/json': {
            schema: RegisterSchema,
          },
        },
      },
    },
    responses: {
      '201': {
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
      '409': {
        description: 'Email already exists',
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
    const { email, password, name } = data.body

    const db = createDb(c.env)

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing) {
      return c.json({ success: false, error: 'A user with this email already exists' }, 409)
    }

    const salt = bcrypt.genSaltSync(10)
    const passwordHash = bcrypt.hashSync(password, salt)

    const [created] = await db.insert(users).values({ email, passwordHash, name }).returning()

    if (!created) {
      return c.json({ success: false, error: 'Failed to create user' }, 500)
    }

    const token = generateToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    await db.insert(sessions).values({
      token,
      userId: created.id,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    })

    c.header(
      'Set-Cookie',
      `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
    )

    return c.json(
      {
        success: true,
        token,
        user: {
          id: created.id,
          email: created.email,
          name: created.name,
        },
      },
      201,
    )
  }
}
