import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { issues } from '../../db/schema'
import type { AppContext } from '../../types'
import { getWorkspaceIdFromIssue, checkWorkspaceMembership } from '../auth/workspace-auth'

export class IssueUpdate extends OpenAPIRoute {
  schema = {
    tags: ['Issue'],
    summary: 'Update an issue',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              title: z.string().min(1).max(200).optional(),
              description: z.string().max(5000).optional().nullable(),
              status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
              priority: z.enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
              assigneeId: z.number().optional().nullable(),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Issue updated successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              issue: z.object({
                id: z.number(),
                projectId: z.number(),
                title: z.string(),
                description: z.string().nullable().optional(),
                status: z.string(),
                priority: z.string(),
                assigneeId: z.number().nullable().optional(),
                creatorId: z.number(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      '404': {
        description: 'Issue not found',
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
    const issueId = parseInt(c.req.param('issueId') ?? '0')
    const userId = c.get('userId')
    const updates = data.body

    const db = createDb(c.env)

    // Check if issue exists
    const [existing] = await db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .limit(1)

    if (!existing) {
      return c.json({ success: false, error: 'Issue not found' }, 404)
    }

    // Verify workspace membership (MEMBER role required for writes)
    const workspaceId = await getWorkspaceIdFromIssue(db, issueId)
    if (!workspaceId) {
      return c.json({ success: false, error: 'Issue not found' }, 404)
    }

    const membership = await checkWorkspaceMembership(db, workspaceId, userId, 'MEMBER')
    if (!membership) {
      return c.json(
        { success: false, error: 'You must be a MEMBER of this workspace to update issues' },
        403,
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.assigneeId !== undefined) updateData.assigneeId = updates.assigneeId

    const [updated] = await db
      .update(issues)
      .set(updateData)
      .where(eq(issues.id, issueId))
      .returning()

    if (!updated) {
      return c.json({ success: false, error: 'Failed to update issue' }, 500)
    }

    return c.json({
      success: true,
      issue: {
        id: updated.id,
        projectId: updated.projectId,
        title: updated.title,
        description: updated.description,
        status: updated.status,
        priority: updated.priority,
        assigneeId: updated.assigneeId,
        creatorId: updated.creatorId,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    })
  }
}
