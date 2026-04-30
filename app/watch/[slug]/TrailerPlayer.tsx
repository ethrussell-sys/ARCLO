'use client'

import { useRef, useState } from 'react'
import { readUtm } from '@/lib/utm'

export default function TrailerPlayer({ embedUrl, title, filmId }: { embedUrl: string; title: string; filmId: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [muted, setMuted] = useState(true)
  const firedRef = useRef(false)

  function toggleMute() {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage(
      JSON.stringify({ event: 'command', func: muted ? 'unMute' : 'mute', args: [] }),
      '*'
    )
    if (muted && !firedRef.current) {
      firedRef.current = true
      const sessionId = sessionStorage.getItem('arclo_session') ?? ''
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'trailer_play', film_id: filmId, session_id: sessionId, ...readUtm() }),
      }).catch(() => {})
    }
    setMuted((m) => !m)
  }

  // enablejsapi=1 is required for postMessage mute commands to work
  const src = `${embedUrl}&enablejsapi=1`

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
      {/* Rounded clip wrapper */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
      }}>
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Mute toggle — outside the overflow:hidden wrapper so it's never clipped */}
      <button
        onClick={toggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 10,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          color: '#fff',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}
