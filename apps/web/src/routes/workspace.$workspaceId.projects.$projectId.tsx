import { useState, useMemo, useCallback } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import KanbanBoard from '@/features/issue/components/KanbanBoard'
import IssueFilterBar from '@/features/issue/components/IssueFilterBar'
import IssueDetailPanel from '@/features/issue/components/IssueDetailPanel'
import CreateIssueDialog from '@/features/issue/components/CreateIssueDialog'
import LoadingSkeleton from '@/components/layout/LoadingSkeleton'
import { useWorkspaces } from '@/features/workspace/hooks'
import { useIssues, useUpdateIssue, useDeleteIssue } from '@/features/issue/hooks'

export const Route = createFileRoute('/workspace/$workspaceId/projects/$projectId')({
  validateSearch: (search: Record<string, unknown>) => ({
    issueId: search.issueId != null ? Number(search.issueId) : null,
    status: (search.status as string) || null,
    priority: (search.priority as string) || null,
  }),
  component: KanbanRoute,
})

function KanbanRoute() {
  const { workspaceId: workspaceIdParam, projectId: projectIdParam } = Route.useParams()
  const projectId = Number(projectIdParam)
  const workspaceId = Number(workspaceIdParam)
  const router = useRouter()
  const search = Route.useSearch()

  const statusFilter = search.status ?? null
  const priorityFilter = search.priority ?? null
  const selectedIssueId = search.issueId ?? null

  const [createIssueOpen, setCreateIssueOpen] = useState(false)

  const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces()

  const filters = useMemo(
    () => ({
      projectId,
      status: statusFilter ?? undefined,
      priority: priorityFilter ?? undefined,
    }),
    [projectId, statusFilter, priorityFilter],
  )

  const { data: issues, isLoading } = useIssues(filters)
  const updateIssueMutation = useUpdateIssue(filters)
  const deleteIssueMutation = useDeleteIssue(filters)

  const selectedIssue = issues?.find((i) => i.id === selectedIssueId)

  const updateSearch = useCallback(
    (patch: Record<string, unknown>) => {
      const newSearch = { ...search, ...patch }
      // Remove null/undefined keys
      Object.keys(newSearch).forEach((k) => {
        if (newSearch[k] == null) delete newSearch[k]
      })
      router.navigate({ search: newSearch, replace: true })
    },
    [router, search],
  )

  const handleIssueClick = useCallback(
    (issueId: number) => {
      updateSearch({ issueId })
    },
    [updateSearch],
  )

  const handleStatusChangeOnIssue = useCallback(
    (issueId: number, newStatus: string) => {
      updateIssueMutation.mutate({ issueId, status: newStatus })
    },
    [updateIssueMutation],
  )

  const handleUpdateIssue = useCallback(
    (
      issueId: number,
      data: { title?: string; description?: string; status?: string; priority?: string },
    ) => {
      updateIssueMutation.mutate({ issueId, ...data })
    },
    [updateIssueMutation],
  )

  const handleDeleteIssue = useCallback(
    (issueId: number) => {
      deleteIssueMutation.mutate(issueId)
      updateSearch({ issueId: null })
    },
    [deleteIssueMutation, updateSearch],
  )

  if (wsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              router.navigate({
                to: '/workspace/$workspaceId',
                params: { workspaceId: String(workspaceId) },
              })
            }
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Issues</h1>
        </div>
        <Button onClick={() => setCreateIssueOpen(true)}>
          <Plus className="h-4 w-4" />
          New Issue
        </Button>
      </div>

      {/* Filters */}
      <div className="px-6 py-3">
        <IssueFilterBar
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onStatusChange={(s) => updateSearch({ status: s })}
          onPriorityChange={(p) => updateSearch({ priority: p })}
        />
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <KanbanBoard
          issues={issues ?? []}
          onIssueClick={handleIssueClick}
          onStatusChange={handleStatusChangeOnIssue}
          onDelete={handleDeleteIssue}
          isLoading={isLoading}
        />
      </div>

      {/* Detail Panel */}
      {selectedIssue && (
        <IssueDetailPanel
          issue={selectedIssue}
          onClose={() => updateSearch({ issueId: null })}
          onUpdate={handleUpdateIssue}
          onDelete={handleDeleteIssue}
        />
      )}

      {/* Create Dialog */}
      <CreateIssueDialog
        open={createIssueOpen}
        onOpenChange={setCreateIssueOpen}
        projectId={projectId}
      />
    </div>
  )
}
