import { useRef, useState } from 'react'
import { colors, radii, spacing, transitions, typography } from '../theme'

interface DropZoneProps {
  onFile: (file: File) => void
  selectedFile: File | null
  disabled?: boolean
}

/** Drag-and-drop file picker for image uploads. */
export function DropZone({ onFile, selectedFile, disabled }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hover, setHover] = useState(false)

  const accept = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    onFile(file)
  }

  const active = isDragging || hover

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setIsDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        if (!disabled) accept(e.dataTransfer.files[0])
      }}
      style={{
        border: `2px dashed ${isDragging ? colors.primary[500] : active ? colors.primary[400] : colors.neutral[200]}`,
        borderRadius: radii.lg,
        padding: spacing['2xl'],
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isDragging ? colors.primary[50] : active ? colors.neutral[50] : colors.neutral[0],
        transition: `border-color ${transitions.fast}, background ${transitions.fast}, transform ${transitions.fast}`,
        transform: isDragging ? 'scale(1.01)' : 'scale(1)',
        opacity: disabled ? 0.5 : 1,
        fontFamily: typography.fontFamily,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={(e) => accept(e.target.files?.[0] ?? undefined)}
        style={{ display: 'none' }}
      />
      {selectedFile ? (
        <div>
          <p
            style={{
              margin: 0,
              color: colors.neutral[800],
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.sm,
            }}
          >
            {selectedFile.name}
          </p>
          <p
            style={{
              margin: `${spacing.xs} 0 0 0`,
              fontSize: typography.fontSize.xs,
              color: colors.neutral[500],
            }}
          >
            {(selectedFile.size / 1024).toFixed(1)} KB · click or drop to replace
          </p>
        </div>
      ) : (
        <div>
          <div
            style={{
              fontSize: 28,
              marginBottom: spacing.sm,
              transition: `transform ${transitions.normal}`,
              transform: isDragging ? 'translateY(-4px)' : 'none',
            }}
          >
            📁
          </div>
          <p
            style={{
              margin: 0,
              color: colors.neutral[800],
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.sm,
            }}
          >
            Drop an image here
          </p>
          <p
            style={{
              margin: `${spacing.xs} 0 0 0`,
              fontSize: typography.fontSize.xs,
              color: colors.neutral[500],
            }}
          >
            or click to browse your files
          </p>
        </div>
      )}
    </div>
  )
}
