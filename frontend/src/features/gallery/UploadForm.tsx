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

/** Upload form panel — title input, drop zone, submit, quota indicator. */
export function UploadForm({ onSuccess }: UploadFormProps) {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const upload = useUploadImage()
  const { data: quota } = useQuota()

  const canUpload = quota?.can_upload ?? true

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsed = uploadSchema.safeParse({ title })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    if (!file) {
      setError('Please select an image to upload')
      return
    }

    const form = new FormData()
    form.append('file', file)
    form.append('title', title)

    try {
      await upload.mutateAsync(form)
      setTitle('')
      setFile(null)
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
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
          Upload a new image
        </h2>
        <p
          style={{
            margin: `${spacing.xs} 0 0`,
            fontSize: typography.fontSize.sm,
            color: colors.neutral[500],
          }}
        >
          JPEG, PNG, GIF or WebP · max 10 per day
        </p>
      </div>

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give it a memorable name"
        disabled={!canUpload}
      />

      <DropZone onFile={setFile} selectedFile={file} disabled={!canUpload} />

      {quota && <QuotaIndicator quota={quota} />}
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <Button type="submit" disabled={upload.isPending || !canUpload} fullWidth>
        {upload.isPending ? 'Uploading…' : 'Upload image'}
      </Button>
    </form>
  )
}
