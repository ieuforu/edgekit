import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchIssues, createIssue, updateIssue, deleteIssue } from '@/features/issue/api'
import type { IssueType } from '@edgekit/shared'

// Query key factory
export const issueKeys = {
  all: ['issues'] as const,
  list: (filters: Record<string, unknown>) => ['issues', filters] as const,
  detail: (id: number) => ['issues', id] as const,
}

type IssueFilters = {
  projectId?: number
  status?: string
  priority?: string
  page?: number
  limit?: number
}

// List issues with filters
export function useIssues(filters: IssueFilters) {
  return useQuery({
    queryKey: issueKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const data = await fetchIssues(filters)
      return data.issues
    },
    enabled: (filters.projectId ?? 0) > 0,
  })
}

// Create issue with optimistic insert
export function useCreateIssue(filters: IssueFilters) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      projectId: number
      title: string
      description?: string
      status?: string
      priority?: string
    }) => createIssue(data),

    onMutate: async (newIssue) => {
      await queryClient.cancelQueries({
        queryKey: issueKeys.list(filters as Record<string, unknown>),
      })

      const previous = queryClient.getQueryData<IssueType[]>(
        issueKeys.list(filters as Record<string, unknown>),
      )

      const optimistic: IssueType = {
        id: Date.now(),
        projectId: newIssue.projectId,
        title: newIssue.title,
        description: newIssue.description ?? null,
        status: (newIssue.status as IssueType['status']) ?? 'TODO',
        priority: (newIssue.priority as IssueType['priority']) ?? 'NO_PRIORITY',
        assigneeId: null,
        creatorId: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData<IssueType[]>(
        issueKeys.list(filters as Record<string, unknown>),
        (old) => [...(old ?? []), optimistic],
      )

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          issueKeys.list(filters as Record<string, unknown>),
          context.previous,
        )
      }
    },

    onSettled: (_data, _error, _vars, context) => {
      if (context?.previous) {
        // Refetch the specific query using the filters from onMutate closure
        queryClient.refetchQueries({ queryKey: issueKeys.list(filters as Record<string, unknown>) })
      }
    },
  })
}

// Update issue with optimistic update
export function useUpdateIssue(filters: IssueFilters) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      issueId,
      ...data
    }: {
      issueId: number
      title?: string
      description?: string
      status?: string
      priority?: string
    }) => updateIssue(issueId, data),

    onMutate: async ({ issueId, ...patch }) => {
      await queryClient.cancelQueries({
        queryKey: issueKeys.list(filters as Record<string, unknown>),
      })

      const previous = queryClient.getQueryData<IssueType[]>(
        issueKeys.list(filters as Record<string, unknown>),
      )

      queryClient.setQueryData<IssueType[]>(
        issueKeys.list(filters as Record<string, unknown>),
        (old) =>
          (old ?? []).map((issue) =>
            issue.id === issueId
              ? { ...issue, ...(patch as Partial<IssueType>), updatedAt: new Date().toISOString() }
              : issue,
          ),
      )

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          issueKeys.list(filters as Record<string, unknown>),
          context.previous,
        )
      }
    },

    onSettled: (_data, _error, _vars, context) => {
      if (context?.previous) {
        queryClient.refetchQueries({ queryKey: issueKeys.list(filters as Record<string, unknown>) })
      }
    },
  })
}

// Delete issue with optimistic remove
export function useDeleteIssue(filters: IssueFilters) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (issueId: number) => deleteIssue(issueId),

    onMutate: async (issueId) => {
      await queryClient.cancelQueries({
        queryKey: issueKeys.list(filters as Record<string, unknown>),
      })

      const previous = queryClient.getQueryData<IssueType[]>(
        issueKeys.list(filters as Record<string, unknown>),
      )

      queryClient.setQueryData<IssueType[]>(
        issueKeys.list(filters as Record<string, unknown>),
        (old) => (old ?? []).filter((issue) => issue.id !== issueId),
      )

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          issueKeys.list(filters as Record<string, unknown>),
          context.previous,
        )
      }
    },

    onSettled: (_data, _error, _vars, context) => {
      if (context?.previous) {
        queryClient.refetchQueries({ queryKey: issueKeys.list(filters as Record<string, unknown>) })
      }
    },
  })
}
