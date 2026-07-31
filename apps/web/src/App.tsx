import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TaskPage from './pages/TaskPage'
import LoadingSkeleton from './components/LoadingSkeleton'

export default function App() {
  const { user, loading: authLoading, logout } = useAuth()
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login')

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  if (!user) {
    return authPage === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthPage('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />
    )
  }

  return <TaskPage user={user} onLogout={logout} />
}
