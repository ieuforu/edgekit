import { useState, useCallback, useMemo } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { AnimatePresence } from 'motion/react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import KanbanBoard from '@/features/issue/components/KanbanBoard'
import IssueDetailPanel from '@/features/issue/components/IssueDetailPanel'
import IssueFilterBar from '@/features/issue/components/IssueFilterBar'
import CreateIssueDialog from '@/features/issue/components/CreateIssueDialog'
import { useIssues, useCreateIssue, useUpdateIssue, useDeleteIssue } from '@/features/issue/hooks'
import LoadingSkeleton from '@/components/layout/LoadingSkeleton'
import { useWorkspaces } from '@/features/workspace/hooks'

export const Route = createFileRoute(
  '/workspace/$workspaceId/projects/$projectId',
)({
  validateSearch: (search: Record<string, unknown>) => ({
    issueId: search.issueId ? Number(search.issueId) : (undefined as number | undefined),
    status: (typeof search.status === 'string' ? search.status : undefined) as string | undefined,
    priority: (typeof search.priority === 'string' ? search.priority : undefined) as string | undefined,
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
  const workspace = workspaces.find((w) => w.id === workspaceId)

  const filters = useMemo(
    () => ({
      projectId,
      status: statusFilter ?? undefined,
      priority: priorityFilter ?? undefined,
    }),
    [projectId, statusFilter, priorityFilter],
  )

  const { data: issues, isLoading } = useIssues(filters)
  const createIssueMutation = useCreateIssue(filters)
  const updateIssueMutation = useUpdateIssue(filters)
  const deleteIssueMutation = useDeleteIssue(filters)

  const selectedIssue = issues?.find((i) => i.id === selectedIssueId)

  // --- Search param navigation helpers ---

  const updateSearch = useCallback(
    (patch: Record<string, unknown>) => {
      router.navigate({
        to: '/workspace/$workspaceId/projects/$projectId',
        params: { workspaceId: String(workspaceId), projectId: String(projectId) },
        search: (prev) => ({
          issueId: prev.issueId,
          status: prev.status,
          priority: prev.priority,
          ...patch,
        }),
        replace: true,
      })
    },
    [router, workspaceId, projectId],
  )

  const handleStatusChange = useCallback(
    (status: string | null) => {
      updateSearch({ status: status ?? undefined })
    },
    [updateSearch],
  )

  const handlePriorityChange = useCallback(
    (priority: string | null) => {
      updateSearch({ priority: priority ?? undefined })
    },
    [updateSearch],
  )

  const handleIssueClick = useCallback(
    (issueId: number) => {
      updateSearch({ issueId })
    },
    [updateSearch],
  )

  const handleCloseIssue = useCallback(() => {
    updateSearch({ issueId: undefined })
  }, [updateSearch])

  // --- Issue CRUD ---

  const handleStatusChangeOnIssue = useCallback(
    (issueId: number, newStatus: string) => {
      updateIssueMutation.mutate({ issueId, status: newStatus })
    },
    [updateIssueMutation],
  )

  const handleUpdateIssue = useCallback(
    (issueId: number, data: { title?: string; description?: string; status?: string; priority?: string }) => {
      updateIssueMutation.mutate({ issueId, ...data })
    },
    [updateIssueMutation],
  )

  const handleDeleteIssue = useCallback(
    (issueId: number) => {
      deleteIssueMutation.mutate(issueId)
    },
    [deleteIssueMutation],
  )

  const handleBackToProjects = useCallback(() => {
    router.navigate({
      to: '/workspace/$workspaceId',
      params: { workspaceId: String(workspaceId) },
    })
  }, [router, workspaceId])

  // --- Loading ---

  if (wsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSkeleton />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSkeleton />
      </div>
    )
  }

  // --- Render ---

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={handleBackToProjects}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Issues</h1>
        </div>
        <Button onClick={() => setCreateIssueOpen(true)}>
          <Plus className="h-4 w-4" />
          New Issue
        </Button>
      </div>

      {/* Filters */}
      <IssueFilterBar
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
      />

      {/* Kanban Board */}
      <KanbanBoard
        issues={issues ?? []}
        onIssueClick={handleIssueClick}
        onStatusChange={handleStatusChangeOnIssue}
        onDelete={handleDeleteIssue}
        isLoading={isLoading}
      />

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedIssue && (
          <IssueDetailPanel
            key={selectedIssue.id}
            issue={selectedIssue}
            onClose={handleCloseIssue}
            onUpdate={handleUpdateIssue}
            onDelete={(issueId) => {
              handleDeleteIssue(issueId)
              handleCloseIssue()
            }}
          />
        )}
      </AnimatePresence>

      {/* Create Issue Dialog */}
      <CreateIssueDialog
        open={createIssueOpen}
        onOpenChange={setCreateIssueOpen}
        projectId={projectId}
        createIssue={(data) => createIssueMutation.mutate(data)}
        isPending={createIssueMutation.isPending}
      />
    </div>
  )
}
