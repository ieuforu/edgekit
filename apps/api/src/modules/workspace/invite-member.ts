import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { createDb } from '../../db'
import { workspaceMembers, users } from '../../db/schema'
import type { AppContext } from '../../types'

export class InviteMember extends OpenAPIRoute {
  schema = {
    tags: ['Workspace Members'],
    summary: 'Invite a member to a workspace',
    description: 'Requires member:invite permission (ADMIN or OWNER)',
    request: {
      params: z.object({
        workspaceId: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: z.object({
              email: z.string().email(),
              role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
            }),
          },
        },
      },
    },
    responses: {
      '201': {
        description: 'Member invited successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              member: z.object({
                id: z.number(),
                workspaceId: z.number(),
                userId: z.number(),
                role: z.string(),
                user: z.object({
                  id: z.number(),
                  email: z.string(),
                  name: z.string(),
                }),
                createdAt: z.string(),
              }),
            }),
          },
        },
      },
      '403': {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: z.object({ success: z.boolean(), error: z.string() }),
          },
        },
      },
      '404': {
        description: 'User not found',
        content: {
          'application/json': {
            schema: z.object({ success: z.boolean(), error: z.string() }),
          },
        },
      },
      '409': {
        description: 'User is already a member',
        content: {
          'application/json': {
            schema: z.object({ success: z.boolean(), error: z.string() }),
          },
        },
      },
    },
  }

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>()
    const workspaceId = parseInt(c.req.param('workspaceId') ?? '0')
    const { email, role } = data.body
    const db = createDb(c.env)

    // Look up the target user by email
    const [targetUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!targetUser) {
      return c.json({ success: false, error: 'No user found with that email address' }, 404)
    }

    // Check if already a member
    const [existing] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, targetUser.id),
        ),
      )
      .limit(1)

    if (existing) {
      return c.json({ success: false, error: 'User is already a member of this workspace' }, 409)
    }

    const now = new Date().toISOString()

    const [member] = await db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId: targetUser.id,
        role,
        createdAt: now,
      })
      .returning()

    if (!member) {
      return c.json({ success: false, error: 'Failed to add member' }, 500)
    }

    return c.json(
      {
        success: true,
        member: {
          id: member.id,
          workspaceId: member.workspaceId,
          userId: member.userId,
          role: member.role,
          user: {
            id: targetUser.id,
            email: targetUser.email,
            name: targetUser.name,
          },
          createdAt: member.createdAt,
        },
      },
      201,
    )
  }
}
