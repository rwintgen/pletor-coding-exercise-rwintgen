import { FormEvent, useState } from 'react'
import { ErrorBanner } from '../../components/ErrorBanner'
import { DropZone } from '../../components/DropZone'
import { QuotaIndicator } from '../../components/QuotaIndicator'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useUploadImage } from '../../hooks/useImages'
import { useQuota } from '../../hooks/useQuota'
import { uploadSchema } from '../../lib/schemas'
import { colors, spacing, typography } from '../../theme'

interface UploadFormProps {
  onSuccess?: () => void
}

/** Strip the extension from a filename to use as a default title. */
const titleFromFile = (name: string) => name.replace(/\.[^/.]+$/, '').slice(0, 200)

/** Upload form panel — supports single or batch uploads with shared title. */
export function UploadForm({ onSuccess }: UploadFormProps) {
  const [title, setTitle] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const upload = useUploadImage()
  const { data: quota } = useQuota()

  const canUpload = quota?.can_upload ?? true
  const isBatch = files.length > 1
  const remaining = quota?.user_remaining ?? Infinity
  const overQuota = files.length > remaining

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (files.length === 0) {
      setError('Please select at least one image to upload')
      return
    }

    if (overQuota) {
      setError(`You can only upload ${remaining} more image(s) today.`)
      return
    }

    // For single uploads we validate the user-provided title.
    // For batch uploads each file falls back to its filename when the
    // shared title is empty.
    if (!isBatch) {
      const parsed = uploadSchema.safeParse({ title: title || titleFromFile(files[0].name) })
      if (!parsed.success) {
        setError(parsed.error.issues[0].message)
        return
      }
    }

    setProgress({ done: 0, total: files.length })
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        const form = new FormData()
        form.append('file', f)
        form.append('title', (isBatch ? title.trim() : title) || titleFromFile(f.name))
        await upload.mutateAsync(form)
        setProgress({ done: i + 1, total: files.length })
      }
      setTitle('')
      setFiles([])
      setProgress(null)
      onSuccess?.()
    } catch (err: any) {
      // Some files may already have uploaded — keep the rest selected so the
      // user can retry without losing context.
      setError(err.message)
      setProgress(null)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg,
        fontFamily: typography.fontFamily,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.neutral[900],
            letterSpacing: '-0.02em',
          }}
        >
          Upload images
        </h2>
        <p
          style={{
            margin: `${spacing.xs} 0 0`,
            fontSize: typography.fontSize.sm,
            color: colors.neutral[500],
          }}
        >
          JPEG, PNG, GIF or WebP · drop one or many · max 10 per day
        </p>
      </div>

      <Input
        label={isBatch ? 'Shared title (optional)' : 'Title'}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={isBatch ? 'Leave empty to use each filename' : 'Give it a memorable name'}
        disabled={!canUpload || !!progress}
      />

      <DropZone
        onFiles={setFiles}
        selectedFiles={files}
        disabled={!canUpload || !!progress}
        multiple
      />

      {quota && <QuotaIndicator quota={quota} />}
      {overQuota && (
        <ErrorBanner
          message={`You selected ${files.length} files but only ${remaining} upload(s) remain today.`}
        />
      )}
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <Button
        type="submit"
        disabled={upload.isPending || !canUpload || files.length === 0 || overQuota}
        fullWidth
      >
        {progress
          ? `Uploading ${progress.done}/${progress.total}…`
          : files.length > 1
          ? `Upload ${files.length} images`
          : 'Upload image'}
      </Button>
    </form>
  )
}
