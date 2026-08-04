import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProjects, createProject, deleteProject } from '@/features/project/api'
import type { ProjectType } from '@edgekit/shared'

// Query key factory
export const projectKeys = {
  all: ['projects'] as const,
  list: (workspaceId: number) => ['projects', { workspaceId }] as const,
  detail: (id: number) => ['projects', id] as const,
}

// List projects for a workspace
export function useProjects(workspaceId: number) {
  return useQuery({
    queryKey: projectKeys.list(workspaceId),
    queryFn: async () => {
      const data = await fetchProjects(workspaceId)
      return data.projects
    },
    enabled: workspaceId > 0,
  })
}

// Create project with optimistic update
export function useCreateProject(workspaceId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      createProject(workspaceId, name, description),
    onMutate: async (newProject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.list(workspaceId) })

      // Snapshot previous value
      const previous = queryClient.getQueryData(projectKeys.list(workspaceId))

      // Optimistically update
      queryClient.setQueryData(projectKeys.list(workspaceId), (old: ProjectType[] | undefined) => [
        ...(old ?? []),
        {
            id: Date.now(),
            workspaceId,
            name: newProject.name,
            description: newProject.description ?? null,
            status: 'ACTIVE' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])

      return { previous }
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(projectKeys.list(workspaceId), context.previous)
      }
    },
    onSettled: () => {
      // Refetch to get server truth
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId) })
    },
  })
}

// Delete project with optimistic update
export function useDeleteProject(workspaceId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: number) => deleteProject(projectId),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.list(workspaceId) })
      const previous = queryClient.getQueryData(projectKeys.list(workspaceId))

      queryClient.setQueryData(projectKeys.list(workspaceId), (old: ProjectType[] | undefined) =>
        (old ?? []).filter((p) => p.id !== projectId)
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(projectKeys.list(workspaceId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId) })
    },
  })
}
