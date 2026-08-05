import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { projects } from '../../db/schema'
import type { AppContext } from '../../types'
import { checkWorkspaceMembership } from '../auth/workspace-auth'

export class ProjectGet extends OpenAPIRoute {
  schema = {
    tags: ['Project'],
    summary: 'Get project details',
    responses: {
      '200': {
        description: 'Project details',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              project: z.object({
                id: z.number(),
                workspaceId: z.number(),
                name: z.string(),
                description: z.string().nullable().optional(),
                status: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      '404': {
        description: 'Project not found',
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
    const projectId = parseInt(c.req.param('projectId') ?? '0')
    const userId = c.get('userId')
    const db = createDb(c.env)

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)

    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    // Verify workspace membership
    const membership = await checkWorkspaceMembership(db, project.workspaceId, userId, 'VIEWER')
    if (!membership) {
      return c.json(
        { success: false, error: 'You must be a member of this workspace to view this project' },
        403,
      )
    }

    return c.json({
      success: true,
      project: {
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    })
  }
}
