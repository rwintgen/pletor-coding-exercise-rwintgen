import { Link } from 'react-router-dom'
import { Image, getImageUrl } from '../../api/client'
import { Modal } from '../../components/Modal'
import { colors, spacing, typography } from '../../theme'

interface ImageDetailProps {
  image: Image | null
  onClose: () => void
}

/** Lightbox modal that displays the full-size image with metadata. */
export function ImageDetail({ image, onClose }: ImageDetailProps) {
  return (
    <Modal open={!!image} onClose={onClose} maxWidth={960}>
      {image && (
        <div style={{ fontFamily: typography.fontFamily }}>
          <div style={{ background: colors.neutral[900] }}>
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
          <div style={{ padding: spacing.xl }}>
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.neutral[900],
              }}
            >
              {image.title}
            </h2>
            <div
              style={{
                marginTop: spacing.sm,
                display: 'flex',
                gap: spacing.lg,
                color: colors.neutral[600],
                fontSize: typography.fontSize.sm,
              }}
            >
              <span>
                by <Link to={`/user/${image.username}`} style={{ color: colors.primary[600], fontWeight: 600, textDecoration: 'none' }}>{image.username}</Link>
              </span>
              <span>{new Date(image.created_at).toLocaleString()}</span>
              {image.file_size && <span>{(image.file_size / 1024).toFixed(1)} KB</span>}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
