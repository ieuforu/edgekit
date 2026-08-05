import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import UsersPage from '@/features/users/UsersPage'
import UserDetailPage from '@/features/users/UserDetailPage'

export const Route = createFileRoute('/workspace/$workspaceId/users')({
  component: UsersRoute,
})

function UsersRoute() {
  const { workspaceId } = Route.useParams()
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  if (selectedUserId) {
    return (
      <UserDetailPage
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
      />
    )
  }

  return <UsersPage onUserClick={(id) => setSelectedUserId(id)} />
}
