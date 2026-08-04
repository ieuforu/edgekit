import type { AuthResponse } from '@/features/auth/types'

export async function fetchCurrentUser(): Promise<{
  success: boolean
  user: AuthResponse['user']
} | null> {
  try {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      return (await res.json()) as { success: boolean; user: AuthResponse['user'] }
    }
  } catch {
    // Not authenticated — that's fine
  }
  return null
}

export async function loginUser(email: string, password: string): Promise<AuthResponse['user']> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Login failed')
  }
  const data: AuthResponse = await res.json()
  return data.user
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
): Promise<AuthResponse['user']> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Registration failed')
  }
  const data: AuthResponse = await res.json()
  return data.user
}

export async function logoutUser(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}
