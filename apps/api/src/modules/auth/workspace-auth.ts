import type { Context, Next } from 'hono'
import { createDb } from '../../db'
import { workspaceMembers, projects, issues } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
}

export type WorkspaceAuthEnv = {
  Bindings: import('@edgekit/shared').Bindings
  Variables: {
    userId: number
    userEmail: string
    userName: string
    workspaceRole: WorkspaceRole
  }
}

/**
 * Middleware that checks if the authenticated user is a member of the workspace.
 * Use for routes where :workspaceId is in the URL path.
 *
 * @param requiredRole - Minimum role required (default: VIEWER for read, MEMBER for write)
 */
export function requireWorkspaceRole(requiredRole: WorkspaceRole = 'VIEWER') {
  return async (c: Context<WorkspaceAuthEnv>, next: Next) => {
    const userId = c.get('userId')
    if (!userId) {
      return c.json({ success: false, error: 'Authentication required' }, 401)
    }

    // Extract workspaceId from params
    const workspaceId = c.req.param('workspaceId')
    if (!workspaceId) {
      return c.json({ success: false, error: 'Workspace ID is required' }, 400)
    }

    const db = createDb(c.env)

    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, parseInt(workspaceId)),
          eq(workspaceMembers.userId, userId),
        ),
      )
      .limit(1)

    if (!membership) {
      return c.json({ success: false, error: 'You are not a member of this workspace' }, 403)
    }

    const userRoleLevel = ROLE_HIERARCHY[membership.role as WorkspaceRole] ?? 0
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      return c.json(
        {
          success: false,
          error: `Insufficient permissions. Required: ${requiredRole}, your role: ${membership.role}`,
        },
        403,
      )
    }

    c.set('workspaceRole', membership.role as WorkspaceRole)

    await next()
  }
}

/**
 * Helper: Check if a user has the required role in a workspace.
 * Returns the membership or null if not a member.
 */
export async function checkWorkspaceMembership(
  db: ReturnType<typeof createDb>,
  workspaceId: number,
  userId: number,
  requiredRole: WorkspaceRole = 'VIEWER',
) {
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1)

  if (!membership) {
    return null
  }

  const userRoleLevel = ROLE_HIERARCHY[membership.role as WorkspaceRole] ?? 0
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole]

  if (userRoleLevel < requiredRoleLevel) {
    return null
  }

  return membership
}

/**
 * Helper: Get workspace ID from a project ID.
 */
export async function getWorkspaceIdFromProject(
  db: ReturnType<typeof createDb>,
  projectId: number,
): Promise<number | null> {
  const [project] = await db
    .select({ workspaceId: projects.workspaceId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  return project?.workspaceId ?? null
}

/**
 * Helper: Get workspace ID from an issue ID (via its project).
 */
export async function getWorkspaceIdFromIssue(
  db: ReturnType<typeof createDb>,
  issueId: number,
): Promise<number | null> {
  const [issue] = await db
    .select({ projectId: issues.projectId })
    .from(issues)
    .where(eq(issues.id, issueId))
    .limit(1)

  if (!issue) return null

  return getWorkspaceIdFromProject(db, issue.projectId)
}
