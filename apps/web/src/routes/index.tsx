import { useState } from 'react'
import { createFileRoute, redirect, isRedirect } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/hooks'
import LoadingSkeleton from '@/components/layout/LoadingSkeleton'
import CreateWorkspaceDialog from '@/features/workspace/components/CreateWorkspaceDialog'
import { useWorkspaces } from '@/features/workspace/hooks'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    try {
      const meRes = await fetch('/api/auth/me')
      if (!meRes.ok) {
        throw redirect({ to: '/auth/login' })
      }

      const wsRes = await fetch('/api/workspaces')
      if (!wsRes.ok) return
      const data: { workspaces?: Array<{ id: number }> } = await wsRes.json()

      const firstWorkspace = data.workspaces?.[0]
      if (firstWorkspace) {
        throw redirect({
          to: '/workspace/$workspaceId',
          params: { workspaceId: String(firstWorkspace.id) },
        })
      }
    } catch (error) {
      if (isRedirect(error)) throw error
      // Other errors — fall through to render component
    }
  },
  component: IndexPage,
})

function IndexPage() {
  const { user, loading: authLoading } = useAuth()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces()

  if (authLoading || wsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  if (!user) {
    // This shouldn't render (beforeLoad redirects), but just in case
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  if (workspaces.length > 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

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
