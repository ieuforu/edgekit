import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq, inArray } from 'drizzle-orm'
import { createDb } from '../../db'
import { workspaces, workspaceMembers } from '../../db/schema'
import type { AppContext } from '../../types'

export class WorkspaceList extends OpenAPIRoute {
  schema = {
    tags: ['Workspace'],
    summary: 'Get all workspaces the current user is a member of',
    responses: {
      '200': {
        description: 'List of workspaces',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              workspaces: z.array(
                z.object({
                  id: z.number(),
                  name: z.string(),
                  slug: z.string(),
                  ownerId: z.number(),
                  role: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              ),
            }),
          },
        },
      },
    },
  }

  async handle(c: AppContext) {
    const userId = c.get('userId')
    const db = createDb(c.env)

    // Get all workspaces the user is a member of
    const memberships = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId))

    if (memberships.length === 0) {
      return c.json({ success: true, workspaces: [] })
    }

    const workspaceIds = memberships.map((m) => m.workspaceId)

    // Fetch workspace details
    const workspaceList = await db
      .select()
      .from(workspaces)
      .where(inArray(workspaces.id, workspaceIds))

    // Combine workspace data with role
    const result = workspaceList.map((ws) => {
      const membership = memberships.find((m) => m.workspaceId === ws.id)
      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        ownerId: ws.ownerId,
        role: membership?.role ?? 'VIEWER',
        createdAt: ws.createdAt,
        updatedAt: ws.updatedAt,
      }
    })

    return c.json({ success: true, workspaces: result })
  }
}
