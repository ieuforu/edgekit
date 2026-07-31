import { NotFoundException, OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { type AppContext, Task } from '../types'
import { createDb } from '../db'
import { tasks } from '../db/schema'

export class TaskUpdate extends OpenAPIRoute {
  schema = {
    tags: ['Tasks'],
    summary: 'Update a Task',
    request: {
      params: z.object({
        taskSlug: z.string().describe('Task slug'),
      }),
      body: {
        content: {
          'application/json': {
            schema: Task.partial(),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Returns the updated task',
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
    const updates = data.body
    const userId = c.get('userId')

    const db = createDb(c.env)

    // First, check if the task exists and belongs to the authenticated user
    const [existing] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.slug, taskSlug), eq(tasks.userId, userId)))

    if (!existing) {
      throw new NotFoundException()
    }

    // Build the update object from provided fields only
    const updateValues: Record<string, unknown> = {}

    if (updates.name !== undefined) {
      updateValues.name = updates.name
    }
    if (updates.slug !== undefined) {
      updateValues.slug = updates.slug
    }
    if (updates.description !== undefined) {
      updateValues.description = updates.description
    }
    if (updates.completed !== undefined) {
      updateValues.completed = updates.completed
    }
    if (updates.dueDate !== undefined) {
      updateValues.dueDate = updates.dueDate
    }

    // If there are fields to update
    if (Object.keys(updateValues).length > 0) {
      // If slug is being changed, check that the new slug doesn't already exist
      if (updates.slug !== undefined && updates.slug !== taskSlug) {
        const [slugExists] = await db
          .select({ id: tasks.id })
          .from(tasks)
          .where(eq(tasks.slug, updates.slug!))

        if (slugExists) {
          return c.json({ success: false, error: 'A task with this slug already exists' }, 409)
        }
      }

      await db
        .update(tasks)
        .set(updateValues)
        .where(and(eq(tasks.slug, taskSlug), eq(tasks.userId, userId)))
    }

    // Determine the final slug to fetch (could be the updated slug)
    const finalSlug = updates.slug ?? taskSlug

    // Fetch and return the updated task (scoped to user)
    const [updated] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.slug, finalSlug), eq(tasks.userId, userId)))

    return {
      success: true,
      task: updated ?? null,
    }
  }
}
