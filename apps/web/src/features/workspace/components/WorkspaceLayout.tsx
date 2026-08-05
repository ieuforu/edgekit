import type { ReactNode } from 'react'
import WorkspaceSidebar from '@/features/workspace/components/WorkspaceSidebar'
import { WorkspaceSelector } from '@/features/workspace/components/WorkspaceSelector'
import type { WorkspaceListItem } from '@/features/workspace/hooks'
import { LogOut } from 'lucide-react'

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
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <WorkspaceSelector
              workspaces={workspaces}
              currentWorkspace={workspace}
              onSelect={onSelectWorkspace}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-gray-600 sm:inline">
                {user.email}
              </span>
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
