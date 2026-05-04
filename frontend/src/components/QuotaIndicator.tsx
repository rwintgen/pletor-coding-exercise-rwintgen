import { QuotaStatus } from '../api/client'
import { colors, radii, spacing, transitions, typography } from '../theme'

interface QuotaIndicatorProps {
  quota: QuotaStatus
}

/** Visual progress bar showing daily user upload quota with smooth color thresholds. */
export function QuotaIndicator({ quota }: QuotaIndicatorProps) {
  const percent = Math.min(
    100,
    (quota.user_uploads_today / quota.user_limit) * 100,
  )

  const barColor =
    percent >= 100
      ? `linear-gradient(90deg, ${colors.error[500]}, ${colors.error[600]})`
      : percent >= 80
        ? `linear-gradient(90deg, ${colors.warning[500]}, ${colors.error[500]})`
        : `linear-gradient(90deg, ${colors.primary[500]}, ${colors.accent[500]})`

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: typography.fontSize.xs,
          color: colors.neutral[600],
          marginBottom: spacing.xs,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        <span>Daily uploads</span>
        <span style={{ color: colors.neutral[800] }}>
          {quota.user_uploads_today} / {quota.user_limit}
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: colors.neutral[150],
          borderRadius: radii.full,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: barColor,
            borderRadius: radii.full,
            transition: `width ${transitions.slow}, background ${transitions.normal}`,
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
