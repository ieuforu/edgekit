import { createFileRoute, useRouter } from '@tanstack/react-router'
import LoginPage from '@/features/auth/components/LoginPage'

export const Route = createFileRoute('/auth/login')({
  component: AuthLogin,
})

function AuthLogin() {
  const router = useRouter()
  return <LoginPage onSwitchToRegister={() => router.navigate({ to: '/auth/register' })} />
}
