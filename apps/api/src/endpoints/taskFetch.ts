import { NotFoundException, OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { type AppContext, Task } from '../types'
import { createDb } from '../db'
import { tasks } from '../db/schema'

export class TaskFetch extends OpenAPIRoute {
  schema = {
    tags: ['Tasks'],
    summary: 'Get a single Task by slug',
    request: {
      params: z.object({
        taskSlug: z.string().describe('Task slug'),
      }),
    },
    responses: {
      '200': {
        description: 'Returns a single task if found',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              task: Task,
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
    const [result] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.slug, taskSlug), eq(tasks.userId, userId)))

    if (!result) {
      throw new NotFoundException()
    }

    return {
      success: true,
      task: result,
    }
  }
}
