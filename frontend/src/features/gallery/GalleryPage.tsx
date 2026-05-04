import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Image, ListImagesParams } from '../../api/client'
import { EmptyState } from '../../components/EmptyState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { GalleryToolbar } from '../../components/GalleryToolbar'
import { ImageCard } from '../../components/ImageCard'
import { Spinner } from '../../components/ui/Spinner'
import { useDeleteImage, useImages } from '../../hooks/useImages'
import { useAuthStore } from '../../stores/auth'
import { colors, spacing, typography } from '../../theme'
import { ImageDetail } from './ImageDetail'
import { UploadForm } from './UploadForm'

/** Main gallery page: header, search/sort toolbar, optional upload form, and image grid. */
export function GalleryPage() {
  const token = useAuthStore((s) => s.token)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [active, setActive] = useState<Image | null>(null)

  const params: ListImagesParams = useMemo(
    () => ({
      search: search || undefined,
      sort: sort as ListImagesParams['sort'],
    }),
    [search, sort],
  )

  const { data: images, isLoading, error } = useImages(params)
  const deleteMutation = useDeleteImage()

  const handleDelete = (image: Image) => {
    if (!confirm(`Delete "${image.title}"?`)) return
    deleteMutation.mutate(image.id)
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
      <header style={{ textAlign: 'center', marginBottom: spacing['3xl'] }}>
        <h1
          style={{
            margin: 0,
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.neutral[900],
            letterSpacing: '-1px',
          }}
        >
          Discover the gallery
        </h1>
        <p
          style={{
            marginTop: spacing.sm,
            color: colors.neutral[600],
            fontSize: typography.fontSize.base,
          }}
        >
          A collaborative space for sharing images.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: token ? 'minmax(0, 360px) 1fr' : '1fr',
          gap: spacing['2xl'],
          alignItems: 'start',
        }}
      >
        {token && (
          <aside style={{ position: 'sticky', top: 80 }}>
            <UploadForm />
          </aside>
        )}

        <section>
          <GalleryToolbar
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
          />

          {error && <ErrorBanner message={(error as Error).message} />}

          {isLoading ? (
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
                  onDelete={token ? handleDelete : undefined}
                />
              ))}
            </div>
          ) : (
            <EmptyState
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
                    style={{ color: colors.primary[600], fontWeight: 600 }}
                  >
                    Sign in →
                  </Link>
                )
              }
            />
          )}
        </section>
      </div>

      <ImageDetail image={active} onClose={() => setActive(null)} />
    </div>
  )
}
