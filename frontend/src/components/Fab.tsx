import { useState } from 'react'
import { colors, gradients, radii, shadows, transitions } from '../theme'

interface FabProps {
  onClick: () => void
  label?: string
}

/** Floating action button — gradient brand, smooth hover/press feedback. */
export function Fab({ onClick, label = 'Upload image' }: FabProps) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setActive(false)
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        width: 60,
        height: 60,
        borderRadius: radii.xl,
        background: gradients.brand,
        color: colors.neutral[0],
        border: 'none',
        cursor: 'pointer',
        boxShadow: hover
          ? '0 22px 50px -10px rgba(99,102,241,0.55), 0 0 0 6px rgba(99,102,241,0.12)'
          : shadows.brand,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: active
          ? 'scale(0.96)'
          : hover
            ? 'scale(1.08)'
            : 'scale(1)',
        transition: `transform ${transitions.normal}, box-shadow ${transitions.normal}`,
        zIndex: 40,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
    </button>
  )
}
