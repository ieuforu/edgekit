import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Calendar, Building2, Shield, Clock } from 'lucide-react'
import { fetchUser } from './mock'

function InfoRow({
  icon: Icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ElementType
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-3">
      <Icon className="h-3.5 w-3.5 shrink-0 text-gray-300" strokeWidth={1.5} />
      <span className="w-24 shrink-0 text-[12px] text-gray-400">{label}</span>
      <span
        className={`flex-1 text-right text-[13px] font-medium text-gray-700 ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 capitalize">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const dots: Record<string, string> = {
    active: 'bg-emerald-400',
    inactive: 'bg-gray-300',
    suspended: 'bg-red-400',
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 capitalize">
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status] ?? dots.inactive}`} />
      {status}
    </span>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function UserDetailPage({ userId, onBack }: { userId: number; onBack: () => void }) {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => Promise.resolve(fetchUser(userId)),
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-gray-200 border-t-gray-400" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-[13px] text-gray-400">User not found</p>
        <button onClick={onBack} className="text-[13px] text-indigo-500 hover:text-indigo-400">
          Back to users
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <button
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-1.5 text-[12px] text-gray-400 transition-colors hover:text-gray-600"
      >
        <ArrowLeft className="h-3 w-3" />
        Users
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-medium text-gray-400 ring-2 ring-white">
          {user.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <h1 className="mt-4 text-lg font-semibold text-gray-900">{user.name}</h1>
        <p className="mt-1 text-[13px] text-gray-400">{user.email}</p>
        {user.bio && (
          <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-gray-400">{user.bio}</p>
        )}
        <div className="mt-4 flex gap-4">
          <RoleBadge role={user.role} />
          <StatusBadge status={user.status} />
        </div>
      </div>

      <div className="mt-10 space-y-2.5">
        <InfoRow icon={Building2} label="Department" value={user.department} />
        <InfoRow icon={Shield} label="Role" value={user.role} capitalize />
        <InfoRow icon={MapPin} label="Location" value={user.location} />
        <InfoRow icon={Calendar} label="Joined" value={formatDate(user.joinedAt)} />
        <InfoRow icon={Clock} label="Last active" value={formatDate(user.lastActive)} />
      </div>

      <p className="mt-8 text-center text-[10px] text-gray-200">ID: {user.id}</p>
    </div>
  )
}
