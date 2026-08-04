import type {
  WorkspaceListResponse,
  WorkspaceCreateResponse,
  WorkspaceSingleResponse,
  WorkspaceMemberListResponse,
} from '@edgekit/shared'

export async function fetchWorkspaces(): Promise<WorkspaceListResponse> {
  const res = await fetch('/api/workspaces')
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Failed to fetch workspaces')
  }
  return res.json() as Promise<WorkspaceListResponse>
}

export async function fetchWorkspace(workspaceId: number): Promise<WorkspaceSingleResponse> {
  const res = await fetch(`/api/workspaces/${workspaceId}`)
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Failed to fetch workspace')
  }
  return res.json() as Promise<WorkspaceSingleResponse>
}

export async function createWorkspace(
  name: string,
  slug: string,
): Promise<WorkspaceCreateResponse> {
  const res = await fetch('/api/workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, slug }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Failed to create workspace')
  }
  return res.json() as Promise<WorkspaceCreateResponse>
}

export async function fetchWorkspaceMembers(
  workspaceId: number,
): Promise<WorkspaceMemberListResponse> {
  const res = await fetch(`/api/workspaces/${workspaceId}/members`)
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Failed to fetch members')
  }
  return res.json() as Promise<WorkspaceMemberListResponse>
}
