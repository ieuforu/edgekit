import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '@/features/auth/hooks'
import LoginPage from '@/features/auth/components/LoginPage'
import RegisterPage from '@/features/auth/components/RegisterPage'
import LoadingSkeleton from '@/components/layout/LoadingSkeleton'
import IssuePage from '@/features/issue/components/IssuePage'
import WorkspaceLayout from '@/features/workspace/components/WorkspaceLayout'
import CreateWorkspaceDialog from '@/features/workspace/components/CreateWorkspaceDialog'
import { useWorkspaces } from '@/features/workspace/hooks'
import { Button } from '@/components/ui/button'

export default function App() {
  const { user, loading: authLoading, logout } = useAuth()
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Workspace state — TanStack Query manages fetching + caching
  const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null)

  // Determine selected workspace: use explicit selection, else default to first
  const effectiveWorkspaceId = selectedWorkspaceId ?? workspaces[0]?.id ?? null
  const currentWorkspace = workspaces.find((w) => w.id === effectiveWorkspaceId) ?? null

  const handleSelectWorkspace = useCallback((id: number) => {
    setSelectedWorkspaceId(id)
  }, [])

  // 1. Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  // 2. Not logged in
  if (!user) {
    return authPage === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthPage('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />
    )
  }

  // 3. Logged in — loading workspaces
  if (wsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  // 4. No workspaces → show create screen
  if (workspaces.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
              <svg
                className="h-8 w-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Create your first workspace</h1>
          <p className="mb-8 text-sm text-gray-500">
            Workspaces let you organize projects and collaborate with your team.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <svg
              className="mr-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create workspace
          </Button>
          <CreateWorkspaceDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={() => {}}
          />
        </motion.div>
      </div>
    )
  }

  // 5. Has workspaces → show workspace layout
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
