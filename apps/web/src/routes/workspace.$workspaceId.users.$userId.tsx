import { createFileRoute } from '@tanstack/react-router'
import UserDetailPage from '@/features/users/UserDetailPage'
import { useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/workspace/$workspaceId/users/$userId')({
  component: UserDetailRoute,
})

function UserDetailRoute() {
  const { userId } = Route.useParams()
  const { workspaceId } = Route.useParams()
  const router = useRouter()

  return (
    <UserDetailPage
      userId={Number(userId)}
      onBack={() => router.navigate({ to: '/workspace/$workspaceId/users', params: { workspaceId } })}
    />
  )
}
