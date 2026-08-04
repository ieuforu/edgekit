import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { createDb } from '../../db'
import { issues } from '../../db/schema'
import type { AppContext } from '../../types'
import { getWorkspaceIdFromProject, checkWorkspaceMembership } from '../auth/workspace-auth'

export class IssueCreate extends OpenAPIRoute {
  schema = {
    tags: ['Issue'],
    summary: 'Create a new issue',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              projectId: z.number(),
              title: z.string().min(1).max(200),
              description: z.string().max(5000).optional(),
              status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).default('TODO'),
              priority: z.enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('NO_PRIORITY'),
              assigneeId: z.number().optional().nullable(),
            }),
          },
        },
      },
    },
    responses: {
      '201': {
        description: 'Issue created successfully',
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
      '403': {
        description: 'Not a member of the workspace',
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
    const { projectId, title, description, status, priority, assigneeId } = data.body
    const userId = c.get('userId')

    const db = createDb(c.env)

    // Get workspace from project
    const workspaceId = await getWorkspaceIdFromProject(db, projectId)
    if (!workspaceId) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    // Verify workspace membership (MEMBER role required for writes)
    const membership = await checkWorkspaceMembership(db, workspaceId, userId, 'MEMBER')
    if (!membership) {
      return c.json(
        { success: false, error: 'You must be a MEMBER of this workspace to create issues' },
        403,
      )
    }

    const now = new Date().toISOString()

    const [issue] = await db
      .insert(issues)
      .values({
        projectId,
        title,
        description: description ?? null,
        status,
        priority,
        assigneeId: assigneeId ?? null,
        creatorId: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    if (!issue) {
      return c.json({ success: false, error: 'Failed to create issue' }, 500)
    }

    return c.json(
      {
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
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
        },
      },
      201,
    )
  }
}
