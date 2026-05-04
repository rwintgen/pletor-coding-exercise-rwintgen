import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { Image } from '../../api/client'
import { deleteAccount, getUserProfile } from '../../api/client'
import { EmptyState } from '../../components/EmptyState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { ImageCard } from '../../components/ImageCard'
import { Spinner } from '../../components/ui/Spinner'
import { useDeleteImage, useUserImages } from '../../hooks/useImages'
import { useAuthStore } from '../../stores/auth'
import { colors, spacing, typography } from '../../theme'
import { ImageDetail } from '../gallery/ImageDetail'

/** User profile page. Shows user info + their uploaded images. */
export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const currentUser = useAuthStore((s) => s.user)
  const clear = useAuthStore((s) => s.clear)
  const isOwnProfile = currentUser?.username === username
  const [active, setActive] = useState<Image | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserProfile(username!),
    enabled: !!username,
  })

  const { data: images, isLoading: imagesLoading, error: imagesError } = useUserImages(username!)
  const deleteMutation = useDeleteImage()

  const handleDelete = (image: Image) => {
    if (!confirm(`Delete "${image.title}"?`)) return
    deleteMutation.mutate(image.id)
  }

  if (profileLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: spacing['3xl'] }}>
        <Spinner size={32} />
      </div>
    )
  }

  if (profileError) {
    return (
      <div style={{ maxWidth: 600, margin: `${spacing['3xl']} auto`, padding: spacing.xl }}>
        <ErrorBanner message="User not found" />
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: spacing.xl,
        fontFamily: typography.fontFamily,
      }}
    >
      <header style={{ marginBottom: spacing['2xl'] }}>
        <h1
          style={{
            margin: 0,
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.neutral[900],
          }}
        >
          {profile?.username}
        </h1>
        <p
          style={{
            marginTop: spacing.xs,
            color: colors.neutral[500],
            fontSize: typography.fontSize.sm,
          }}
        >
          Joined {profile ? new Date(profile.created_at).toLocaleDateString() : ''}
          {isOwnProfile && ' · This is your profile'}
        </p>
      </header>

      {imagesError && <ErrorBanner message={(imagesError as Error).message} />}

      {imagesLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: spacing['3xl'] }}>
          <Spinner size={32} />
        </div>
      ) : images && images.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: spacing.xl,
          }}
        >
          {images.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              onClick={setActive}
              onDelete={isOwnProfile ? handleDelete : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No images"
          description={
            isOwnProfile
              ? "You haven't uploaded any images yet."
              : `${username} hasn't uploaded any images yet.`
          }
        />
      )}

      <ImageDetail image={active} onClose={() => setActive(null)} />

      {isOwnProfile && (
        <div
          style={{
            marginTop: spacing['3xl'],
            paddingTop: spacing.xl,
            borderTop: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: colors.error[500],
            }}
          >
            Danger zone
          </h2>
          <p
            style={{
              marginTop: spacing.xs,
              color: colors.neutral[500],
              fontSize: typography.fontSize.sm,
            }}
          >
            Permanently delete your account and all your images.
          </p>
          <button
            disabled={deleting}
            onClick={async () => {
              setDeleting(true)
              try {
                await deleteAccount()
                clear()
                navigate('/')
              } catch {
                setDeleting(false)
              }
            }}
            style={{
              marginTop: spacing.md,
              padding: `${spacing.sm} ${spacing.lg}`,
              background: deleting ? colors.neutral[400] : colors.error[500],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: '6px',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              cursor: deleting ? 'not-allowed' : 'pointer',
            }}
          >
            {deleting ? 'Deleting account...' : 'Delete my account'}
          </button>
        </div>
      )}
    </div>
  )
}
