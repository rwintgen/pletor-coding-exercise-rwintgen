import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { colors, gradients, spacing, transitions, typography } from '../theme'
import { Button } from './ui/Button'

/** Top navigation bar. Glass effect, gradient brand, current user, login/logout actions. */
export function Navbar() {
  const { user, clear } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clear()
    navigate('/login')
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--surface-glass)',
        backdropFilter: 'saturate(180%) blur(14px)',
        WebkitBackdropFilter: 'saturate(180%) blur(14px)',
        borderBottom: `1px solid ${colors.neutral[150]}`,
        padding: `${spacing.md} ${spacing.xl}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: typography.fontFamily,
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          background: gradients.brand,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textDecoration: 'none',
          letterSpacing: '-0.02em',
        }}
      >
        PictoShare
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
        {user ? (
          <>
            <Link
              to={`/user/${user.username}`}
              style={{
                color: colors.neutral[600],
                fontSize: typography.fontSize.sm,
                textDecoration: 'none',
                transition: `color ${transitions.fast}`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = colors.primary[600] }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.neutral[600] }}
            >
              Signed in as <strong style={{ color: colors.neutral[900] }}>{user.username}</strong>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: colors.neutral[700],
                textDecoration: 'none',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                transition: `color ${transitions.fast}`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = colors.primary[600] }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.neutral[700] }}
            >
              Sign in
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button size="sm">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
