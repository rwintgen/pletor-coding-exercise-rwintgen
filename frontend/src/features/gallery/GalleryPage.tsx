import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Image, ListImagesParams } from '../../api/client'
import { EmptyState } from '../../components/EmptyState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { Fab } from '../../components/Fab'
import { GalleryToolbar } from '../../components/GalleryToolbar'
import { ImageCard } from '../../components/ImageCard'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useDeleteImage, useImages } from '../../hooks/useImages'
import { useAuthStore } from '../../stores/auth'
import { colors, gradients, spacing, typography } from '../../theme'
import { ImageDetail } from './ImageDetail'
import { UploadForm } from './UploadForm'

/** Main gallery page: hero, toolbar, image grid, FAB for upload, lightbox. */
export function GalleryPage() {
  const token = useAuthStore((s) => s.token)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [active, setActive] = useState<Image | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const params: ListImagesParams = useMemo(
    () => ({
      search: search || undefined,
      sort: sort as ListImagesParams['sort'],
    }),
    [search, sort],
  )

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useImages(params)
  const images = data?.pages.flat()
  const deleteMutation = useDeleteImage()

  const handleDelete = (image: Image) => {
    if (!confirm(`Delete "${image.title}"?`)) return
    deleteMutation.mutate(image.id)
  }

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
      <header style={{ textAlign: 'center', marginBottom: spacing['3xl'] }}>
        <h1
          style={{
            margin: 0,
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            background: gradients.brand,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Discover the gallery
        </h1>
        <p
          style={{
            marginTop: spacing.md,
            color: colors.neutral[600],
            fontSize: typography.fontSize.base,
          }}
        >
          A collaborative space for sharing images.
        </p>
      </header>

      <GalleryToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />

      {error && <ErrorBanner message={(error as Error).message} />}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: spacing['3xl'] }}>
          <Spinner size={36} />
        </div>
      ) : images && images.length > 0 ? (
        <>
          <div
            className="masonry stagger-fade"
          >
            {images.map((img) => (
              <ImageCard
                key={img.id}
                image={img}
                onClick={setActive}
                onDelete={token ? handleDelete : undefined}
              />
            ))}
          </div>
          {hasNextPage && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: spacing['2xl'] }}>
              <Button
                variant="secondary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon="📸"
          title="No images yet"
          description={
            token
              ? 'Upload the first image to get the gallery started.'
              : 'Sign in to upload the first image.'
          }
          action={
            !token && (
              <Link
                to="/login"
                style={{
                  color: colors.primary[600],
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Sign in →
              </Link>
            )
          }
        />
      )}

      {token && <Fab onClick={() => setShowUpload(true)} />}

      <Modal open={showUpload} onClose={() => setShowUpload(false)} maxWidth={480}>
        <div style={{ padding: spacing.xl }}>
          <UploadForm onSuccess={() => setShowUpload(false)} />
        </div>
      </Modal>

      <ImageDetail image={active} onClose={() => setActive(null)} />
    </div>
  )
}
