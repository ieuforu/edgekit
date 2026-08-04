import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWorkspaces, createWorkspace, fetchWorkspace } from '@/features/workspace/api'
import type { WorkspaceType } from '@/features/workspace/types'

// Extended workspace type from list endpoint (includes role)
export interface WorkspaceListItem extends WorkspaceType {
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
}

// Query key factory
export const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (id: number) => ['workspaces', id] as const,
}

// List workspaces
export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: async () => {
      const data = await fetchWorkspaces()
      return data.workspaces as WorkspaceListItem[]
    },
  })
}

// Get single workspace
export function useWorkspace(workspaceId: number | null) {
  return useQuery({
    queryKey: workspaceKeys.detail(workspaceId!),
    queryFn: async () => {
      const data = await fetchWorkspace(workspaceId!)
      return data.workspace
    },
    enabled: workspaceId != null,
  })
}

// Derived hook — not a query, just selects from the list
export function useCurrentWorkspace(workspaces: WorkspaceListItem[], workspaceId: number | null) {
  if (!workspaceId) return null
  return workspaces.find((w) => w.id === workspaceId) ?? null
}

// Create workspace
export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      const data = await createWorkspace(name, slug)
      return data.workspace
    },
    onSuccess: () => {
      // Invalidate and refetch workspace list
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}
