import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq, inArray } from 'drizzle-orm'
import { createDb } from '../../db'
import { workspaceMembers, users } from '../../db/schema'
import type { AppContext } from '../../types'

export class WorkspaceMembers extends OpenAPIRoute {
  schema = {
    tags: ['Workspace'],
    summary: 'Get workspace member list',
    responses: {
      '200': {
        description: 'List of workspace members',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              members: z.array(
                z.object({
                  id: z.number(),
                  workspaceId: z.number(),
                  userId: z.number(),
                  role: z.string(),
                  user: z.object({
                    id: z.number(),
                    email: z.string(),
                    name: z.string(),
                  }),
                  createdAt: z.string(),
                }),
              ),
            }),
          },
        },
      },
    },
  }

  async handle(c: AppContext) {
    const workspaceId = parseInt(c.req.param('workspaceId') ?? '0')
    const db = createDb(c.env)

    // Get all members for this workspace
    const members = await db
      .select({
        id: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        createdAt: workspaceMembers.createdAt,
      })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId))

    if (members.length === 0) {
      return c.json({ success: true, members: [] })
    }

    // Fetch user details for each member
    const userIds = members.map((m) => m.userId)
    const userList = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(inArray(users.id, userIds))

    const result = members.map((m) => {
      const user = userList.find((u) => u.id === m.userId)
      return {
        ...m,
        user: user ?? { id: m.userId, email: '', name: '' },
      }
    })

    return c.json({ success: true, members: result })
  }
}
