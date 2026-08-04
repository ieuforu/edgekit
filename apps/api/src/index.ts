import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings } from '@edgekit/shared'
import type { AuthResponse } from '@edgekit/shared'

// Auth modules
import { AuthRegister } from './modules/auth/register'
import { AuthLogin } from './modules/auth/login'
import { AuthLogout } from './modules/auth/logout'
import { AuthMe } from './modules/auth/me'

// Workspace modules
import { WorkspaceCreate } from './modules/workspace/create'
import { WorkspaceList } from './modules/workspace/list'
import { WorkspaceGet } from './modules/workspace/get'
import { WorkspaceMembers } from './modules/workspace/members'

// Project modules
import { ProjectCreate } from './modules/project/create'
import { ProjectList } from './modules/project/list'
import { ProjectGet } from './modules/project/get'
import { ProjectUpdate } from './modules/project/update'
import { ProjectDelete } from './modules/project/delete'

// Issue modules
import { IssueCreate } from './modules/issue/create'
import { IssueList } from './modules/issue/list'
import { IssueGet } from './modules/issue/get'
import { IssueUpdate } from './modules/issue/update'
import { IssueDelete } from './modules/issue/delete'

// Middleware
import { authMiddleware } from './middleware/auth'
import { requireWorkspaceRole } from './modules/auth/workspace-auth'

// ── Hono app ─────────────────────────────────────────────────────
const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.use('*', cors())

// Chanfana OpenAPI docs + validation
const openapi = fromHono(app, {
  docs_url: '/',
})

// ═══════════════════════════════════════════════════════════════════
// Auth Routes
// ═══════════════════════════════════════════════════════════════════

// Public auth routes — no middleware
openapi.post('/auth/register', AuthRegister)
openapi.post('/auth/login', AuthLogin)

// Protected auth routes — authMiddleware applied per-route via Hono
app.use('/auth/logout', authMiddleware)
app.use('/auth/me', authMiddleware)
openapi.post('/auth/logout', AuthLogout)
openapi.get('/auth/me', AuthMe)

// ═══════════════════════════════════════════════════════════════════
// Workspace Routes
// ═══════════════════════════════════════════════════════════════════

// Create & list workspaces — auth only (no workspace membership needed)
app.use('/workspaces', authMiddleware)
openapi.post('/workspaces', WorkspaceCreate)
openapi.get('/workspaces', WorkspaceList)

// Workspace detail & members — auth + workspace membership
app.use('/workspaces/:workspaceId', authMiddleware, requireWorkspaceRole('VIEWER'))
openapi.get('/workspaces/:workspaceId', WorkspaceGet)
openapi.get('/workspaces/:workspaceId/members', WorkspaceMembers)

// ═══════════════════════════════════════════════════════════════════
// Project Routes
// ═══════════════════════════════════════════════════════════════════

// All project routes require auth; workspace membership is checked inside handlers
// (since workspaceId comes from body/query/project lookup, not URL path)
app.use('/projects', authMiddleware)
openapi.post('/projects', ProjectCreate)
openapi.get('/projects', ProjectList)

app.use('/projects/:projectId', authMiddleware)
openapi.get('/projects/:projectId', ProjectGet)
openapi.patch('/projects/:projectId', ProjectUpdate)
openapi.delete('/projects/:projectId', ProjectDelete)

// ═══════════════════════════════════════════════════════════════════
// Issue Routes
// ═══════════════════════════════════════════════════════════════════

// All issue routes require auth; workspace membership is checked inside handlers
app.use('/issues', authMiddleware)
openapi.post('/issues', IssueCreate)
openapi.get('/issues', IssueList)

app.use('/issues/:issueId', authMiddleware)
openapi.get('/issues/:issueId', IssueGet)
openapi.patch('/issues/:issueId', IssueUpdate)
openapi.delete('/issues/:issueId', IssueDelete)

// ═══════════════════════════════════════════════════════════════════
// Health check
// ═══════════════════════════════════════════════════════════════════

app.get('/hello', (c) => c.json({ message: 'hello from worker' }))

// ── Hono RPC Type Definition ─────────────────────────────────────
// Purely for type inference — never runs at runtime.
const rpcRoutes = new Hono<{ Bindings: Bindings }>().basePath('/api')

// Auth routes
rpcRoutes.post('/auth/register', (c) => c.json({} as AuthResponse))
rpcRoutes.post('/auth/login', (c) => c.json({} as AuthResponse))
rpcRoutes.post('/auth/logout', (c) => c.json({ success: true, message: '' }))
rpcRoutes.get('/auth/me', (c) => c.json({ success: true, user: { id: 0, email: '', name: '' } }))

// Workspace routes
rpcRoutes.post('/workspaces', (c) =>
  c.json({ success: true, workspace: { id: 0, name: '', slug: '', ownerId: 0, createdAt: '', updatedAt: '' } }),
)
rpcRoutes.get('/workspaces', (c) => c.json({ success: true, workspaces: [] }))
rpcRoutes.get('/workspaces/:workspaceId', (c) =>
  c.json({ success: true, workspace: { id: 0, name: '', slug: '', ownerId: 0, role: '', memberCount: 0, createdAt: '', updatedAt: '' } }),
)
rpcRoutes.get('/workspaces/:workspaceId/members', (c) => c.json({ success: true, members: [] }))

// Project routes
rpcRoutes.post('/projects', (c) =>
  c.json({ success: true, project: { id: 0, workspaceId: 0, name: '', status: 'ACTIVE', createdAt: '', updatedAt: '' } }),
)
rpcRoutes.get('/projects', (c) => c.json({ success: true, projects: [] }))
rpcRoutes.get('/projects/:projectId', (c) =>
  c.json({ success: true, project: { id: 0, workspaceId: 0, name: '', status: 'ACTIVE', createdAt: '', updatedAt: '' } }),
)
rpcRoutes.patch('/projects/:projectId', (c) =>
  c.json({ success: true, project: { id: 0, workspaceId: 0, name: '', status: 'ACTIVE', createdAt: '', updatedAt: '' } }),
)
rpcRoutes.delete('/projects/:projectId', (c) =>
  c.json({ success: true, result: { project: { id: 0, workspaceId: 0, name: '' } } }),
)

// Issue routes
rpcRoutes.post('/issues', (c) =>
  c.json({
    success: true,
    issue: { id: 0, projectId: 0, title: '', status: 'TODO', priority: 'NO_PRIORITY', creatorId: 0, createdAt: '', updatedAt: '' },
  }),
)
rpcRoutes.get('/issues', (c) =>
  c.json({ success: true, issues: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
)
rpcRoutes.get('/issues/:issueId', (c) =>
  c.json({
    success: true,
    issue: { id: 0, projectId: 0, title: '', status: 'TODO', priority: 'NO_PRIORITY', creatorId: 0, createdAt: '', updatedAt: '' },
  }),
)
rpcRoutes.patch('/issues/:issueId', (c) =>
  c.json({
    success: true,
    issue: { id: 0, projectId: 0, title: '', status: 'TODO', priority: 'NO_PRIORITY', creatorId: 0, createdAt: '', updatedAt: '' },
  }),
)
rpcRoutes.delete('/issues/:issueId', (c) =>
  c.json({ success: true, result: { issue: { id: 0, projectId: 0, title: '' } } }),
)

rpcRoutes.get('/hello', (c) => c.json({ message: 'hello from worker' }))

export type AppType = typeof rpcRoutes

export default app
