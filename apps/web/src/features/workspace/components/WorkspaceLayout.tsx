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
  activeNav?: string
  onNavigate?: (route: string) => void
  children: ReactNode
}

export default function WorkspaceLayout({
  workspace,
  workspaces,
  user,
  onLogout,
  onSelectWorkspace,
  activeNav,
  onNavigate,
  children,
}: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa]">
      {/* Sidebar */}
      <WorkspaceSidebar
        workspaceName={workspace.name}
        workspaceId={workspace.id}
        activeNav={activeNav}
        onNavigate={onNavigate}
      />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header — ultra minimal */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <WorkspaceSelector
              workspaces={workspaces}
              currentWorkspace={workspace}
              onSelect={onSelectWorkspace}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[11px] font-medium text-gray-500">
                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-xs text-gray-500 sm:inline">{user.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-600"
            >
              <LogOut className="h-3 w-3" />
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
