import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings } from '@edgekit/shared'
import type { AuthResponse } from '@edgekit/shared'
import { AuthRegister } from './endpoints/authRegister'
import { AuthLogin } from './endpoints/authLogin'
import { AuthLogout } from './endpoints/authLogout'
import { AuthMe } from './endpoints/authMe'
import { authMiddleware } from './middleware/auth'

// ── Hono app ─────────────────────────────────────────────────────
const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.use('*', cors())

// Chanfana OpenAPI docs + validation
const openapi = fromHono(app, {
  docs_url: '/',
})

// ── Public auth routes (no auth required) ────────────────────────
openapi.post('/auth/register', AuthRegister)
openapi.post('/auth/login', AuthLogin)

// ── Auth middleware for protected routes ──────────────────────────
// Hono processes middleware in registration order.
// These run before the protected route handlers registered below.
app.use('/auth/logout', authMiddleware)
app.use('/auth/me', authMiddleware)

// ── Protected auth routes ────────────────────────────────────────
openapi.post('/auth/logout', AuthLogout)
openapi.get('/auth/me', AuthMe)

app.get('/hello', (c) => c.json({ message: 'hello from worker' }))

// ── Hono RPC Type Definition ─────────────────────────────────────
// Purely for type inference — never runs at runtime.
const rpcRoutes = new Hono<{ Bindings: Bindings }>().basePath('/api')
rpcRoutes.post('/auth/register', (c) => c.json({} as AuthResponse))
rpcRoutes.post('/auth/login', (c) => c.json({} as AuthResponse))
rpcRoutes.post('/auth/logout', (c) => c.json({ success: true, message: '' }))
rpcRoutes.get('/auth/me', (c) => c.json({ success: true, user: { id: 0, email: '', name: '' } }))
rpcRoutes.get('/hello', (c) => c.json({ message: 'hello from worker' }))

export type AppType = typeof rpcRoutes

export default app
