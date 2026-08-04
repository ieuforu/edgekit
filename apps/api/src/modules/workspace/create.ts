import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { workspaces, workspaceMembers } from '../../db/schema'
import type { AppContext } from '../../types'

export class WorkspaceCreate extends OpenAPIRoute {
  schema = {
    tags: ['Workspace'],
    summary: 'Create a new workspace',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              name: z.string().min(1).max(100),
              slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
            }),
          },
        },
      },
    },
    responses: {
      '201': {
        description: 'Workspace created successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              workspace: z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string(),
                ownerId: z.number(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      '409': {
        description: 'Slug already exists',
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
    const { name, slug } = data.body
    const userId = c.get('userId')

    const db = createDb(c.env)

    // Check if slug is taken
    const [existing] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1)

    if (existing) {
      return c.json({ success: false, error: 'A workspace with this slug already exists' }, 409)
    }

    // Create workspace
    const now = new Date().toISOString()
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name,
        slug,
        ownerId: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    if (!workspace) {
      return c.json({ success: false, error: 'Failed to create workspace' }, 500)
    }

    // Add creator as OWNER
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: userId,
      role: 'OWNER',
      createdAt: now,
    })

    return c.json(
      {
        success: true,
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          ownerId: workspace.ownerId,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      },
      201,
    )
  }
}
