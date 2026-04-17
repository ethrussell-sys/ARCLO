import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#000000',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          color: '#0A84FF',
          fontSize: 300,
          fontWeight: 900,
          fontFamily: 'serif',
          lineHeight: 1,
          letterSpacing: '-12px',
        }}
      >
        A
      </div>
    </div>,
    { ...size }
  )
}
