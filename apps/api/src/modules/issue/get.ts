import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { issues, users } from '../../db/schema'
import type { AppContext } from '../../types'
import { getWorkspaceIdFromIssue, checkWorkspaceMembership } from '../auth/workspace-auth'

export class IssueGet extends OpenAPIRoute {
  schema = {
    tags: ['Issue'],
    summary: 'Get issue details',
    responses: {
      '200': {
        description: 'Issue details',
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
                creator: z
                  .object({
                    id: z.number(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .optional(),
                assignee: z
                  .object({
                    id: z.number(),
                    name: z.string(),
                    email: z.string(),
                  })
                  .nullable()
                  .optional(),
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
    const issueId = parseInt(c.req.param('issueId') ?? '0')
    const userId = c.get('userId')
    const db = createDb(c.env)

    const [issue] = await db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .limit(1)

    if (!issue) {
      return c.json({ success: false, error: 'Issue not found' }, 404)
    }

    // Verify workspace membership
    const workspaceId = await getWorkspaceIdFromIssue(db, issueId)
    if (!workspaceId) {
      return c.json({ success: false, error: 'Issue not found' }, 404)
    }

    const membership = await checkWorkspaceMembership(db, workspaceId, userId, 'VIEWER')
    if (!membership) {
      return c.json(
        { success: false, error: 'You must be a member of this workspace to view this issue' },
        403,
      )
    }

    // Fetch creator and assignee info
    const [creator] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, issue.creatorId))
      .limit(1)

    let assignee = null
    if (issue.assigneeId) {
      const [assigneeUser] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, issue.assigneeId))
        .limit(1)
      assignee = assigneeUser ?? null
    }

    return c.json({
      success: true,
      issue: {
        id: issue.id,
        projectId: issue.projectId,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        assigneeId: issue.assigneeId,
        creatorId: issue.creatorId,
        creator: creator ?? undefined,
        assignee,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      },
    })
  }
}
