import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image, getImageUrl } from '../api/client'
import { useAuthStore } from '../stores/auth'
import { colors, radii, spacing, transitions, typography } from '../theme'
import { Card } from './ui/Card'

interface ImageCardProps {
  image: Image
  onClick?: (image: Image) => void
  onDelete?: (image: Image) => void
}

/** Single image card: thumbnail with hover zoom + gradient overlay, title, owner, timestamp. */
export function ImageCard({ image, onClick, onDelete }: ImageCardProps) {
  const currentUser = useAuthStore((s) => s.user)
  const isOwner = currentUser?.id === image.user_id
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <Card interactive={!!onClick} onClick={onClick ? () => onClick(image) : undefined}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: loaded ? undefined : 180,
          background: `linear-gradient(110deg, ${colors.neutral[150]} 30%, ${colors.neutral[100]} 50%, ${colors.neutral[150]} 70%)`,
          backgroundSize: '200% 100%',
          animation: loaded ? 'none' : 'shimmer 1.6s linear infinite',
          overflow: 'hidden',
        }}
      >
        <img
          src={getImageUrl(image.url)}
          alt={image.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => { setErrored(true); setLoaded(true) }}
          style={{
            width: '100%',
            height: 'auto',
            display: errored ? 'none' : 'block',
            opacity: loaded ? 1 : 0,
            transform: hover ? 'scale(1.04)' : 'scale(1)',
            transition: `transform ${transitions.slow}, opacity ${transitions.normal}`,
          }}
        />
        {errored && (
          <div
            style={{
              width: '100%',
              height: 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              color: colors.neutral[400],
              fontSize: typography.fontSize.xs,
              background: colors.neutral[100],
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Image unavailable</span>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(9,9,11,0.45) 0%, transparent 40%)',
            opacity: hover ? 1 : 0,
            transition: `opacity ${transitions.normal}`,
            pointerEvents: 'none',
          }}
        />
        {isOwner && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(image)
            }}
            aria-label="Delete image"
            style={{
              position: 'absolute',
              top: spacing.sm,
              right: spacing.sm,
              background: 'rgba(9,9,11,0.6)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              color: colors.neutral[0],
              border: 'none',
              borderRadius: radii.lg,
              width: 32,
              height: 32,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: hover ? 'scale(1)' : 'scale(0.85)',
              opacity: hover ? 1 : 0,
              transition: `transform ${transitions.fast}, opacity ${transitions.fast}, background ${transitions.fast}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.error[500]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(9,9,11,0.6)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
        {hover && image.file_size && (
          <span
            style={{
              position: 'absolute',
              bottom: spacing.sm,
              left: spacing.sm,
              background: 'rgba(9,9,11,0.6)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              color: '#fff',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              padding: `2px ${spacing.sm}`,
              borderRadius: radii.md,
              pointerEvents: 'none',
            }}
          >
            {image.file_size >= 1048576
              ? `${(image.file_size / 1048576).toFixed(1)} MB`
              : `${(image.file_size / 1024).toFixed(1)} KB`}
          </span>
        )}
      </div>

      <div style={{ padding: spacing.lg, fontFamily: typography.fontFamily }}>
        <h3
          style={{
            margin: 0,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          {image.title}
        </h3>
        <div
          style={{
            marginTop: spacing.xs,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: typography.fontSize.xs,
            color: colors.neutral[500],
          }}
        >
          <span>
            by{' '}
            <a
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/user/${image.username}`)
              }}
              style={{
                color: colors.primary[600],
                fontWeight: typography.fontWeight.semibold,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: `color ${transitions.fast}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline'
                e.currentTarget.style.color = colors.accent[500]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none'
                e.currentTarget.style.color = colors.primary[600]
              }}
            >
              {image.username}
            </a>
          </span>
          <span>{new Date(image.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  )
}
