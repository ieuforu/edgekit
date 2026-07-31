import type { Context } from 'hono'
import { Task } from '@edgekit/shared'

export type AuthVariables = {
  userId: number
  userEmail: string
  userName: string
}

export type AppContext = Context<{
  Bindings: import('@edgekit/shared').Bindings
  Variables: AuthVariables
}>

// Re-export shared types for use in endpoint files
export { Task }
export { LoginSchema, RegisterSchema } from '@edgekit/shared'
export type {
  Bindings,
  TaskType,
  TaskListResponse,
  TaskCreateResponse,
  TaskSingleResponse,
  TaskDeleteResponse,
  ApiErrorResponse,
} from '@edgekit/shared'
