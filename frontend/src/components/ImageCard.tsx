import { useNavigate } from 'react-router-dom'
import { Image, getImageUrl } from '../api/client'
import { useAuthStore } from '../stores/auth'
import { colors, radii, spacing, typography } from '../theme'
import { Card } from './ui/Card'

interface ImageCardProps {
  image: Image
  onClick?: (image: Image) => void
  onDelete?: (image: Image) => void
}

/** Single image card: thumbnail, title, owner, timestamp, optional delete. */
export function ImageCard({ image, onClick, onDelete }: ImageCardProps) {
  const currentUser = useAuthStore((s) => s.user)
  const isOwner = currentUser?.id === image.user_id
  const navigate = useNavigate()

  return (
    <Card interactive={!!onClick} onClick={onClick ? () => onClick(image) : undefined}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          background: colors.neutral[100],
          overflow: 'hidden',
        }}
      >
        <img
          src={getImageUrl(image.url)}
          alt={image.title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 300ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = ''
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
              background: 'rgba(0,0,0,0.6)',
              color: colors.neutral[0],
              border: 'none',
              borderRadius: radii.full,
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.error[500]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.6)'
            }}
          >
            ×
          </button>
        )}
      </div>

      <div style={{ padding: spacing.lg, fontFamily: typography.fontFamily }}>
        <h3
          style={{
            margin: 0,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
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
          <span>by <a onClick={(e) => { e.stopPropagation(); navigate(`/user/${image.username}`) }} style={{ color: colors.primary[600], fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }} onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}>{image.username}</a></span>
          <span>{new Date(image.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  )
}
