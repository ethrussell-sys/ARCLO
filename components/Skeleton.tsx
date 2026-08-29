import type { CSSProperties } from 'react'
import { tokens } from '@/lib/tokens'

type SkeletonProps = {
  width?: number | string
  height?: number | string
  radius?: number
  className?: string
  style?: CSSProperties
}

export function Skeleton({ width = '100%', height = 16, radius = tokens.radius.sm, className, style }: SkeletonProps) {
  return (
    <div
      className={`animate-solvpulse ${className ?? ''}`.trim()}
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: tokens.color.surface2,
        ...style,
      }}
    />
  )
}
