import { motion } from 'motion/react'
import { ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { WorkspaceListItem } from '@/features/workspace/hooks'

interface WorkspaceSelectorProps {
  workspaces: WorkspaceListItem[]
  currentWorkspace: WorkspaceListItem
  onSelect: (workspaceId: number) => void
}

export function WorkspaceSelector({
  workspaces,
  currentWorkspace,
  onSelect,
}: WorkspaceSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-900 focus:outline-none">
        <span className="max-w-[140px] truncate">{currentWorkspace.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {workspaces.map((ws, index) => (
          <motion.div
            key={ws.id ?? ws.slug}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.15 }}
          >
            <DropdownMenuItem
              onClick={() => {
                if (ws.id != null) onSelect(ws.id)
              }}
              className="cursor-pointer gap-2 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-900">{ws.name}</p>
                <p className="truncate text-[11px] text-gray-400">{ws.role}</p>
              </div>
              {ws.id != null && ws.id === currentWorkspace.id && (
                <Check className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              )}
            </DropdownMenuItem>
          </motion.div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
