import { colors, radii, spacing, typography } from '../theme'

interface GalleryToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: string
  onSortChange: (value: string) => void
}

const selectStyle = {
  padding: `${spacing.sm} ${spacing.lg}`,
  paddingRight: '32px',
  borderRadius: radii.md,
  border: `1px solid ${colors.neutral[300]}`,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily,
  background: colors.neutral[0],
  color: colors.neutral[700],
  cursor: 'pointer',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23525252' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
}

/** Search bar + sort dropdown for the gallery. */
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
        alignItems: 'center',
        fontFamily: typography.fontFamily,
      }}
    >
      <input
        type="text"
        placeholder="Search by title or user…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          flex: 1,
          minWidth: 200,
          padding: `${spacing.sm} ${spacing.md}`,
          borderRadius: radii.md,
          border: `1px solid ${colors.neutral[300]}`,
          fontSize: typography.fontSize.sm,
          fontFamily: typography.fontFamily,
          outline: 'none',
        }}
      />

      <select value={sort} onChange={(e) => onSortChange(e.target.value)} style={selectStyle}>
        <option value="newest">Sort: Newest</option>
        <option value="oldest">Sort: Oldest</option>
        <option value="title">Sort: Title A–Z</option>
      </select>
    </div>
  )
}
