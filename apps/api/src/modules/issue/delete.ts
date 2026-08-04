import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { issues } from '../../db/schema'
import type { AppContext } from '../../types'
import { getWorkspaceIdFromIssue, checkWorkspaceMembership } from '../auth/workspace-auth'

export class IssueDelete extends OpenAPIRoute {
  schema = {
    tags: ['Issue'],
    summary: 'Delete an issue',
    responses: {
      '200': {
        description: 'Issue deleted successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              result: z.object({
                issue: z.object({
                  id: z.number(),
                  projectId: z.number(),
                  title: z.string(),
                }),
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
    const issueId = parseInt(c.req.param('issueId') ?? '0')
    const userId = c.get('userId')
    const db = createDb(c.env)

    // Get issue before deletion
    const [issue] = await db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .limit(1)

    if (!issue) {
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
        { success: false, error: 'You must be a MEMBER of this workspace to delete issues' },
        403,
      )
    }

    await db.delete(issues).where(eq(issues.id, issueId))

    return c.json({
      success: true,
      result: {
        issue: {
          id: issue.id,
          projectId: issue.projectId,
          title: issue.title,
        },
      },
    })
  }
}
