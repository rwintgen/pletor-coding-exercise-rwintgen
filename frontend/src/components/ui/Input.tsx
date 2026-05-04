import { InputHTMLAttributes, forwardRef } from 'react'
import { colors, radii, spacing, typography } from '../../theme'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

/** Themed text input with optional label and inline error message. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, ...rest }, ref) => {
    return (
      <label
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.xs,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.neutral[700],
          fontFamily: typography.fontFamily,
        }}
      >
        {label}
        <input
          ref={ref}
          {...rest}
          style={{
            padding: spacing.sm,
            borderRadius: radii.md,
            border: `1px solid ${error ? colors.error[500] : colors.neutral[300]}`,
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamily,
            outline: 'none',
            ...style,
          }}
        />
        {error && (
          <span style={{ color: colors.error[700], fontSize: typography.fontSize.xs }}>
            {error}
          </span>
        )}
      </label>
    )
  },
)
Input.displayName = 'Input'
