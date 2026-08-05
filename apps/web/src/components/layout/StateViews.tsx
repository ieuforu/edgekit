import type { ReactNode } from 'react'
import { AlertCircle, Inbox } from 'lucide-react'
import LoadingSkeleton from '@/components/layout/LoadingSkeleton'

export function LoadingView() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSkeleton />
    </div>
  )
}

export function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/50 px-6 py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-400" />
      </div>
      <h3 className="mb-1 text-sm font-medium text-gray-700">Something went wrong</h3>
      <p className="max-w-sm text-[13px] text-gray-400">{message}</p>
    </div>
  )
}

export function EmptyView({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-4 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
        <Inbox className="h-5 w-5 text-gray-300" />
      </div>
      <h3 className="mb-1 text-sm font-medium text-gray-700">{title}</h3>
      <p className="mb-5 max-w-sm text-[13px] text-gray-400">{description}</p>
      {action}
    </div>
  )
}
