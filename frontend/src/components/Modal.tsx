import { ReactNode, useEffect } from 'react'
import { colors, radii, shadows, spacing } from '../theme'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Maximum width in px. Default 800. */
  maxWidth?: number
}

/** Centered modal overlay. Closes on backdrop click or Escape. */
export function Modal({ open, onClose, children, maxWidth = 800 }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: spacing.lg,
        animation: 'fadeIn 150ms ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.neutral[0],
          borderRadius: radii.xl,
          boxShadow: shadows.xl,
          maxWidth,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'scaleIn 200ms ease',
        }}
      >
        {children}
      </div>
    </div>
  )
}
