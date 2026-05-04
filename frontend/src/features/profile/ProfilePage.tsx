import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Image } from '../../api/client'
import { deleteAccount, getUserProfile } from '../../api/client'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { Fab } from '../../components/Fab'
import { ImageCard } from '../../components/ImageCard'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useDeleteImage, useUserImages } from '../../hooks/useImages'
import { errorMessage } from '../../lib/errors'
import { useAuthStore } from '../../stores/auth'
import { colors, gradients, radii, spacing, typography } from '../../theme'
import { ImageDetail } from '../gallery/ImageDetail'
import { UploadForm } from '../gallery/UploadForm'

/** User profile page. Shows user info + their uploaded images, with FAB upload + danger zone for owner. */
export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const currentUser = useAuthStore((s) => s.user)
  const clear = useAuthStore((s) => s.clear)
  const isOwnProfile = currentUser?.username === username
  const [active, setActive] = useState<Image | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Image | null>(null)
  const [showAccountDelete, setShowAccountDelete] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
    setDeleteTarget(image)
  }

  if (profileLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: spacing['3xl'] }}>
        <Spinner size={36} />
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

  const initial = (profile?.username ?? '?').charAt(0).toUpperCase()

  return (
    <div
      className="page-enter"
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: `${spacing['2xl']} ${spacing.xl}`,
        fontFamily: typography.fontFamily,
      }}
    >
      <header
        style={{
          marginBottom: spacing['2xl'],
          display: 'flex',
          alignItems: 'center',
          gap: spacing.lg,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: radii.full,
            background: gradients.brand,
            color: colors.neutral[0],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            letterSpacing: '-0.02em',
            boxShadow: '0 12px 28px -10px rgba(99,102,241,0.5)',
          }}
        >
          {initial}
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {profile?.username}
          </h1>
          <p
            style={{
              marginTop: spacing.xs,
              marginBottom: 0,
              color: colors.neutral[500],
              fontSize: typography.fontSize.sm,
            }}
          >
            Joined {profile ? new Date(profile.created_at).toLocaleDateString() : ''}
            {isOwnProfile && ' · This is your profile'}
          </p>
        </div>
      </header>

      {imagesError && <ErrorBanner message={(imagesError as Error).message} />}

      {imagesLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: spacing['3xl'] }}>
          <Spinner size={36} />
        </div>
      ) : images && images.length > 0 ? (
        <div className="masonry stagger-fade">
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
          icon="🖼️"
          title="No images"
          description={
            isOwnProfile
              ? "You haven't uploaded any images yet."
              : `${username} hasn't uploaded any images yet.`
          }
        />
      )}

      <ImageDetail image={active} onClose={() => setActive(null)} />

      {isOwnProfile && <Fab onClick={() => setShowUpload(true)} />}

      <Modal open={showUpload} onClose={() => setShowUpload(false)} maxWidth={480}>
        <div style={{ padding: spacing.xl }}>
          <UploadForm onSuccess={() => setShowUpload(false)} />
        </div>
      </Modal>

      {isOwnProfile && (
        <div
          style={{
            marginTop: spacing['4xl'],
            padding: spacing.xl,
            background: colors.error[50],
            borderRadius: radii.xl,
            border: `1px solid ${colors.error[500]}33`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: colors.error[700],
              letterSpacing: '-0.01em',
            }}
          >
            Danger zone
          </h2>
          <p
            style={{
              marginTop: spacing.xs,
              marginBottom: spacing.md,
              color: colors.neutral[600],
              fontSize: typography.fontSize.sm,
            }}
          >
            Permanently delete your account and all your images.
          </p>
          <Button
            variant="danger"
            disabled={deleting}
            onClick={() => setShowAccountDelete(true)}
          >
            {deleting ? 'Deleting account…' : 'Delete my account'}
          </Button>
          {deleteError && (
            <div style={{ marginTop: spacing.md }}>
              <ErrorBanner message={deleteError} onDismiss={() => setDeleteError(null)} />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete image"
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={showAccountDelete}
        title="Delete your account?"
        description="This will permanently delete your account and all your uploaded images. This action cannot be undone."
        confirmLabel="Delete my account"
        variant="danger"
        loading={deleting}
        onConfirm={async () => {
          setDeleting(true)
          setDeleteError(null)
          try {
            await deleteAccount()
            queryClient.removeQueries({ queryKey: ['images'] })
            queryClient.removeQueries({ queryKey: ['user', username] })
            clear()
            navigate('/')
          } catch (err) {
            setDeleteError(errorMessage(err))
            setDeleting(false)
            setShowAccountDelete(false)
          }
        }}
        onCancel={() => setShowAccountDelete(false)}
      />
    </div>
  )
}

