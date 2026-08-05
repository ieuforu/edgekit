import { createFileRoute, useRouter } from '@tanstack/react-router'
import RegisterPage from '@/features/auth/components/RegisterPage'

export const Route = createFileRoute('/auth/register')({
  component: AuthRegister,
})

function AuthRegister() {
  const router = useRouter()
  return (
    <RegisterPage
      onSwitchToLogin={() => router.navigate({ to: '/auth/login' })}
    />
  )
}
