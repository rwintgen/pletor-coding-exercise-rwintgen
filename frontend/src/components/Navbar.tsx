import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { colors, spacing, typography } from '../theme'
import { Button } from './ui/Button'

/** Top navigation bar. Shows brand, current user, and login/logout actions. */
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
        background: colors.neutral[0],
        borderBottom: `1px solid ${colors.neutral[200]}`,
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
          color: colors.neutral[900],
          textDecoration: 'none',
          letterSpacing: '-0.5px',
        }}
      >
        PictoShare
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
        {user ? (
          <>
            <Link
              to={`/user/${user.username}`}
              style={{ color: colors.neutral[600], fontSize: typography.fontSize.sm, textDecoration: 'none' }}
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
              }}
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
