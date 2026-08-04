import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { projects } from '../../db/schema'
import type { AppContext } from '../../types'
import { checkWorkspaceMembership } from '../auth/workspace-auth'

export class ProjectUpdate extends OpenAPIRoute {
  schema = {
    tags: ['Project'],
    summary: 'Update a project',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              name: z.string().min(1).max(100).optional(),
              description: z.string().max(500).optional().nullable(),
              status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Project updated successfully',
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
    const data = await this.getValidatedData<typeof this.schema>()
    const projectId = parseInt(c.req.param('projectId') ?? '0')
    const userId = c.get('userId')
    const updates = data.body

    const db = createDb(c.env)

    // Check if project exists
    const [existing] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)

    if (!existing) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    // Verify workspace membership (MEMBER role required for writes)
    const membership = await checkWorkspaceMembership(db, existing.workspaceId, userId, 'MEMBER')
    if (!membership) {
      return c.json(
        { success: false, error: 'You must be a MEMBER of this workspace to update projects' },
        403,
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status

    const [updated] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning()

    if (!updated) {
      return c.json({ success: false, error: 'Failed to update project' }, 500)
    }

    return c.json({
      success: true,
      project: {
        id: updated.id,
        workspaceId: updated.workspaceId,
        name: updated.name,
        description: updated.description,
        status: updated.status,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    })
  }
}
