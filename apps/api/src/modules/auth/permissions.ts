import type { Context, Next } from 'hono'
import { createDb } from '../../db'
import { workspaceMembers, projects, issues } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { can } from '@edgekit/shared'
import type { Permission, RoleName } from '@edgekit/shared'

/**
 * Resolve the workspace ID from the request context.
 *
 * Resolution strategy:
 *   1. If `:workspaceId` param exists → use it directly.
 *   2. Otherwise look up via URL :projectId → project → workspace.
 *   3. Otherwise look up via body.projectId → project → workspace.
 *   4. Otherwise look up via URL :issueId → issue → project → workspace.
 *   5. Otherwise look up via body.issueId → issue → project → workspace.
 */
async function resolveWorkspaceId(c: Context<any>): Promise<number | null> {
  // 1. Try :workspaceId param
  const wsParam = c.req.param('workspaceId')
  if (wsParam) return parseInt(wsParam)

  // 2. Try :projectId param → project → workspace
  const projectIdParam = c.req.param('projectId')
  if (projectIdParam) {
    const db = createDb(c.env)
    const [project] = await db
      .select({ workspaceId: projects.workspaceId })
      .from(projects)
      .where(eq(projects.id, parseInt(projectIdParam)))
      .limit(1)
    if (project) return project.workspaceId
  }

  // 3. Try :issueId param → issue → project → workspace
  const issueIdParam = c.req.param('issueId')
  if (issueIdParam) {
    const db = createDb(c.env)
    const [issue] = await db
      .select({ projectId: issues.projectId })
      .from(issues)
      .where(eq(issues.id, parseInt(issueIdParam)))
      .limit(1)
    if (issue) {
      const [project] = await db
        .select({ workspaceId: projects.workspaceId })
        .from(projects)
        .where(eq(projects.id, issue.projectId))
        .limit(1)
      if (project) return project.workspaceId
    }
  }

  // 4. Try body.projectId
  try {
    const cloned = c.req.raw.clone()
    const body = (await cloned.json().catch(() => ({}))) as Record<string, unknown>
    if (typeof body.projectId === 'number') {
      const db = createDb(c.env)
      const [project] = await db
        .select({ workspaceId: projects.workspaceId })
        .from(projects)
        .where(eq(projects.id, body.projectId))
        .limit(1)
      if (project) return project.workspaceId
    }
    if (typeof body.issueId === 'number') {
      const db = createDb(c.env)
      const [issue] = await db
        .select({ projectId: issues.projectId })
        .from(issues)
        .where(eq(issues.id, body.issueId))
        .limit(1)
      if (issue) {
        const [project] = await db
          .select({ workspaceId: projects.workspaceId })
          .from(projects)
          .where(eq(projects.id, issue.projectId))
          .limit(1)
        if (project) return project.workspaceId
      }
    }
  } catch {
    // ignore parse errors
  }

  return null
}

/**
 * Core permission-check logic shared by both `requirePermission` and
 * `requirePermissionForMethod`.
 */
async function checkPermission(c: Context<any>, permission: Permission): Promise<Response | null> {
  const userId: number | undefined = c.get('userId' as any)
  if (!userId) {
    return c.json({ success: false, error: 'Authentication required' }, 401)
  }

  const workspaceId = await resolveWorkspaceId(c)
  if (!workspaceId) {
    return c.json(
      { success: false, error: 'Could not determine workspace for permission check' },
      400,
    )
  }

  const db = createDb(c.env)
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .limit(1)

  if (!membership) {
    return c.json({ success: false, error: 'You are not a member of this workspace' }, 403)
  }

  const userRole = membership.role as RoleName
  if (!can(userRole, permission)) {
    return c.json(
      {
        success: false,
        error: `Insufficient permissions: "${permission}" requires a higher role than ${userRole}`,
      },
      403,
    )
  }

  return null // permission granted
}

/**
 * Middleware factory that checks the authenticated user has the given
 * permission inside the relevant workspace.
 *
 * Use via `app.use()` — matches the existing codebase pattern.
 *
 * Returns 401 if unauthenticated, 403 if permission denied.
 */
export function requirePermission(permission: Permission) {
  return async (c: Context<any>, next: Next) => {
    const denial = await checkPermission(c, permission)
    if (denial) return denial
    await next()
  }
}

/**
 * Method-aware permission middleware.
 * Only enforces the permission for the given HTTP method; passes through
 * for all other methods.
 *
 * Usage:
 *   app.use('/projects/:projectId', requirePermissionForMethod('PATCH', 'project:update'))
 *   app.use('/projects/:projectId', requirePermissionForMethod('DELETE', 'project:delete'))
 */
export function requirePermissionForMethod(method: string, permission: Permission) {
  return async (c: Context<any>, next: Next) => {
    if (c.req.method === method) {
      const denial = await checkPermission(c, permission)
      if (denial) return denial
    }
    await next()
  }
}
