import { colors, radii, spacing, typography } from '../theme'

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

/** Themed error message banner. */
export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      style={{
        background: colors.error[50],
        color: colors.error[700],
        padding: `${spacing.sm} ${spacing.lg}`,
        borderRadius: radii.md,
        border: `1px solid ${colors.error[500]}33`,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.md,
        animation: 'slideDown 250ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.error[700],
            cursor: 'pointer',
            fontSize: typography.fontSize.lg,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
