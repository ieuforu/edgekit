import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { projects } from '../../db/schema'
import type { AppContext } from '../../types'
import { checkWorkspaceMembership } from '../auth/workspace-auth'

export class ProjectList extends OpenAPIRoute {
  schema = {
    tags: ['Project'],
    summary: 'Get all projects in a workspace',
    request: {
      query: z.object({
        workspaceId: z.string().transform(Number),
      }),
    },
    responses: {
      '200': {
        description: 'List of projects',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              projects: z.array(
                z.object({
                  id: z.number(),
                  workspaceId: z.number(),
                  name: z.string(),
                  description: z.string().nullable().optional(),
                  status: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              ),
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
    const workspaceId = data.query.workspaceId
    const userId = c.get('userId')

    const db = createDb(c.env)

    // Verify workspace membership
    const membership = await checkWorkspaceMembership(db, workspaceId, userId, 'VIEWER')
    if (!membership) {
      return c.json(
        { success: false, error: 'You must be a member of this workspace to view projects' },
        403,
      )
    }

    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId))

    return c.json({
      success: true,
      projects: projectList.map((p) => ({
        id: p.id,
        workspaceId: p.workspaceId,
        name: p.name,
        description: p.description,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    })
  }
}
