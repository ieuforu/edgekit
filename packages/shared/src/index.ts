import { z } from 'zod'

// ─── Worker Bindings ───

export type Bindings = {
  DB: D1Database
}

// ─── Enums / Constants ───

export const WorkspaceRole = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'])
export type WorkspaceRole = z.infer<typeof WorkspaceRole>

export const ProjectStatus = z.enum(['ACTIVE', 'ARCHIVED'])
export type ProjectStatus = z.infer<typeof ProjectStatus>

export const IssueStatus = z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'])
export type IssueStatus = z.infer<typeof IssueStatus>

export const IssuePriority = z.enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'])
export type IssuePriority = z.infer<typeof IssuePriority>

// ─── Zod Schemas (for OpenAPI / validation) ───

export const Workspace = z.object({
  id: z.number().optional(),
  name: z.string(),
  slug: z.string(),
  ownerId: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type WorkspaceType = z.infer<typeof Workspace>

export const WorkspaceMember = z.object({
  id: z.number().optional(),
  workspaceId: z.number(),
  userId: z.number(),
  role: WorkspaceRole.default('MEMBER'),
  createdAt: z.string().optional(),
})
export type WorkspaceMemberType = z.infer<typeof WorkspaceMember>

export const Project = z.object({
  id: z.number().optional(),
  workspaceId: z.number(),
  name: z.string(),
  description: z.string().optional().nullable(),
  status: ProjectStatus.default('ACTIVE'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type ProjectType = z.infer<typeof Project>

export const Issue = z.object({
  id: z.number().optional(),
  projectId: z.number(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: IssueStatus.default('TODO'),
  priority: IssuePriority.default('NO_PRIORITY'),
  assigneeId: z.number().optional().nullable(),
  creatorId: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type IssueType = z.infer<typeof Issue>

// ─── API Response Types ───

// Workspace responses
export type WorkspaceListResponse = {
  success: boolean
  workspaces: WorkspaceType[]
}

export type WorkspaceCreateResponse = {
  success: boolean
  workspace: WorkspaceType
}

export type WorkspaceSingleResponse = WorkspaceCreateResponse

export type WorkspaceDeleteResponse = {
  success: boolean
  result: {
    workspace: WorkspaceType
  }
}

// Project responses
export type ProjectListResponse = {
  success: boolean
  projects: ProjectType[]
}

export type ProjectCreateResponse = {
  success: boolean
  project: ProjectType
}

export type ProjectSingleResponse = ProjectCreateResponse

export type ProjectDeleteResponse = {
  success: boolean
  result: {
    project: ProjectType
  }
}

// Issue responses
export type IssueListResponse = {
  success: boolean
  issues: IssueType[]
}

export type IssueCreateResponse = {
  success: boolean
  issue: IssueType
}

export type IssueSingleResponse = IssueCreateResponse

export type IssueDeleteResponse = {
  success: boolean
  result: {
    issue: IssueType
  }
}

// Workspace Member responses
export type WorkspaceMemberListResponse = {
  success: boolean
  members: WorkspaceMemberType[]
}

export type WorkspaceMemberCreateResponse = {
  success: boolean
  member: WorkspaceMemberType
}

export type WorkspaceMemberDeleteResponse = {
  success: boolean
  result: {
    member: WorkspaceMemberType
  }
}

// Common error
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
