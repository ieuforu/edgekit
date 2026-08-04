// ─── Role Definitions ────────────────────────────────────────────

export const RoleHierarchy = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
} as const

export type RoleLevel = (typeof RoleHierarchy)[keyof typeof RoleHierarchy]

// ─── Permission Definitions ──────────────────────────────────────

export const Permissions = {
  // Workspace
  'workspace:update': ['OWNER', 'ADMIN'] as const,
  'workspace:delete': ['OWNER'] as const,

  // Members
  'member:invite': ['OWNER', 'ADMIN'] as const,
  'member:remove': ['OWNER', 'ADMIN'] as const,
  'member:update-role': ['OWNER'] as const,

  // Projects
  'project:create': ['OWNER', 'ADMIN', 'MEMBER'] as const,
  'project:update': ['OWNER', 'ADMIN', 'MEMBER'] as const,
  'project:delete': ['OWNER', 'ADMIN', 'MEMBER'] as const,

  // Issues
  'issue:create': ['OWNER', 'ADMIN', 'MEMBER'] as const,
  'issue:update': ['OWNER', 'ADMIN', 'MEMBER'] as const,
  'issue:delete': ['OWNER', 'ADMIN', 'MEMBER'] as const,
  'issue:assign': ['OWNER', 'ADMIN', 'MEMBER'] as const,
} as const

export type Permission = keyof typeof Permissions

// All valid role strings
export const AllRoles = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const
export type RoleName = (typeof AllRoles)[number]

/**
 * Check whether a role has the given permission.
 *
 * @example
 * can('ADMIN', 'workspace:update') // true
 * can('VIEWER', 'project:create')  // false
 */
export function can(role: RoleName, permission: Permission): boolean {
  const allowedRoles = Permissions[permission]
  if (!allowedRoles) return false
  return (allowedRoles as readonly string[]).includes(role)
}
