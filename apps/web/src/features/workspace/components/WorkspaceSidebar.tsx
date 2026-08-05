import { motion } from 'motion/react'
import { FolderOpen, Users as UsersIcon, Settings } from 'lucide-react'

interface WorkspaceSidebarProps {
  workspaceName: string
  workspaceId?: number
  activeNav?: string
  onNavigate?: (route: string) => void
}

interface NavSection {
  title: string
  items: { label: string; icon: typeof FolderOpen; route: string | null }[]
}

const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Projects', icon: FolderOpen, route: 'projects' },
      { label: 'Users', icon: UsersIcon, route: 'users' },
    ],
  },
  {
    title: 'Settings',
    items: [{ label: 'Settings', icon: Settings, route: null }],
  },
]

export default function WorkspaceSidebar({
  workspaceName,
  workspaceId: _workspaceId,
  activeNav = 'projects',
  onNavigate,
}: WorkspaceSidebarProps) {
  return (
    <motion.aside
      className="flex h-full w-60 shrink-0 flex-col border-r border-gray-200 bg-white"
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
    >
      {/* Workspace header */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-500">
          {workspaceName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{workspaceName}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gray-100" />

      {/* Grouped navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={section.title} className={sIdx > 0 ? 'mt-5' : ''}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = activeNav === item.route
              return (
                <button
                  key={item.label}
                  disabled={!item.route}
                  onClick={() => item.route && onNavigate?.(item.route)}
                  className={`mb-0.5 flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom branding */}
      <div className="border-t border-gray-100 px-5 py-3">
        <p className="text-[11px] font-medium text-gray-300">EdgeKit</p>
      </div>
    </motion.aside>
  )
}
