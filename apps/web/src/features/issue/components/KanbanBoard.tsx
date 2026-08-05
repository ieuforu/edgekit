import React, { useState, useRef, useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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

const COLUMNS: { status: IssueStatus; label: string }[] = [
  { status: 'BACKLOG', label: 'Backlog' },
  { status: 'TODO', label: 'Todo' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'DONE', label: 'Done' },
  { status: 'CANCELLED', label: 'Cancelled' },
]

const KanbanColumn = React.memo(function KanbanColumn({
  status,
  label,
  issues,
  onIssueClick,
  onDelete,
  isOver,
}: {
  status: IssueStatus
  label: string
  issues: IssueType[]
  onIssueClick: (id: number) => void
  onDelete?: (issueId: number) => void
  isOver: boolean
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const { setNodeRef } = useDroppable({ id: `column-${status}` })

  const handleIssueClick = useCallback(
    (id: number) => {
      if (id !== undefined) onIssueClick(id)
    },
    [onIssueClick],
  )

  const virtualizer = useVirtualizer({
    count: issues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[280px] w-[280px] flex-col rounded-lg border transition-colors ${
        isOver ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </h3>
        <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gray-100 px-1.5 text-[10px] font-medium text-gray-400">
          {issues.length}
        </span>
      </div>

      {/* Cards — virtualized scroll */}
      <div ref={parentRef} className="custom-scrollbar flex-1 overflow-y-auto px-2.5 pb-2.5">
        {issues.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-xs text-gray-300">
            No issues
          </div>
        ) : (
          <div
            style={{
              height: virtualizer.getTotalSize(),
              position: 'relative',
              width: '100%',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const issue = issues[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="mb-2">
                    <IssueCard
                      issue={issue}
                      onClick={() => handleIssueClick(issue.id!)}
                      onDelete={onDelete}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})

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

  const issuesByStatus = useMemo(() => {
    return COLUMNS.reduce(
      (acc, col) => {
        acc[col.status] = issues.filter((i) => i.status === col.status)
        return acc
      },
      {} as Record<IssueStatus, IssueType[]>,
    )
  }, [issues])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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
    },
    [issues, onStatusChange],
  )

  const handleDragOver = useCallback(
    (event: DragEndEvent) => {
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
    },
    [issues],
  )

  const handleOverlayDelete = useCallback(() => {}, [])

  if (isLoading) {
    return (
      <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className="min-w-[280px] w-[280px] rounded-lg border border-gray-200 bg-white"
          >
            <div className="px-3 py-3">
              <div className="h-2.5 w-16 rounded bg-gray-100" />
            </div>
            <div className="flex flex-col gap-2 px-2.5 pb-2.5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-50" />
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
      <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-4">
        <div className="flex gap-3">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
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
            <IssueCard
              issue={activeIssue}
              onClick={() => {}}
              onDelete={handleOverlayDelete}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
