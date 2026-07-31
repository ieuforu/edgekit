import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { type AppContext, Task } from '../types'
import { createDb } from '../db'
import { tasks } from '../db/schema'

export class TaskCreate extends OpenAPIRoute {
  schema = {
    tags: ['Tasks'],
    summary: 'Create a new Task',
    request: {
      body: {
        content: {
          'application/json': {
            schema: Task,
          },
        },
      },
    },
    responses: {
      '201': {
        description: 'Returns the created task',
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
    const taskToCreate = data.body
    const userId = c.get('userId')

    const db = createDb(c.env)

    // Insert the new task scoped to the authenticated user
    const [created] = await db
      .insert(tasks)
      .values({
        name: taskToCreate.name,
        slug: taskToCreate.slug,
        description: taskToCreate.description ?? null,
        completed: taskToCreate.completed ?? false,
        dueDate: taskToCreate.dueDate,
        userId,
      })
      .returning()

    return c.json(
      {
        success: true,
        task: created ?? null,
      },
      201,
    )
  }
}
