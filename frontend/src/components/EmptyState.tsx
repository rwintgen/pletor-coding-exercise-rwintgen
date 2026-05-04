import { ReactNode } from 'react'
import { colors, radii, spacing, typography } from '../theme'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

/** Centered empty-state placeholder for lists/grids with no content. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: `${spacing['3xl']} ${spacing.xl}`,
        color: colors.neutral[500],
        fontFamily: typography.fontFamily,
        background: colors.neutral[0],
        borderRadius: radii['2xl'],
        border: `1px dashed ${colors.neutral[200]}`,
      }}
    >
      <div
        style={{
          fontSize: 32,
          marginBottom: spacing.lg,
          width: 64,
          height: 64,
          margin: `0 auto ${spacing.lg}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radii.full,
          background: colors.primary[50],
        }}
      >
        {icon ?? '✨'}
      </div>
      <h3
        style={{
          margin: 0,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.neutral[900],
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            marginTop: spacing.sm,
            fontSize: typography.fontSize.sm,
            color: colors.neutral[500],
            maxWidth: 360,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: spacing.xl }}>{action}</div>}
    </div>
  )
}
