import { NotFoundException, OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { type AppContext, Task } from '../types'
import { createDb } from '../db'
import { tasks } from '../db/schema'

export class TaskDelete extends OpenAPIRoute {
  schema = {
    tags: ['Tasks'],
    summary: 'Delete a Task',
    request: {
      params: z.object({
        taskSlug: z.string().describe('Task slug'),
      }),
    },
    responses: {
      '200': {
        description: 'Returns if the task was deleted successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              result: z.object({
                task: Task,
              }),
            }),
          },
        },
      },
    },
  }

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>()
    const { taskSlug } = data.params
    const userId = c.get('userId')

    const db = createDb(c.env)

    // First fetch the task (scoped to user) so we can return its data after deletion
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.slug, taskSlug), eq(tasks.userId, userId)))

    if (!task) {
      throw new NotFoundException()
    }

    // Delete the task (scoped to user)
    await db.delete(tasks).where(and(eq(tasks.slug, taskSlug), eq(tasks.userId, userId)))

    // Return the deleted task for confirmation
    return {
      result: {
        task,
      },
      success: true,
    }
  }
}
