import { CSSProperties, ReactNode } from 'react'
import { colors, radii, shadows } from '../../theme'

interface CardProps {
  children: ReactNode
  style?: CSSProperties
  /** When true, applies a subtle hover lift. */
  interactive?: boolean
  onClick?: () => void
}

/** Themed card container with optional hover-lift behavior. */
export function Card({ children, style, interactive, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.neutral[0],
        borderRadius: radii.xl,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.md,
        overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = shadows.xl
        }
      }}
      onMouseLeave={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = shadows.md
        }
      }}
    >
      {children}
    </div>
  )
}
