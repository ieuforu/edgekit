import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '@/features/auth/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface RegisterPageProps {
  onSwitchToLogin: () => void
}

function AnimatedLogo() {
  return (
    <motion.svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="hidden"
      animate="visible"
    >
      <motion.path
        d="M12 2L2 7l10 5 10-5-10-5z"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      <motion.path
        d="M2 12l10 5 10-5"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.6, delay: 0.5, ease: 'easeInOut' }}
      />
      <motion.path
        d="M2 17l10 5 10-5"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.6, delay: 0.9, ease: 'easeInOut' }}
      />
    </motion.svg>
  )
}

export default function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(email, password, name)
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — solid dark, just the logo */}
      <div className="hidden w-5/12 items-center justify-center bg-gray-950 lg:flex">
        <AnimatedLogo />
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[340px]"
        >
          <div className="mb-8 lg:hidden">
            <span className="text-lg font-semibold text-gray-900">EdgeKit</span>
          </div>

          <h1 className="text-xl font-semibold text-gray-900">Create account</h1>
          <p className="mt-1 text-sm text-gray-500">Get started — it's free.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-gray-700">
                Name
              </label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
                className="h-10"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-medium text-gray-700"
              >
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
                className="h-10"
              />
            </div>

            <Button type="submit" disabled={submitting} className="h-10 w-full">
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-gray-400">
            Have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900"
            >
              Sign in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
