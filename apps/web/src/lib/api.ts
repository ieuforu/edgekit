import { Hono } from 'hono'
import { hc } from 'hono/client'
import type { Bindings } from '@edgekit/shared'
import type { AuthResponse } from '@edgekit/shared'

// ── Hono RPC type definition (mirrors the API routes) ────────────
// Defines input/output shapes so hc() gets full type inference.
const routeTypes = new Hono<{ Bindings: Bindings }>()
  .basePath('/api')
  // Auth routes
  .post('/auth/register', (c) => c.json({} as AuthResponse))
  .post('/auth/login', (c) => c.json({} as AuthResponse))
  .post('/auth/logout', (c) => c.json({ success: true, message: '' }))
  .get('/auth/me', (c) => c.json({ success: true, user: { id: 0, email: '', name: '' } }))
  // Health check
  .get('/hello', (c) => c.json({ message: 'hello from worker' }))

type ApiRoutes = typeof routeTypes

// ── Hono RPC client ──────────────────────────────────────────────
// Uses default browser fetch — httpOnly cookies are sent automatically
// for same-origin requests (via Vite proxy in dev, same domain in prod).
export const api = hc<ApiRoutes>('/')
