import type {
  ProjectListResponse,
  ProjectCreateResponse,
  ProjectSingleResponse,
  ProjectDeleteResponse,
} from '@edgekit/shared'

export async function fetchProjects(workspaceId: number): Promise<ProjectListResponse> {
  const res = await fetch(`/api/projects?workspaceId=${workspaceId}`)
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Failed to fetch projects')
  }
  return res.json() as Promise<ProjectListResponse>
}

export async function fetchProject(projectId: number): Promise<ProjectSingleResponse> {
  const res = await fetch(`/api/projects/${projectId}`)
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Failed to fetch project')
  }
  return res.json() as Promise<ProjectSingleResponse>
}

export async function createProject(
  workspaceId: number,
  name: string,
  description?: string,
): Promise<ProjectCreateResponse> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId, name, description }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Failed to create project')
  }
  return res.json() as Promise<ProjectCreateResponse>
}

export async function updateProject(
  projectId: number,
  data: { name?: string; description?: string; status?: 'ACTIVE' | 'ARCHIVED' },
): Promise<ProjectSingleResponse> {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errData = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(errData?.error || 'Failed to update project')
  }
  return res.json() as Promise<ProjectSingleResponse>
}

export async function deleteProject(projectId: number): Promise<ProjectDeleteResponse> {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Failed to delete project')
  }
  return res.json() as Promise<ProjectDeleteResponse>
}
