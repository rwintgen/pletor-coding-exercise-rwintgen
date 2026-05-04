import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  deleteImage,
  getImageUrl,
  Image,
  listImages,
  uploadImage,
} from './api/client'
import { colors, spacing, typography, radii, shadows, transitions } from './theme'

function App() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = () => {
    setLoading(true)
    listImages()
      .then(setImages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    setSelectedFile(file)
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', title)
      await uploadImage(formData)
      setTitle('')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchImages()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      await deleteImage(id)
      fetchImages()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: `${spacing['2xl']} auto`, fontFamily: typography.fontFamily }}>
      <h1 style={{ textAlign: 'center', fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, marginBottom: spacing['3xl'], letterSpacing: '-1px', color: colors.neutral[900] }}>Image Gallery</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: spacing['3xl'], maxWidth: 600, margin: `0 auto ${spacing['3xl']} auto` }}>
        <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: typography.fontWeight.medium, color: colors.neutral[700], fontSize: typography.fontSize.sm }}>Title<br />
              <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: spacing.sm, borderRadius: radii.md, border: `1px solid ${colors.neutral[300]}`, width: '100%', boxSizing: 'border-box' }} />
            </label>
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? colors.primary[500] : colors.neutral[300]}`,
            borderRadius: radii.lg,
            padding: spacing['2xl'],
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragging ? colors.primary[50] : colors.neutral[50],
            marginBottom: spacing.lg,
            transition: `all ${transitions.normal}`,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
            style={{ display: 'none' }}
          />
          {selectedFile ? (
            <p style={{ margin: 0, color: colors.neutral[700], fontWeight: typography.fontWeight.medium }}>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
          ) : (
            <p style={{ margin: 0, color: colors.neutral[400] }}>Drag & drop an image here, or click to select</p>
          )}
        </div>

        <button type="submit" disabled={submitting} style={{ width: '100%', padding: `${spacing.md} ${spacing.xl}`, borderRadius: radii.md, background: colors.neutral[900], color: colors.neutral[0], fontWeight: typography.fontWeight.semibold, border: 'none', cursor: 'pointer', fontSize: typography.fontSize.base, boxShadow: shadows.sm, transition: `background ${transitions.normal}` }}>
          {submitting ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      {error && <p style={{ color: colors.error[700], textAlign: 'center', padding: `${spacing.sm} ${spacing.lg}`, background: colors.error[50], borderRadius: radii.md, maxWidth: 600, margin: `0 auto ${spacing.xl} auto` }}>{error}</p>}
      {loading && <p style={{ textAlign: 'center', color: colors.neutral[400] }}>Loading...</p>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: spacing.xl,
        alignItems: 'stretch',
      }}>
        {images.length === 0 && !loading && <p style={{ textAlign: 'center', gridColumn: '1/-1', color: colors.neutral[400] }}>No images found.</p>}
        {images.map((img) => (
          <div key={img.id} style={{ boxShadow: shadows.lg, borderRadius: radii.xl, padding: 0, background: colors.neutral[0], overflow: 'hidden', border: `1px solid ${colors.neutral[200]}`, transition: `box-shadow ${transitions.normal}`, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <img src={getImageUrl(img.url)} alt={img.title} style={{ width: '100%', display: 'block', objectFit: 'cover', height: 220, background: colors.neutral[200] }} />
            <div style={{ padding: spacing.lg, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.neutral[900] }}>{img.title}</h2>
                <p style={{ margin: `${spacing.xs} 0 0 0`, color: colors.neutral[600], fontSize: typography.fontSize.sm }}>by <span style={{ color: colors.primary[600] }}>{img.username}</span></p>
                <p style={{ margin: `${spacing.xs} 0 0 0`, fontSize: typography.fontSize.xs, color: colors.neutral[400] }}>{new Date(img.created_at).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spacing.md }}>
                <button onClick={() => handleDelete(img.id)} style={{ background: colors.error[500], color: colors.neutral[0], border: 'none', borderRadius: radii.sm, padding: `${spacing.xs} ${spacing.lg}`, cursor: 'pointer', fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
