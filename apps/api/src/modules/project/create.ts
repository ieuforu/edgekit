import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { createDb } from '../../db'
import { projects } from '../../db/schema'
import type { AppContext } from '../../types'
import { checkWorkspaceMembership } from '../auth/workspace-auth'

export class ProjectCreate extends OpenAPIRoute {
  schema = {
    tags: ['Project'],
    summary: 'Create a new project',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              workspaceId: z.number(),
              name: z.string().min(1).max(100),
              description: z.string().max(500).optional(),
              status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
            }),
          },
        },
      },
    },
    responses: {
      '201': {
        description: 'Project created successfully',
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
    const { workspaceId, name, description, status } = data.body
    const userId = c.get('userId')

    const db = createDb(c.env)

    // Verify workspace membership (MEMBER role required for writes)
    const membership = await checkWorkspaceMembership(db, workspaceId, userId, 'MEMBER')
    if (!membership) {
      return c.json(
        { success: false, error: 'You must be a MEMBER of this workspace to create projects' },
        403,
      )
    }

    const now = new Date().toISOString()

    const [project] = await db
      .insert(projects)
      .values({
        workspaceId,
        name,
        description: description ?? null,
        status,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    if (!project) {
      return c.json({ success: false, error: 'Failed to create project' }, 500)
    }

    return c.json(
      {
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
      },
      201,
    )
  }
}
