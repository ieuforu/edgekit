import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import WorkspaceSidebar from '@/features/workspace/components/WorkspaceSidebar'
import { WorkspaceSelector } from '@/features/workspace/components/WorkspaceSelector'
import type { WorkspaceListItem } from '@/features/workspace/hooks'

interface WorkspaceLayoutProps {
  workspace: WorkspaceListItem
  workspaces: WorkspaceListItem[]
  user: { id: number; email: string; name: string }
  onLogout: () => void
  onSelectWorkspace: (workspaceId: number) => void
  children: ReactNode
}

export default function WorkspaceLayout({
  workspace,
  workspaces,
  user,
  onLogout,
  onSelectWorkspace,
  children,
}: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <WorkspaceSidebar workspaceName={workspace.name} />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <WorkspaceSelector
              workspaces={workspaces}
              currentWorkspace={workspace}
              onSelect={onSelectWorkspace}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm text-gray-600 sm:inline">{user.email}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={onLogout}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign out
            </motion.button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
