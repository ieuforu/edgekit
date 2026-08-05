import type {
  IssueListResponse,
  IssueCreateResponse,
  IssueSingleResponse,
  IssueDeleteResponse,
} from '@edgekit/shared'

export async function fetchIssues(params: {
  projectId?: number
  status?: string
  priority?: string
  page?: number
  limit?: number
}): Promise<
  IssueListResponse & {
    pagination?: { page: number; limit: number; total: number; totalPages: number }
  }
> {
  const query = new URLSearchParams()
  if (params.projectId !== undefined) query.set('projectId', String(params.projectId))
  if (params.status) query.set('status', params.status)
  if (params.priority) query.set('priority', params.priority)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.limit !== undefined) query.set('limit', String(params.limit))

  const res = await fetch(`/api/issues?${query.toString()}`)
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Failed to fetch issues')
  }
  return res.json()
}

export async function createIssue(data: {
  projectId: number
  title: string
  description?: string
  status?: string
  priority?: string
  assigneeId?: number
}): Promise<IssueCreateResponse> {
  const res = await fetch('/api/issues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errData = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(errData?.error || 'Failed to create issue')
  }
  return res.json()
}

export async function updateIssue(
  issueId: number,
  data: {
    title?: string
    description?: string
    status?: string
    priority?: string
    assigneeId?: number
  },
): Promise<IssueSingleResponse> {
  const res = await fetch(`/api/issues/${issueId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errData = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(errData?.error || 'Failed to update issue')
  }
  return res.json()
}

export async function deleteIssue(issueId: number): Promise<IssueDeleteResponse> {
  const res = await fetch(`/api/issues/${issueId}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Failed to delete issue')
  }
  return res.json()
}
