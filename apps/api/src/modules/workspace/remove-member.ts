import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { createDb } from '../../db'
import { workspaceMembers } from '../../db/schema'
import type { AppContext } from '../../types'

export class RemoveMember extends OpenAPIRoute {
  schema = {
    tags: ['Workspace Members'],
    summary: 'Remove a member from a workspace',
    description: 'Requires member:remove permission (ADMIN or OWNER)',
    request: {
      params: z.object({
        workspaceId: z.string(),
        userId: z.string(),
      }),
    },
    responses: {
      '200': {
        description: 'Member removed successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              result: z.object({
                member: z.object({
                  id: z.number(),
                  workspaceId: z.number(),
                  userId: z.number(),
                  role: z.string(),
                }),
              }),
            }),
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
    const workspaceId = parseInt(c.req.param('workspaceId') ?? '0')
    const targetUserId = parseInt(c.req.param('userId') ?? '0')
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

    // Prevent removing the OWNER (use workspace delete instead)
    if (membership.role === 'OWNER') {
      return c.json({ success: false, error: 'Cannot remove the workspace owner' }, 403)
    }

    await db
      .delete(workspaceMembers)
      .where(eq(workspaceMembers.id, membership.id))

    return c.json({
      success: true,
      result: {
        member: {
          id: membership.id,
          workspaceId: membership.workspaceId,
          userId: membership.userId,
          role: membership.role,
        },
      },
    })
  }
}
