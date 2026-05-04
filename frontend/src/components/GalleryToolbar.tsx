import { useState } from 'react'
import { colors, radii, shadows, spacing, transitions, typography } from '../theme'

interface GalleryToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: string
  onSortChange: (value: string) => void
}

const selectStyle = {
  padding: `0 ${spacing.lg}`,
  paddingRight: '36px',
  height: 44,
  borderRadius: radii.md,
  border: `1px solid ${colors.neutral[200]}`,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily,
  background: colors.neutral[0],
  color: colors.neutral[800],
  cursor: 'pointer',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2371717a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  fontWeight: typography.fontWeight.medium,
  transition: `border-color ${transitions.fast}, box-shadow ${transitions.fast}`,
}

/** Search bar + sort dropdown for the gallery. */
export function GalleryToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: GalleryToolbarProps) {
  const [searchFocused, setSearchFocused] = useState(false)

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
      <div
        style={{
          position: 'relative',
          flex: 1,
          minWidth: 240,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={searchFocused ? colors.primary[500] : colors.neutral[400]}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            transition: `stroke ${transitions.fast}`,
            pointerEvents: 'none',
          }}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          placeholder="Search by title or user…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: '100%',
            height: 44,
            padding: `0 ${spacing.md} 0 42px`,
            borderRadius: radii.md,
            border: `1px solid ${searchFocused ? colors.primary[500] : colors.neutral[200]}`,
            boxShadow: searchFocused ? shadows.glow : shadows.xs,
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily,
            background: colors.neutral[0],
            color: colors.neutral[900],
            outline: 'none',
            transition: `border-color ${transitions.fast}, box-shadow ${transitions.fast}`,
          }}
        />
      </div>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        style={selectStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.primary[500]
          e.currentTarget.style.boxShadow = shadows.glow
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.neutral[200]
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <option value="newest">Sort: Newest</option>
        <option value="oldest">Sort: Oldest</option>
        <option value="title">Sort: Title A–Z</option>
      </select>
    </div>
  )
}
