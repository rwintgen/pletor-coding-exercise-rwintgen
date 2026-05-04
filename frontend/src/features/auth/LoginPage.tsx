import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe, login } from '../../api/client'
import { ErrorBanner } from '../../components/ErrorBanner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { loginSchema } from '../../lib/schemas'
import { useAuthStore } from '../../stores/auth'
import { colors, spacing, typography } from '../../theme'

/** Login page. Validates with Zod, calls login API, then loads /auth/me. */
export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = loginSchema.safeParse({ username, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const { access_token } = await login(username, password)
      useAuthStore.setState({ token: access_token })
      const me = await getMe()
      setAuth(access_token, me)
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to upload and manage your images.">
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}
      >
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <ErrorBanner message={error} />}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: typography.fontSize.sm,
            color: colors.neutral[600],
            fontFamily: typography.fontFamily,
          }}
        >
          New here?{' '}
          <Link to="/register" style={{ color: colors.primary[600], fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

interface AuthShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

/** Shared centered layout used by both Login and Register pages. */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        background:
          'radial-gradient(circle at 20% 0%, var(--bg-radial-1), transparent 45%), radial-gradient(circle at 80% 100%, var(--bg-radial-2), transparent 45%), var(--bg-page)',
      }}
    >
      <div
        className="page-enter"
        style={{
          width: '100%',
          maxWidth: 420,
          background: colors.neutral[0],
          borderRadius: 20,
          padding: spacing['2xl'],
          boxShadow: '0 24px 50px -12px rgba(24,24,27,0.18), 0 8px 16px -8px rgba(24,24,27,0.06)',
          border: `1px solid ${colors.neutral[150]}`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.neutral[900],
            fontFamily: typography.fontFamily,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              marginTop: spacing.sm,
              marginBottom: spacing.xl,
              fontSize: typography.fontSize.sm,
              color: colors.neutral[500],
              fontFamily: typography.fontFamily,
            }}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
