import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'

import IssueCard from '@/features/issue/components/IssueCard'
import type { IssueType } from '@edgekit/shared'

export type IssueStatus = IssueType['status']

const COLUMNS: { status: IssueStatus; label: string; bg: string; tint: string }[] = [
  { status: 'BACKLOG', label: 'Backlog', bg: 'bg-gray-50/60', tint: 'border-gray-200/80' },
  { status: 'TODO', label: 'Todo', bg: 'bg-blue-50/60', tint: 'border-blue-200/80' },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    bg: 'bg-amber-50/60',
    tint: 'border-amber-200/80',
  },
  { status: 'DONE', label: 'Done', bg: 'bg-green-50/60', tint: 'border-green-200/80' },
  { status: 'CANCELLED', label: 'Cancelled', bg: 'bg-red-50/60', tint: 'border-red-200/80' },
]

function KanbanColumn({
  status,
  label,
  bg,
  tint,
  issues,
  onIssueClick,
  onDelete,
  isOver,
}: {
  status: IssueStatus
  label: string
  bg: string
  tint: string
  issues: IssueType[]
  onIssueClick: (id: number) => void
  onDelete?: (issueId: number) => void
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: `column-${status}` })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[280px] w-[280px] flex-col rounded-xl border transition-colors ${
        isOver ? 'border-indigo-300 bg-indigo-50/50' : `border-gray-200/80 ${bg} ${tint}`
      }`}
    >
      <div className="flex items-center justify-between px-3.5 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</h3>
        <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gray-200/80 px-1.5 text-[10px] font-semibold text-gray-500">
          {issues.length}
        </span>
      </div>

      {/* Cards — ScrollArea with vertical scroll, hidden until hover */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-2.5 pb-2.5">
        <div className="flex flex-col gap-2">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => {
                if (issue.id !== undefined) onIssueClick(issue.id)
              }}
              onDelete={onDelete}
            />
          ))}
          {issues.length === 0 && (
            <div className="flex items-center justify-center py-8 text-xs text-gray-400">
              No issues
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  issues: IssueType[]
  onIssueClick: (issueId: number) => void
  onStatusChange: (issueId: number, newStatus: string) => void
  onDelete?: (issueId: number) => void
  isLoading?: boolean
}

export default function KanbanBoard({
  issues,
  onIssueClick,
  onStatusChange,
  onDelete,
  isLoading,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumn, setOverColumn] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const activeIssue = activeId ? issues.find((i) => `issue-${i.id}` === activeId) : undefined

  const issuesByStatus = COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = issues.filter((i) => i.status === col.status)
      return acc
    },
    {} as Record<IssueStatus, IssueType[]>,
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    setOverColumn(null)

    const { active, over } = event
    if (!over) return

    const issueId = Number((active.id as string).replace('issue-', ''))
    const overId = over.id as string

    if (overId.startsWith('column-')) {
      const newStatus = overId.replace('column-', '')
      onStatusChange(issueId, newStatus)
    } else {
      const overIssue = issues.find((i) => `issue-${i.id}` === overId)
      if (overIssue && overIssue.status) {
        onStatusChange(issueId, overIssue.status)
      }
    }
  }

  function handleDragOver(event: DragEndEvent) {
    const { over } = event
    if (!over) {
      setOverColumn(null)
      return
    }
    const overId = over.id as string
    if (overId.startsWith('column-')) {
      setOverColumn(overId.replace('column-', ''))
    } else {
      const overIssue = issues.find((i) => `issue-${i.id}` === overId)
      if (overIssue) setOverColumn(overIssue.status)
    }
  }

  if (isLoading) {
    return (
      <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className={`min-w-[280px] w-[280px] rounded-xl border ${col.tint} ${col.bg}`}
          >
            <div className="px-3.5 py-3">
              <div className="h-3 w-20 rounded-md bg-gray-200/80" />
            </div>
            <div className="flex flex-col gap-2 px-2.5 pb-2.5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-white/80 shadow-sm" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4">
        <div className="flex gap-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              bg={col.bg}
              tint={col.tint}
              issues={issuesByStatus[col.status] ?? []}
              onIssueClick={onIssueClick}
              onDelete={onDelete}
              isOver={overColumn === col.status}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeIssue ? (
          <div className="w-[280px] opacity-95">
            <IssueCard issue={activeIssue} onClick={() => {}} onDelete={onDelete} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
