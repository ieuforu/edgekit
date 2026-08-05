import { motion } from 'motion/react'
import { FolderOpen, Users, Settings } from 'lucide-react'

interface WorkspaceSidebarProps {
  workspaceName: string
}

const navItems = [
  { label: 'Projects', icon: FolderOpen, active: true },
  { label: 'Members', icon: Users, active: false },
  { label: 'Settings', icon: Settings, active: false },
]

export default function WorkspaceSidebar({ workspaceName }: WorkspaceSidebarProps) {
  return (
    <motion.aside
      className="flex h-full w-60 shrink-0 flex-col border-r border-gray-200 bg-gray-50"
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
    >
      {/* Workspace header */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white shadow-sm">
          {workspaceName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{workspaceName}</p>
          <p className="truncate text-xs text-gray-400">Workspace</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gray-200" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              disabled={!item.active}
              className={`mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                item.active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Bottom branding */}
      <div className="border-t border-gray-200 px-5 py-3.5">
        <p className="text-xs font-medium text-gray-400">EdgeKit</p>
      </div>
    </motion.aside>
  )
}
