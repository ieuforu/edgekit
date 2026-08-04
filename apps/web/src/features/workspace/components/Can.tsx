import { type ReactNode } from 'react'
import { can } from '@edgekit/shared'
import type { Permission, RoleName } from '@edgekit/shared'
import { useRole } from '@/features/workspace/context'

interface CanProps {
  /** The permission to check */
  permission: Permission
  /** Optional override — skip the RoleContext and use this role directly */
  role?: RoleName | null
  /** Content to render when the permission is satisfied */
  children: ReactNode
  /** Content to render when the permission check fails (defaults to nothing) */
  fallback?: ReactNode
}

/**
 * Conditional render component based on RBAC permissions.
 *
 * Reads the current user's role from {@link useRole} (set via `<RoleProvider>`),
 * then calls the shared `can()` function to decide whether to render `children`.
 *
 * @example
 * ```tsx
 * <Can permission="project:create">
 *   <button>New Project</button>
 * </Can>
 *
 * <Can permission="member:remove" fallback={<span>Insufficient permissions</span>}>
 *   <button>Remove Member</button>
 * </Can>
 * ```
 */
export function Can({ permission, role: overrideRole, children, fallback = null }: CanProps) {
  const contextRole = useRole()
  const role = overrideRole ?? contextRole

  if (!role) return null
  return can(role, permission) ? <>{children}</> : <>{fallback}</>
}
