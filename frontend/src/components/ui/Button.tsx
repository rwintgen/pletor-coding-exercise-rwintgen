import { ButtonHTMLAttributes, CSSProperties } from 'react'
import { colors, radii, spacing, transitions, typography } from '../../theme'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantStyles: Record<Variant, CSSProperties> = {
  primary: { background: colors.neutral[900], color: colors.neutral[0] },
  secondary: { background: colors.neutral[100], color: colors.neutral[900] },
  danger: { background: colors.error[500], color: colors.neutral[0] },
  ghost: { background: 'transparent', color: colors.neutral[700] },
}

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { padding: `${spacing.xs} ${spacing.md}`, fontSize: typography.fontSize.sm },
  md: { padding: `${spacing.sm} ${spacing.lg}`, fontSize: typography.fontSize.base },
  lg: { padding: `${spacing.md} ${spacing.xl}`, fontSize: typography.fontSize.base },
}

/**
 * Themed button. Variants: primary (default), secondary, danger, ghost.
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
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        width: fullWidth ? '100%' : undefined,
        border: 'none',
        borderRadius: radii.md,
        fontWeight: typography.fontWeight.semibold,
        fontFamily: typography.fontFamily,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: `all ${transitions.fast}`,
        ...style,
      }}
    />
  )
}
