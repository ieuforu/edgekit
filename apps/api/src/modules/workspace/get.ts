import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq, and, count } from 'drizzle-orm'
import { createDb } from '../../db'
import { workspaces, workspaceMembers } from '../../db/schema'
import type { AppContext } from '../../types'

export class WorkspaceGet extends OpenAPIRoute {
  schema = {
    tags: ['Workspace'],
    summary: 'Get workspace details',
    responses: {
      '200': {
        description: 'Workspace details',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              workspace: z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string(),
                ownerId: z.number(),
                role: z.string(),
                memberCount: z.number(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      '404': {
        description: 'Workspace not found',
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
    const userId = c.get('userId')
    const workspaceId = parseInt(c.req.param('workspaceId') ?? '0')
    const db = createDb(c.env)

    // Check membership
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      )
      .limit(1)

    if (!membership) {
      return c.json({ success: false, error: 'Workspace not found or access denied' }, 404)
    }

    // Get workspace
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1)

    if (!workspace) {
      return c.json({ success: false, error: 'Workspace not found' }, 404)
    }

    // Get member count
    const [countResult] = await db
      .select({ memberCount: count() })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId))

    return c.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        ownerId: workspace.ownerId,
        role: membership.role,
        memberCount: countResult?.memberCount ?? 0,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      },
    })
  }
}
