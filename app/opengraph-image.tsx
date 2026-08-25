import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
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
            color: '#ffffff',
            fontSize: 160,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            letterSpacing: '0.05em',
            lineHeight: 1,
          }}
        >
          S&#216;LV
        </div>
        <div
          style={{
            marginTop: 28,
            color: 'rgba(255,255,255,0.5)',
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
