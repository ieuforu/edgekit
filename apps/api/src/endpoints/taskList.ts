import { OpenAPIRoute } from 'chanfana'
import { eq } from 'drizzle-orm'
import type { AppContext } from '../types'
import { createDb } from '../db'
import { tasks } from '../db/schema'

export class TaskList extends OpenAPIRoute {
  async handle(c: AppContext) {
    const userId = c.get('userId')
    const db = createDb(c.env)
    const result = await db.select().from(tasks).where(eq(tasks.userId, userId))

    return {
      success: true,
      tasks: result,
    }
  }
}
