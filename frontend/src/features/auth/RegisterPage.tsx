import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe, login, register } from '../../api/client'
import { ErrorBanner } from '../../components/ErrorBanner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { errorMessage } from '../../lib/errors'
import { registerSchema } from '../../lib/schemas'
import { useAuthStore } from '../../stores/auth'
import { colors, spacing, typography } from '../../theme'
import { AuthShell } from './LoginPage'

/** Register page. Creates a user, immediately logs them in, then navigates home. */
export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = registerSchema.safeParse({ username, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await register(username, password)
      const { access_token } = await login(username, password)
      useAuthStore.setState({ token: access_token })
      const me = await getMe()
      setAuth(access_token, me)
      navigate('/')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Create an account" subtitle="Join PictoShare to start uploading.">
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
          autoComplete="new-password"
        />
        {error && <ErrorBanner message={error} />}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
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
          Already have an account?{' '}
          <Link to="/login" style={{ color: colors.primary[600], fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
