import { ImageResponse } from 'next/og'
import { tokens } from '@/lib/tokens'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: tokens.color.bg,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            color: tokens.color.ink,
            fontSize: 160,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            letterSpacing: '0.05em',
            lineHeight: 1,
          }}
        >
          SØLV
        </div>
        <div
          style={{
            marginTop: 28,
            color: tokens.color.muted,
            fontSize: 28,
            fontFamily: 'sans-serif',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          Own the films that matter
        </div>
      </div>
    ),
    { ...size }
  )
}
