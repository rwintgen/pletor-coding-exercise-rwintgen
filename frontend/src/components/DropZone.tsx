import { useRef, useState } from 'react'
import { colors, radii, spacing, transitions, typography } from '../theme'

interface DropZoneProps {
  /** Called with the full list of accepted files (single or batch). */
  onFiles: (files: File[]) => void
  selectedFiles: File[]
  disabled?: boolean
  /** When true, allows selecting multiple files at once. */
  multiple?: boolean
}

/** Drag-and-drop file picker — supports single or batch uploads. */
export function DropZone({ onFiles, selectedFiles, disabled, multiple }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hover, setHover] = useState(false)

  const accept = (files: FileList | File[] | null | undefined) => {
    if (!files) return
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (arr.length === 0) return
    onFiles(multiple ? arr : [arr[0]])
  }

  const active = isDragging || hover
  const count = selectedFiles.length

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
        if (!disabled) accept(e.dataTransfer.files)
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
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => accept(e.target.files)}
        style={{ display: 'none' }}
      />
      {count > 0 ? (
        <div>
          <p
            style={{
              margin: 0,
              color: colors.neutral[800],
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.sm,
            }}
          >
            {count === 1
              ? selectedFiles[0].name
              : `${count} images selected`}
          </p>
          <p
            style={{
              margin: `${spacing.xs} 0 0 0`,
              fontSize: typography.fontSize.xs,
              color: colors.neutral[500],
            }}
          >
            {count === 1
              ? `${(selectedFiles[0].size / 1024).toFixed(1)} KB · click or drop to replace`
              : `${(selectedFiles.reduce((s, f) => s + f.size, 0) / 1024).toFixed(1)} KB total · click or drop to replace`}
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
            {multiple ? 'Drop one or more images here' : 'Drop an image here'}
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
