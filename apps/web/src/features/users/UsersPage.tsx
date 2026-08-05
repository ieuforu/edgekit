import { useRef, useState, useCallback, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Search, X } from 'lucide-react'
import { fetchUsers, type User } from './mock'

const PAGE_SIZE = 50
const ROW_HEIGHT = 64

function StatusIndicator({ status }: { status: string }) {
  const config: Record<string, { dot: string; text: string }> = {
    active: { dot: 'bg-emerald-400', text: 'text-gray-500' },
    inactive: { dot: 'bg-gray-300', text: 'text-gray-400' },
    suspended: { dot: 'bg-red-400', text: 'text-gray-400' },
  }
  const c = config[status] ?? config.inactive

  return (
    <span className="inline-flex w-24 shrink-0 items-center gap-1.5 text-[11px] text-gray-500 capitalize">
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  )
}

export default function UsersPage({ onUserClick }: { onUserClick?: (userId: number) => void }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const onSearchChange = useCallback((val: string) => {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 250)
  }, [])

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['users', 'infinite', debouncedSearch],
    queryFn: ({ pageParam }) =>
      fetchUsers({ page: pageParam, pageSize: PAGE_SIZE, search: debouncedSearch }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
  })

  const rows = useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((p) => p.data)
  }, [data])

  const totalFetched = rows.length
  const totalCount = data?.pages[0]?.total ?? 0

  const virtualizer = useVirtualizer({
    count: hasNextPage ? totalFetched + 1 : totalFetched,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  // Infinite scroll trigger
  const virtualItems = virtualizer.getVirtualItems()
  const lastItem = virtualItems[virtualItems.length - 1]
  if (lastItem && lastItem.index >= totalFetched - 10 && hasNextPage && !isFetchingNextPage) {
    fetchNextPage()
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Users</h1>
          <p className="mt-0.5 text-[13px] text-gray-400">
            {isLoading ? 'Loading…' : `${totalCount.toLocaleString()} people`}
          </p>
        </div>
        {rows.length > 0 && (
          <p className="text-[11px] text-gray-300">
            Showing {virtualItems.length} of {totalFetched.toLocaleString()} rows
          </p>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          placeholder="Search people…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-[13px] text-gray-700 outline-none transition-colors placeholder:text-gray-300 focus:border-gray-300 focus:bg-white"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Virtualized list */}
      <div
        ref={parentRef}
        className="custom-scrollbar flex-1 overflow-auto rounded-lg border border-gray-200 bg-white"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const isLoaderRow = virtualRow.index >= totalFetched
            const user = rows[virtualRow.index] as User | undefined
            const isLast = virtualRow.index === totalFetched - 1

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {isLoaderRow ? (
                  <div className="flex h-[64px] items-center justify-center text-[12px] text-gray-300">
                    {hasNextPage ? (
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-gray-200 border-t-gray-400" />
                        Loading…
                      </div>
                    ) : (
                      'No more users'
                    )}
                  </div>
                ) : user ? (
                  <div
                    onClick={() => onUserClick?.(user.id)}
                    className={`flex items-center gap-3 px-4 transition-colors hover:bg-gray-50 cursor-pointer ${
                      !isLast ? 'border-b border-gray-100' : ''
                    }`}
                    style={{ height: `${ROW_HEIGHT}px` }}
                  >
                    {/* Avatar */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-medium text-gray-400">
                      {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* Name + email */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-gray-900 leading-tight">
                        {user.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-gray-400">{user.email}</p>
                    </div>

                    {/* Department */}
                    <div className="w-32 shrink-0 text-[12px] text-gray-400">{user.department}</div>

                    {/* Status */}
                    <StatusIndicator status={user.status} />

                    {/* Role */}
                    <div className="w-20 shrink-0 text-[11px] text-gray-400 capitalize">
                      {user.role}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
