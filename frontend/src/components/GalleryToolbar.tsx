import { colors, radii, spacing, typography } from '../theme'

interface GalleryToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: string
  onSortChange: (value: string) => void
}

/** Search bar + sort dropdown for the gallery grid. */
export function GalleryToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: GalleryToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: spacing.md,
        marginBottom: spacing.xl,
        flexWrap: 'wrap',
        fontFamily: typography.fontFamily,
      }}
    >
      <input
        type="text"
        placeholder="Search by title…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          flex: 1,
          minWidth: 200,
          padding: spacing.sm,
          borderRadius: radii.md,
          border: `1px solid ${colors.neutral[300]}`,
          fontSize: typography.fontSize.sm,
          fontFamily: typography.fontFamily,
          outline: 'none',
        }}
      />
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        style={{
          padding: `${spacing.sm} ${spacing.lg}`,
          borderRadius: radii.md,
          border: `1px solid ${colors.neutral[300]}`,
          fontSize: typography.fontSize.sm,
          fontFamily: typography.fontFamily,
          background: colors.neutral[0],
          color: colors.neutral[700],
          cursor: 'pointer',
        }}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="title">Title A–Z</option>
      </select>
    </div>
  )
}
