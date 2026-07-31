import { z } from 'zod'

// ─── Worker Bindings ───

export type Bindings = {
  DB: D1Database
}

// ─── Zod Schema (for OpenAPI / validation) ───
// Note: field names use camelCase to match Drizzle ORM output

export const Task = z.object({
  id: z.number().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  dueDate: z.iso.date().optional().nullable(),
  userId: z.number().optional().nullable(),
})

export type TaskType = z.infer<typeof Task>

// ─── API Response Types ───

export type TaskListResponse = {
  success: boolean
  tasks: TaskType[]
}

export type TaskCreateResponse = {
  success: boolean
  task: TaskType
}

export type TaskSingleResponse = TaskCreateResponse

export type TaskDeleteResponse = {
  success: boolean
  result: {
    task: TaskType
  }
}

export type ApiErrorResponse = {
  success: false
  error: string
}

// ─── Auth Types ───

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type LoginRequest = z.infer<typeof LoginSchema>

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
})

export type RegisterRequest = z.infer<typeof RegisterSchema>

export type AuthResponse = {
  success: boolean
  token: string
  user: {
    id: number
    email: string
    name: string
  }
}
