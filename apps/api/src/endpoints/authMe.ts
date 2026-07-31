import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import type { AppContext } from '../types'
import { authMiddleware, type AuthEnv } from '../middleware/auth'

export class AuthMe extends OpenAPIRoute {
  schema = {
    tags: ['Auth'],
    summary: 'Get the currently authenticated user',
    responses: {
      '200': {
        description: 'Returns the current user info',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              user: z.object({
                id: z.number(),
                email: z.string(),
                name: z.string(),
              }),
            }),
          },
        },
      },
      '401': {
        description: 'Not authenticated',
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

  // Apply auth middleware for this route
  middlewares = [authMiddleware]

  async handle(c: AppContext & AuthEnv) {
    return c.json({
      success: true,
      user: {
        id: c.get('userId'),
        email: c.get('userEmail'),
        name: c.get('userName'),
      },
    })
  }
}
