import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: '#000000',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
      }}
    >
      <div
        style={{
          color: '#0A84FF',
          fontSize: 108,
          fontWeight: 900,
          fontFamily: 'serif',
          lineHeight: 1,
          letterSpacing: '-4px',
        }}
      >
        A
      </div>
    </div>,
    { ...size }
  )
}
