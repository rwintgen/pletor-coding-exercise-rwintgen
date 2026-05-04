import { InputHTMLAttributes, forwardRef, useId, useState } from 'react'
import { colors, radii, shadows, spacing, transitions, typography } from '../../theme'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

/** Themed text input with optional label, animated focus ring, and inline error message. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, id, name, onFocus, onBlur, ...rest }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const inputName = name ?? (label ? label.toLowerCase().replace(/\s+/g, '_') : undefined)
    const [focused, setFocused] = useState(false)
    const borderColor = error
      ? colors.error[500]
      : focused
        ? colors.primary[500]
        : colors.neutral[200]
    const ring = focused && !error ? shadows.glow : error ? '0 0 0 4px rgba(239,68,68,0.15)' : 'none'
    return (
      <label
        htmlFor={inputId}
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
          id={inputId}
          name={inputName}
          {...rest}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            height: 44,
            background: colors.neutral[0],
            borderRadius: radii.md,
            border: `1px solid ${borderColor}`,
            boxShadow: ring,
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily,
            color: colors.neutral[900],
            outline: 'none',
            transition: `border-color ${transitions.fast}, box-shadow ${transitions.fast}`,
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
