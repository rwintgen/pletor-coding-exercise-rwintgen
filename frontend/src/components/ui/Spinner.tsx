import { colors } from '../../theme'

interface SpinnerProps {
  size?: number
  color?: string
}

/** Simple CSS spinner for loading states. */
export function Spinner({ size = 24, color = colors.neutral[500] }: SpinnerProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid ${colors.neutral[200]}`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )
}
