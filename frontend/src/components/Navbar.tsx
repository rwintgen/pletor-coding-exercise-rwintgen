import { type ReactNode, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import type { ThemeMode } from '../stores/theme'
import { colors, gradients, radii, spacing, transitions, typography } from '../theme'
import { Button } from './ui/Button'

const THEME_ICONS: Record<ThemeMode, { svg: ReactNode; title: string }> = {
  system: {
    title: 'Theme: system',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  light: {
    title: 'Theme: light',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  dark: {
    title: 'Theme: dark',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
}

/** Top navigation bar. Glass effect, gradient brand, current user, login/logout actions. */
export function Navbar() {
  const { user, clear } = useAuthStore()
  const navigate = useNavigate()
  const themeMode = useThemeStore((s) => s.mode)
  const cycleTheme = useThemeStore((s) => s.cycle)
  const [themeHover, setThemeHover] = useState(false)

  const handleLogout = () => {
    clear()
    navigate('/login')
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: spacing.sm,
        zIndex: 50,
        background: 'var(--surface-glass)',
        backdropFilter: 'saturate(180%) blur(14px)',
        WebkitBackdropFilter: 'saturate(180%) blur(14px)',
        border: `1px solid ${colors.neutral[150]}`,
        borderRadius: radii.xl,
        margin: `0 ${spacing.sm}`,
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
        <button
          onClick={cycleTheme}
          onMouseEnter={() => setThemeHover(true)}
          onMouseLeave={() => setThemeHover(false)}
          aria-label={THEME_ICONS[themeMode].title}
          title={THEME_ICONS[themeMode].title}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: radii.lg,
            border: 'none',
            background: themeHover ? colors.neutral[100] : 'transparent',
            color: colors.neutral[600],
            cursor: 'pointer',
            transition: `background ${transitions.fast}, color ${transitions.fast}`,
            padding: 0,
          }}
        >
          {THEME_ICONS[themeMode].svg}
        </button>
        {user ? (
          <>
            <Link
              to={`/user/${user.username}`}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: radii.lg,
                transition: `background ${transitions.fast}`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.neutral[100] }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {/* Avatar — always visible */}
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: radii.lg,
                  background: gradients.brand,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.bold,
                  flexShrink: 0,
                }}
              >
                {user.username[0].toUpperCase()}
              </span>
              {/* Username text — hidden on narrow viewports */}
              <span
                className="nav-user-text"
                style={{
                  color: colors.neutral[600],
                  fontSize: typography.fontSize.sm,
                  transition: `color ${transitions.fast}`,
                }}
              >
                <strong style={{ color: colors.neutral[900] }}>
                  {user.username.length > 15 ? `${user.username.slice(0, 15)}…` : user.username}
                </strong>
              </span>
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
