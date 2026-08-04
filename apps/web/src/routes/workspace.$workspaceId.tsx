import { useCallback } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/hooks'
import LoadingSkeleton from '@/components/layout/LoadingSkeleton'
import WorkspaceLayout from '@/features/workspace/components/WorkspaceLayout'
import IssuePage from '@/features/issue/components/IssuePage'
import { useWorkspaces, type WorkspaceListItem } from '@/features/workspace/hooks'

export const Route = createFileRoute('/workspace/$workspaceId')({
  loader: async ({ params }) => {
    const workspaceId = Number(params.workspaceId)

    // Check if user is authenticated
    const meRes = await fetch('/api/auth/me')
    if (!meRes.ok) {
      throw redirect({ to: '/' })
    }

    // Check if workspace exists
    const res = await fetch(`/api/workspaces/${workspaceId}`)
    if (!res.ok) {
      // Workspace doesn't exist — redirect to first available workspace
      const listRes = await fetch('/api/workspaces')
      if (listRes.ok) {
        const { workspaces } = await listRes.json()
        if (workspaces.length > 0) {
          throw redirect({
            to: '/workspace/$workspaceId',
            params: { workspaceId: String(workspaces[0].id) },
          })
        }
      }
      throw redirect({ to: '/' })
    }
  },
  component: WorkspaceRoute,
})

function WorkspaceRoute() {
  const { workspaceId: workspaceIdParam } = Route.useParams()
  const workspaceId = Number(workspaceIdParam)
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces()

  const handleSelectWorkspace = useCallback(
    (id: number) => {
      router.navigate({ to: '/workspace/$workspaceId', params: { workspaceId: String(id) } })
    },
    [router],
  )

  // Loading
  if (authLoading || wsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  // If somehow we reach here without a valid user or workspace, show skeleton
  // (the loader should have already redirected, but this is a safe fallback)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  const currentWorkspace: WorkspaceListItem | undefined = workspaces.find(
    (w) => w.id === workspaceId,
  )

  if (!currentWorkspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <WorkspaceLayout
      workspace={currentWorkspace}
      workspaces={workspaces}
      user={user}
      onLogout={logout}
      onSelectWorkspace={handleSelectWorkspace}
    >
      <IssuePage workspace={currentWorkspace} />
    </WorkspaceLayout>
  )
}
