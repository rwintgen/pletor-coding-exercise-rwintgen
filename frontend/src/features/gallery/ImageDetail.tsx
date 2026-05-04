import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image, getImageUrl } from '../../api/client'
import { Modal } from '../../components/Modal'
import { useRenameImage } from '../../hooks/useImages'
import { useAuthStore } from '../../stores/auth'
import { colors, radii, spacing, transitions, typography } from '../../theme'

interface ImageDetailProps {
  image: Image | null
  onClose: () => void
}

/** Lightbox modal that displays the full-size image with metadata.
 *  The owner can click the title to rename it inline.
 */
export function ImageDetail({ image, onClose }: ImageDetailProps) {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const isOwner = !!currentUser && !!image && currentUser.username === image.username
  const renameMutation = useRenameImage()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [localTitle, setLocalTitle] = useState(image?.title ?? '')

  // Sync local title when the image prop changes (query refetch or different image)
  useEffect(() => {
    if (image) setLocalTitle(image.title)
  }, [image])

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
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Blurred background fill — visible behind portrait/narrow images */}
            <div
              style={{
                position: 'absolute',
                inset: -20,
                backgroundImage: `url(${getImageUrl(image.url)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(30px) brightness(0.6)',
              }}
            />
            <img
              src={getImageUrl(image.url)}
              alt={image.title}
              style={{
                position: 'relative',
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
          <div style={{ padding: spacing['2xl'] }}>
            {editing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const trimmed = draft.trim()
                  if (trimmed && image && trimmed !== localTitle) {
                    renameMutation.mutate({ id: image.id, title: trimmed })
                    setLocalTitle(trimmed)
                  }
                  setEditing(false)
                }}
                style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}
              >
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false) }}
                  maxLength={200}
                  style={{
                    flex: 1,
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.neutral[900],
                    letterSpacing: '-0.02em',
                    fontFamily: typography.fontFamily,
                    background: colors.neutral[50],
                    border: `1.5px solid ${colors.primary[400]}`,
                    borderRadius: radii.lg,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  aria-label="Save title"
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: colors.primary[500],
                    color: '#fff',
                    border: 'none',
                    borderRadius: radii.lg,
                    cursor: 'pointer',
                    transition: `background ${transitions.fast}`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.primary[600] }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colors.primary[500] }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </button>
                <button
                  type="button"
                  aria-label="Cancel editing"
                  onClick={() => setEditing(false)}
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: colors.neutral[200],
                    color: colors.neutral[600],
                    border: 'none',
                    borderRadius: radii.lg,
                    cursor: 'pointer',
                    transition: `background ${transitions.fast}`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.neutral[300] }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colors.neutral[200] }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </form>
            ) : (
              <h2
                onClick={() => {
                  if (isOwner) {
                    setDraft(localTitle)
                    setEditing(true)
                  }
                }}
                title={isOwner ? 'Click to rename' : undefined}
                style={{
                  margin: 0,
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[900],
                  letterSpacing: '-0.02em',
                  cursor: isOwner ? 'text' : 'default',
                  borderRadius: radii.md,
                  transition: `background ${transitions.fast}`,
                  ...(isOwner && {
                    padding: `${spacing.xs} ${spacing.sm}`,
                    margin: `calc(-1 * ${spacing.xs}) calc(-1 * ${spacing.sm})`,
                  }),
                }}
                onMouseEnter={(e) => { if (isOwner) e.currentTarget.style.background = colors.neutral[100] }}
                onMouseLeave={(e) => { if (isOwner) e.currentTarget.style.background = 'transparent' }}
              >
                {localTitle}
              </h2>
            )}
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
