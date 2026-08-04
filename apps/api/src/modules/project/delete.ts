import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { projects } from '../../db/schema'
import type { AppContext } from '../../types'
import { checkWorkspaceMembership } from '../auth/workspace-auth'

export class ProjectDelete extends OpenAPIRoute {
  schema = {
    tags: ['Project'],
    summary: 'Delete a project',
    responses: {
      '200': {
        description: 'Project deleted successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              result: z.object({
                project: z.object({
                  id: z.number(),
                  workspaceId: z.number(),
                  name: z.string(),
                }),
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

    // Get project before deletion
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    // Verify workspace membership (MEMBER role required for writes)
    const membership = await checkWorkspaceMembership(db, project.workspaceId, userId, 'MEMBER')
    if (!membership) {
      return c.json(
        { success: false, error: 'You must be a MEMBER of this workspace to delete projects' },
        403,
      )
    }

    await db.delete(projects).where(eq(projects.id, projectId))

    return c.json({
      success: true,
      result: {
        project: {
          id: project.id,
          workspaceId: project.workspaceId,
          name: project.name,
        },
      },
    })
  }
}
