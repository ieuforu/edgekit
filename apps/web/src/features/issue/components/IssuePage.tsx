import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence } from 'motion/react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProjectList from '@/features/project/components/ProjectList'
import CreateProjectDialog from '@/features/project/components/CreateProjectDialog'
import KanbanBoard from '@/features/issue/components/KanbanBoard'
import IssueDetailPanel from '@/features/issue/components/IssueDetailPanel'
import IssueFilterBar from '@/features/issue/components/IssueFilterBar'
import CreateIssueDialog from '@/features/issue/components/CreateIssueDialog'
import { useIssues, useCreateIssue, useUpdateIssue, useDeleteIssue } from '@/features/issue/hooks'
import type { WorkspaceListItem } from '@/features/workspace/hooks'

interface IssuePageProps {
  workspace: WorkspaceListItem
}

function useFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const [statusFilter, setStatusFilter] = useState<string | null>(params.get('status'))
  const [priorityFilter, setPriorityFilter] = useState<string | null>(params.get('priority'))

  const updateUrl = useCallback((status: string | null, priority: string | null) => {
    const url = new URL(window.location.href)
    if (status) url.searchParams.set('status', status)
    else url.searchParams.delete('status')
    if (priority) url.searchParams.set('priority', priority)
    else url.searchParams.delete('priority')
    window.history.replaceState({}, '', url.toString())
  }, [])

  const handleStatusChange = useCallback(
    (status: string | null) => {
      setStatusFilter(status)
      updateUrl(status, priorityFilter)
    },
    [priorityFilter, updateUrl],
  )

  const handlePriorityChange = useCallback(
    (priority: string | null) => {
      setPriorityFilter(priority)
      updateUrl(statusFilter, priority)
    },
    [statusFilter, updateUrl],
  )

  return { statusFilter, priorityFilter, handleStatusChange, handlePriorityChange }
}

export default function IssuePage({ workspace }: IssuePageProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null)
  const [createIssueOpen, setCreateIssueOpen] = useState(false)

  const { statusFilter, priorityFilter, handleStatusChange, handlePriorityChange } = useFiltersFromUrl()

  const filters = useMemo(
    () => ({
      projectId: selectedProjectId ?? undefined,
      status: statusFilter ?? undefined,
      priority: priorityFilter ?? undefined,
    }),
    [selectedProjectId, statusFilter, priorityFilter],
  )

  const { data: issues, isLoading } = useIssues(filters)
  const createIssueMutation = useCreateIssue(filters)
  const updateIssueMutation = useUpdateIssue(filters)
  const deleteIssueMutation = useDeleteIssue(filters)

  const selectedIssue = issues?.find((i) => i.id === selectedIssueId)

  const handleIssueClick = useCallback((issueId: number) => {
    setSelectedIssueId(issueId)
  }, [])

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

  // No project selected — show project list
  if (!selectedProjectId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Role: {workspace.role}</p>
        </div>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          <div className="mt-4">
            <ProjectList
              workspaceId={workspace.id!}
              onCreateClick={() => setCreateOpen(true)}
              onProjectClick={(id) => setSelectedProjectId(id)}
            />
          </div>
        </section>

        <CreateProjectDialog
          workspaceId={workspace.id!}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      </div>
    )
  }

  // Project selected — show Kanban
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => setSelectedProjectId(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
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
            onClose={() => setSelectedIssueId(null)}
            onUpdate={handleUpdateIssue}
            onDelete={(issueId) => {
              handleDeleteIssue(issueId)
              setSelectedIssueId(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Create Issue Dialog */}
      <CreateIssueDialog
        open={createIssueOpen}
        onOpenChange={setCreateIssueOpen}
        projectId={selectedProjectId}
        createIssue={(data) => createIssueMutation.mutate(data)}
        isPending={createIssueMutation.isPending}
      />
    </div>
  )
}
