import { useNavigate } from 'react-router-dom'
import { Image, getImageUrl } from '../../api/client'
import { Modal } from '../../components/Modal'
import { colors, spacing, transitions, typography } from '../../theme'

interface ImageDetailProps {
  image: Image | null
  onClose: () => void
}

/** Lightbox modal that displays the full-size image with metadata. */
export function ImageDetail({ image, onClose }: ImageDetailProps) {
  const navigate = useNavigate()

  const goToProfile = () => {
    if (!image) return
    onClose()
    navigate(`/user/${image.username}`)
  }

  return (
    <Modal open={!!image} onClose={onClose} maxWidth={960}>
      {image && (
        <div style={{ fontFamily: typography.fontFamily }}>
          <div
            style={{
              background: colors.neutral[950],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={getImageUrl(image.url)}
              alt={image.title}
              style={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
          <div style={{ padding: spacing['2xl'] }}>
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.neutral[900],
                letterSpacing: '-0.02em',
              }}
            >
              {image.title}
            </h2>
            <div
              style={{
                marginTop: spacing.md,
                display: 'flex',
                gap: spacing.lg,
                color: colors.neutral[500],
                fontSize: typography.fontSize.sm,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <span>
                by{' '}
                <a
                  onClick={goToProfile}
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
              <span style={{ color: colors.neutral[300] }}>·</span>
              <span>{new Date(image.created_at).toLocaleString()}</span>
              {image.file_size && (
                <>
                  <span style={{ color: colors.neutral[300] }}>·</span>
                  <span>{(image.file_size / 1024).toFixed(1)} KB</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
