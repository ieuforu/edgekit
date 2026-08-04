import { useState, useCallback, useEffect } from 'react'
import type { WorkspaceType } from '@/features/workspace/types'
import { fetchWorkspaces, createWorkspace } from '@/features/workspace/api'

// Extended workspace type from list endpoint (includes role)
export interface WorkspaceListItem extends WorkspaceType {
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWorkspaces()
      setWorkspaces(data.workspaces as WorkspaceListItem[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workspaces')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { workspaces, loading, error, refetch }
}

export function useCurrentWorkspace(workspaces: WorkspaceListItem[], workspaceId: number | null) {
  if (!workspaceId) return null
  return workspaces.find((w) => w.id === workspaceId) ?? null
}

export function useCreateWorkspace() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (name: string, slug: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await createWorkspace(name, slug)
      return data.workspace
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create workspace'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error }
}
