import { ButtonHTMLAttributes, CSSProperties, useState } from 'react'
import { colors, gradients, radii, shadows, spacing, transitions, typography } from '../../theme'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    background: gradients.brand,
    color: colors.neutral[0],
    boxShadow: shadows.brand,
  },
  secondary: {
    background: colors.neutral[0],
    color: colors.neutral[900],
    boxShadow: shadows.xs,
    border: `1px solid ${colors.neutral[200]}`,
  },
  danger: {
    background: colors.error[500],
    color: colors.neutral[0],
    boxShadow: '0 8px 20px -8px rgba(239,68,68,0.5)',
  },
  ghost: {
    background: 'transparent',
    color: colors.neutral[700],
  },
}

const variantHoverStyles: Record<Variant, CSSProperties> = {
  primary: {
    boxShadow: '0 14px 36px -10px rgba(99,102,241,0.55)',
    transform: 'translateY(-1px)',
  },
  secondary: {
    background: colors.neutral[50],
    boxShadow: shadows.sm,
  },
  danger: {
    background: colors.error[600],
    transform: 'translateY(-1px)',
  },
  ghost: {
    background: colors.neutral[100],
  },
}

const sizeStyles: Record<Size, CSSProperties> = {
  sm: {
    padding: `${spacing.xs} ${spacing.md}`,
    fontSize: typography.fontSize.sm,
    height: 32,
  },
  md: {
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: typography.fontSize.sm,
    height: 40,
  },
  lg: {
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: typography.fontSize.base,
    height: 48,
  },
}

/**
 * Themed button. Variants: primary (gradient), secondary, danger, ghost.
 * Sizes: sm, md (default), lg.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setActive(false)
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...(hover && !disabled ? variantHoverStyles[variant] : null),
        ...(active && !disabled ? { transform: 'translateY(0) scale(0.98)' } : null),
        width: fullWidth ? '100%' : undefined,
        border: variantStyles[variant].border ?? 'none',
        borderRadius: radii.md,
        fontWeight: typography.fontWeight.semibold,
        fontFamily: typography.fontFamily,
        letterSpacing: '-0.01em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: `transform ${transitions.fast}, box-shadow ${transitions.normal}, background ${transitions.fast}, opacity ${transitions.fast}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        whiteSpace: 'nowrap',
        ...style,
      }}
    />
  )
}

