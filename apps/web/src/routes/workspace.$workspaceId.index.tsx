import { useState, useCallback } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProjectList from '@/features/project/components/ProjectList'
import CreateProjectDialog from '@/features/project/components/CreateProjectDialog'
import LoadingSkeleton from '@/components/layout/LoadingSkeleton'
import { useWorkspaces } from '@/features/workspace/hooks'

export const Route = createFileRoute('/workspace/$workspaceId/')({
  component: WorkspaceIndexRoute,
})

function WorkspaceIndexRoute() {
  const { workspaceId: workspaceIdParam } = Route.useParams()
  const workspaceId = Number(workspaceIdParam)
  const router = useRouter()
  const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces()
  const [createOpen, setCreateOpen] = useState(false)

  const workspace = workspaces.find((w) => w.id === workspaceId)

  const handleProjectClick = useCallback(
    (projectId: number) => {
      router.navigate({
        to: '/workspace/$workspaceId/projects/$projectId',
        params: {
          workspaceId: String(workspaceId),
          projectId: String(projectId),
        },
        search: { issueId: null, status: null, priority: null },
      })
    },
    [router, workspaceId],
  )

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{workspace.name}</h1>
        <p className="mt-0.5 text-sm text-gray-500">Role: {workspace.role}</p>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Projects</h2>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="mt-4">
          <ProjectList
            workspaceId={workspaceId}
            onCreateClick={() => setCreateOpen(true)}
            onProjectClick={handleProjectClick}
          />
        </div>
      </section>

      <CreateProjectDialog
        workspaceId={workspaceId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  )
}
