import { QuotaStatus } from '../api/client'
import { colors, radii, spacing, transitions, typography } from '../theme'

interface QuotaIndicatorProps {
  quota: QuotaStatus
}

/** Visual progress bars showing daily user + global upload quotas. */
export function QuotaIndicator({ quota }: QuotaIndicatorProps) {
  const userPercent = Math.min(
    100,
    (quota.user_uploads_today / quota.user_limit) * 100,
  )

  const globalPercent = Math.min(
    100,
    (quota.global_uploads_today / quota.global_limit) * 100,
  )

  const barColor = (pct: number) =>
    pct >= 100
      ? `linear-gradient(90deg, ${colors.error[500]}, ${colors.error[600]})`
      : pct >= 80
        ? `linear-gradient(90deg, ${colors.warning[500]}, ${colors.error[500]})`
        : `linear-gradient(90deg, ${colors.primary[500]}, ${colors.accent[500]})`

  return (
    <div style={{ fontFamily: typography.fontFamily, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      {/* Per-user quota */}
      <div>
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
          <span>Your uploads</span>
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
              width: `${userPercent}%`,
              height: '100%',
              background: barColor(userPercent),
              borderRadius: radii.full,
              transition: `width ${transitions.slow}, background ${transitions.normal}`,
            }}
          />
        </div>
      </div>
      {/* Global quota */}
      <div>
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
          <span>Team uploads</span>
          <span style={{ color: colors.neutral[800] }}>
            {quota.global_uploads_today} / {quota.global_limit}
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: colors.neutral[150],
            borderRadius: radii.full,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${globalPercent}%`,
              height: '100%',
              background: barColor(globalPercent),
              borderRadius: radii.full,
              transition: `width ${transitions.slow}, background ${transitions.normal}`,
            }}
          />
        </div>
      </div>
      {!quota.can_upload && (
        <p
          style={{
            marginTop: spacing.xs,
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
