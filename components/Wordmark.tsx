import { tokens } from '@/lib/tokens'

type WordmarkProps = {
  size?: number
  tracking?: string
  color?: string
  fontFamily?: string
  className?: string
  style?: React.CSSProperties
}

export function Wordmark({
  size = 13,
  tracking = '0.3em',
  color = tokens.color.muted2,
  fontFamily = tokens.font.display,
  className,
  style,
}: WordmarkProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily,
        fontSize: size,
        letterSpacing: tracking,
        textTransform: 'uppercase',
        color,
        ...style,
      }}
    >
      SØLV
    </span>
  )
}
