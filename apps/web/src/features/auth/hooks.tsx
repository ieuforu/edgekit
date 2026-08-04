import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AuthResponse } from '@/features/auth/types'
import { fetchCurrentUser, loginUser, registerUser, logoutUser } from '@/features/auth/api'

type User = AuthResponse['user']

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check current session on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchCurrentUser()
        if (!cancelled && data?.success) {
          setUser(data.user)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const u = await loginUser(email, password)
    setUser(u)
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const u = await registerUser(email, password, name)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
