import { QuotaStatus } from '../api/client'
import { colors, radii, spacing, typography } from '../theme'

interface QuotaIndicatorProps {
  quota: QuotaStatus
}

/** Visual progress bar showing daily user upload quota with color thresholds. */
export function QuotaIndicator({ quota }: QuotaIndicatorProps) {
  const percent = Math.min(
    100,
    (quota.user_uploads_today / quota.user_limit) * 100,
  )

  const barColor =
    percent >= 100
      ? colors.error[500]
      : percent >= 80
        ? colors.warning[500]
        : colors.success[500]

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: typography.fontSize.xs,
          color: colors.neutral[600],
          marginBottom: spacing.xs,
        }}
      >
        <span>Daily uploads</span>
        <span>
          {quota.user_uploads_today} / {quota.user_limit}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: colors.neutral[200],
          borderRadius: radii.full,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: barColor,
            transition: 'width 250ms ease',
          }}
        />
      </div>
      {!quota.can_upload && (
        <p
          style={{
            marginTop: spacing.sm,
            fontSize: typography.fontSize.xs,
            color: colors.error[700],
          }}
        >
          Daily limit reached. Quotas reset at midnight UTC.
        </p>
      )}
    </div>
  )
}
