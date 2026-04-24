'use client'

import { useState } from 'react'

export default function ShareSection({ watchUrl }: { watchUrl: string }) {
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  const maxNote = 120
  const maxName = 50

  async function handleShare() {
    const params = new URLSearchParams()
    if (name.trim()) params.set('from', name.trim())
    if (note.trim()) params.set('note', note.trim())
    const query = params.toString()
    const url = query ? `${watchUrl}?${query}` : watchUrl

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
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, maxName))}
        placeholder="Your name"
        style={{
          width: '100%',
          background: '#0d0d0d',
          border: '1px solid #222',
          borderRadius: '12px',
          color: '#fff',
          fontSize: '14px',
          lineHeight: 1.5,
          padding: '12px 14px',
          outline: 'none',
          fontFamily: 'var(--font-geist-sans)',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ position: 'relative' }}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, maxNote))}
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
          color: note.length >= maxNote ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.2)',
          pointerEvents: 'none',
        }}>
          {note.length}/{maxNote}
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
