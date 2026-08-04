import type { Context } from 'hono'

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
export {
  Workspace,
  WorkspaceMember,
  Project,
  Issue,
  WorkspaceRole,
  ProjectStatus,
  IssueStatus,
  IssuePriority,
} from '@edgekit/shared'

export type {
  Bindings,
  WorkspaceType,
  WorkspaceMemberType,
  ProjectType,
  IssueType,
  WorkspaceListResponse,
  WorkspaceCreateResponse,
  WorkspaceSingleResponse,
  WorkspaceDeleteResponse,
  ProjectListResponse,
  ProjectCreateResponse,
  ProjectSingleResponse,
  ProjectDeleteResponse,
  IssueListResponse,
  IssueCreateResponse,
  IssueSingleResponse,
  IssueDeleteResponse,
  WorkspaceMemberListResponse,
  WorkspaceMemberCreateResponse,
  WorkspaceMemberDeleteResponse,
  ApiErrorResponse,
} from '@edgekit/shared'

export { LoginSchema, RegisterSchema } from '@edgekit/shared'
export type { AuthResponse } from '@edgekit/shared'
