'use client'

import { useState } from 'react'

export default function ShareSection({ watchUrl }: { watchUrl: string }) {
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  const max = 120

  async function handleShare() {
    const url = note.trim()
      ? `${watchUrl}?note=${encodeURIComponent(note.trim())}`
      : watchUrl

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      borderTop: '1px solid #1a1a1a',
      paddingTop: '24px',
    }}>
      <div style={{ position: 'relative' }}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, max))}
          placeholder="Add a note for your friend..."
          rows={2}
          style={{
            width: '100%',
            background: '#0d0d0d',
            border: '1px solid #222',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            lineHeight: 1.5,
            padding: '12px 14px 28px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'var(--font-geist-sans)',
            boxSizing: 'border-box',
          }}
        />
        <span style={{
          position: 'absolute',
          bottom: '10px',
          right: '12px',
          fontSize: '11px',
          color: note.length >= max ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.2)',
          pointerEvents: 'none',
        }}>
          {note.length}/{max}
        </span>
      </div>

      <button
        onClick={handleShare}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: '1px solid #333',
          background: 'transparent',
          color: '#fff',
          fontSize: '14px',
          letterSpacing: '0.06em',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
        }}
      >
        {copied ? 'Link copied.' : 'Share this film'}
      </button>
    </div>
  )
}
