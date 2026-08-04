import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { createDb } from '../../db'
import { workspaceMembers } from '../../db/schema'
import type { AppContext } from '../../types'

export class UpdateMemberRole extends OpenAPIRoute {
  schema = {
    tags: ['Workspace Members'],
    summary: "Update a member's role in a workspace",
    description: 'Requires member:update-role permission (OWNER only)',
    request: {
      params: z.object({
        workspaceId: z.string(),
        userId: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: z.object({
              role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Member role updated successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              member: z.object({
                id: z.number(),
                workspaceId: z.number(),
                userId: z.number(),
                role: z.string(),
                createdAt: z.string(),
              }),
            }),
          },
        },
      },
      '403': {
        description: 'Insufficient permissions or cannot modify owner',
        content: {
          'application/json': {
            schema: z.object({ success: z.boolean(), error: z.string() }),
          },
        },
      },
      '404': {
        description: 'Member not found',
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
    const targetUserId = parseInt(c.req.param('userId') ?? '0')
    const { role } = data.body
    const db = createDb(c.env)

    // Find the membership
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, targetUserId),
        ),
      )
      .limit(1)

    if (!membership) {
      return c.json({ success: false, error: 'Member not found in this workspace' }, 404)
    }

    // Prevent modifying the OWNER role
    if (membership.role === 'OWNER') {
      return c.json({ success: false, error: 'Cannot change the role of the workspace owner' }, 403)
    }

    const [updated] = await db
      .update(workspaceMembers)
      .set({ role })
      .where(eq(workspaceMembers.id, membership.id))
      .returning()

    if (!updated) {
      return c.json({ success: false, error: 'Failed to update member role' }, 500)
    }

    return c.json({
      success: true,
      member: {
        id: updated.id,
        workspaceId: updated.workspaceId,
        userId: updated.userId,
        role: updated.role,
        createdAt: updated.createdAt,
      },
    })
  }
}
