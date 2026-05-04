import { colors, radii, shadows, spacing, transitions, typography } from '../theme'
import { Button } from './ui/Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Themed confirmation dialog. Replaces `window.confirm()` with a styled,
 * accessible modal. Closes on Escape, backdrop click, or Cancel.
 *
 * Use `variant="danger"` for destructive actions (delete image, delete account).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      onClick={onCancel}
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(9,9,11,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: spacing.lg,
        animation: 'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.neutral[0],
          borderRadius: radii.xl,
          boxShadow: shadows.xl,
          maxWidth: 400,
          width: '100%',
          padding: spacing['2xl'],
          animation: 'scaleIn 280ms cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: typography.fontFamily,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            color: colors.neutral[900],
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              margin: `${spacing.md} 0 0`,
              fontSize: typography.fontSize.sm,
              color: colors.neutral[500],
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            gap: spacing.md,
            justifyContent: 'flex-end',
            marginTop: spacing.xl,
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
            style={{ transition: `background ${transitions.fast}` }}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
