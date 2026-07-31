import { Hono } from 'hono'
import { hc } from 'hono/client'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import type { Bindings } from '@edgekit/shared'
import {
  type TaskListResponse,
  type TaskSingleResponse,
  type TaskDeleteResponse,
  type AuthResponse,
} from '@edgekit/shared'

// Schema for the PATCH body — all fields optional
const TaskUpdateBody = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().optional().nullable(),
})

// ── Hono RPC type definition (mirrors the API routes) ────────────
// Defines input/output shapes so hc() gets full type inference.
const routeTypes = new Hono<{ Bindings: Bindings }>()
  .basePath('/api')
  // Auth routes
  .post('/auth/register', (c) => c.json({} as AuthResponse))
  .post('/auth/login', (c) => c.json({} as AuthResponse))
  .post('/auth/logout', (c) => c.json({ success: true, message: '' }))
  .get('/auth/me', (c) => c.json({ success: true, user: { id: 0, email: '', name: '' } }))
  // Task routes
  .get('/tasks', (c) => c.json({} as TaskListResponse))
  .post('/tasks', (c) => c.json({} as TaskSingleResponse))
  .get('/tasks/:taskSlug', (c) => c.json({} as TaskSingleResponse))
  .patch('/tasks/:taskSlug', zValidator('json', TaskUpdateBody), (c) =>
    c.json({} as TaskSingleResponse),
  )
  .delete('/tasks/:taskSlug', (c) => c.json({} as TaskDeleteResponse))
  // Health check
  .get('/hello', (c) => c.json({ message: 'hello from worker' }))

type ApiRoutes = typeof routeTypes

// ── Hono RPC client ──────────────────────────────────────────────
// Uses default browser fetch — httpOnly cookies are sent automatically
// for same-origin requests (via Vite proxy in dev, same domain in prod).
export const api = hc<ApiRoutes>('/')
