import { useCallback } from 'react'
import { createFileRoute, Outlet, useRouter, useLocation } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/hooks'
import LoadingSkeleton from '@/components/layout/LoadingSkeleton'
import WorkspaceLayout from '@/features/workspace/components/WorkspaceLayout'
import { useWorkspaces, type WorkspaceListItem } from '@/features/workspace/hooks'

export const Route = createFileRoute('/workspace/$workspaceId')({
  // No beforeLoad — auth is handled by AuthProvider context
  component: WorkspaceLayoutRoute,
})

function WorkspaceLayoutRoute() {
  const { workspaceId: workspaceIdParam } = Route.useParams()
  const workspaceId = Number(workspaceIdParam)
  const router = useRouter()
  const location = useLocation()

  const activeNav = location.pathname.includes('/users') ? 'users' : 'projects'

  const handleNavigate = useCallback(
    (route: string) => {
      if (route === 'projects') {
        router.navigate({
          to: '/workspace/$workspaceId',
          params: { workspaceId: String(workspaceId) },
        })
      } else if (route === 'users') {
        router.navigate({
          to: '/workspace/$workspaceId/users',
          params: { workspaceId: String(workspaceId) },
          search: { userId: null },
        })
      }
    },
    [router, workspaceId],
  )
  const { user, loading: authLoading, logout } = useAuth()
  const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces()

  const handleLogout = useCallback(async () => {
    await logout()
    window.location.href = '/'
  }, [logout])

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

  // Not logged in
  if (!user) {
    window.location.href = '/'
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  // Workspace not found
  const currentWorkspace: WorkspaceListItem | undefined = workspaces.find(
    (w) => w.id === workspaceId,
  )

  if (!currentWorkspace) {
    if (!wsLoading && workspaces.length > 0) {
      router.navigate({
        to: '/workspace/$workspaceId',
        params: { workspaceId: String(workspaces[0].id) },
      })
    }
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
      onLogout={handleLogout}
      onSelectWorkspace={handleSelectWorkspace}
      activeNav={activeNav}
      onNavigate={handleNavigate}
    >
      <Outlet />
    </WorkspaceLayout>
  )
}
