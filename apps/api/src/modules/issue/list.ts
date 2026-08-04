import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq, and, inArray, type SQL } from 'drizzle-orm'
import { createDb } from '../../db'
import { issues, users, projects } from '../../db/schema'
import type { AppContext } from '../../types'
import { checkWorkspaceMembership } from '../auth/workspace-auth'

export class IssueList extends OpenAPIRoute {
  schema = {
    tags: ['Issue'],
    summary: 'Get issues with filtering and pagination',
    request: {
      query: z.object({
        projectId: z.string().optional(),
        status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
        priority: z.enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        assignee: z.string().optional(),
        page: z.string().default('1').transform(Number),
        limit: z.string().default('20').transform(Number),
      }),
    },
    responses: {
      '200': {
        description: 'Paginated list of issues',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              issues: z.array(
                z.object({
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
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              ),
              pagination: z.object({
                page: z.number(),
                limit: z.number(),
                total: z.number(),
                totalPages: z.number(),
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
    const { projectId, status, priority, assignee, page, limit } = data.query
    const userId = c.get('userId')

    const db = createDb(c.env)

    // If projectId is provided, verify membership via the project's workspace
    if (projectId) {
      const [project] = await db
        .select({ workspaceId: projects.workspaceId })
        .from(projects)
        .where(eq(projects.id, parseInt(projectId)))
        .limit(1)

      if (!project) {
        return c.json({ success: false, error: 'Project not found' }, 404)
      }

      const membership = await checkWorkspaceMembership(db, project.workspaceId, userId, 'VIEWER')
      if (!membership) {
        return c.json(
          { success: false, error: 'You must be a member of this workspace to view issues' },
          403,
        )
      }
    }

    // Build conditions
    const conditions: SQL[] = []

    if (projectId) {
      conditions.push(eq(issues.projectId, parseInt(projectId)))
    }
    if (status) {
      conditions.push(eq(issues.status, status))
    }
    if (priority) {
      conditions.push(eq(issues.priority, priority))
    }
    if (assignee) {
      conditions.push(eq(issues.assigneeId, parseInt(assignee)))
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get all matching issues (for counting)
    const allIssues = await db.select().from(issues).where(whereClause)
    const total = allIssues.length
    const totalPages = Math.ceil(total / limit)

    // Get paginated issues
    const offset = (page - 1) * limit
    const paginatedIssues = allIssues.slice(offset, offset + limit)

    // Get creator info for each issue
    const creatorIds = [...new Set(paginatedIssues.map((i) => i.creatorId))]
    const creatorList =
      creatorIds.length > 0
        ? await db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(users)
            .where(inArray(users.id, creatorIds))
        : []

    const result = paginatedIssues.map((i) => {
      const creator = creatorList.find((u) => u.id === i.creatorId)
      return {
        id: i.id,
        projectId: i.projectId,
        title: i.title,
        description: i.description,
        status: i.status,
        priority: i.priority,
        assigneeId: i.assigneeId,
        creatorId: i.creatorId,
        creator: creator ?? undefined,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }
    })

    return c.json({
      success: true,
      issues: result,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }
}
