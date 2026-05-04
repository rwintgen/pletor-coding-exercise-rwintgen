import { CSSProperties, ReactNode } from 'react'
import { colors, radii, shadows, transitions } from '../../theme'

interface CardProps {
  children: ReactNode
  style?: CSSProperties
  /** When true, applies a hover lift + brand shadow. */
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
        border: `1px solid ${colors.neutral[150]}`,
        boxShadow: shadows.sm,
        overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
        transition: `transform ${transitions.normal}, box-shadow ${transitions.normal}, border-color ${transitions.fast}`,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = shadows.lg
          e.currentTarget.style.borderColor = colors.neutral[200]
        }
      }}
      onMouseLeave={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = shadows.sm
          e.currentTarget.style.borderColor = colors.neutral[150]
        }
      }}
    >
      {children}
    </div>
  )
}
