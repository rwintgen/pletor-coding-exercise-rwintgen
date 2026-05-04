import { ReactNode } from 'react'
import { colors, spacing, typography } from '../theme'

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
      }}
    >
      {icon && <div style={{ fontSize: 48, marginBottom: spacing.lg }}>{icon}</div>}
      <h3
        style={{
          margin: 0,
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          color: colors.neutral[800],
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
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: spacing.xl }}>{action}</div>}
    </div>
  )
}
