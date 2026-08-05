import { createFileRoute, useRouter } from '@tanstack/react-router'
import UsersPage from '@/features/users/UsersPage'
import UserDetailPage from '@/features/users/UserDetailPage'

export const Route = createFileRoute('/workspace/$workspaceId/users')({
  validateSearch: (search: Record<string, unknown>) => ({
    userId: search.userId != null ? Number(search.userId) : null,
  }),
  component: UsersRoute,
})

function UsersRoute() {
  const { workspaceId } = Route.useParams()
  const router = useRouter()
  const search = Route.useSearch()
  const userId = search.userId

  if (userId) {
    return (
      <UserDetailPage
        userId={userId}
        onBack={() => {
          router.navigate({
            to: '/workspace/$workspaceId/users',
            params: { workspaceId },
            search: { userId: null },
            replace: true,
          })
        }}
      />
    )
  }

  return (
    <UsersPage
      onUserClick={(id) => {
        router.navigate({
          to: '/workspace/$workspaceId/users',
          params: { workspaceId },
          search: { userId: id },
          replace: true,
        })
      }}
    />
  )
}
