import { useState, type FormEvent } from 'react'
import { useAuth } from '@/features/auth/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginPageProps {
  onSwitchToRegister: () => void
}

export default function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <h1 className="text-lg font-semibold text-gray-900">EdgeKit</h1>
          <p className="mt-1 text-[13px] text-gray-400">Sign in to your account</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-6"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-gray-600">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-gray-600">
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-gray-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  )
}
