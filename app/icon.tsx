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
          color: '#ffffff',
          fontSize: 300,
          fontWeight: 900,
          fontFamily: 'sans-serif',
          lineHeight: 1,
        }}
      >
        S
      </div>
    </div>,
    { ...size }
  )
}
