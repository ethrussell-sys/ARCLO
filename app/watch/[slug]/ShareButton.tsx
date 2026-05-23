'use client'

import { useRef, useState } from 'react'
import { track } from '@/lib/track'

const MAX_NOTE = 120

export default function ShareButton({
  filmId,
  filmSlug,
  sharePath,
}: {
  filmId?: string
  filmSlug?: string
  sharePath?: string
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // Prevents blur from firing when the user clicks the toggle button itself
  const suppressBlurRef = useRef(false)

  function buildUrl() {
    const base = `${window.location.origin}${sharePath ?? window.location.pathname}`
    return note.trim() ? `${base}?note=${encodeURIComponent(note.trim())}` : base
  }

  async function copyAndClose() {
    if (copied) return
    const url = buildUrl()
    track({ event_type: 'share_button_click', film_id: filmId, film_slug: filmSlug })

    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(url) } catch {}
    } else if (typeof navigator.share === 'function') {
      try { await navigator.share({ url }) } catch {}
    }

    setCopied(true)
    setTimeout(() => {
      setOpen(false)
      setNote('')
      setCopied(false)
    }, 1400)
  }

  function handleToggle() {
    if (open) {
      setOpen(false)
      setNote('')
    } else {
      setOpen(true)
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      copyAndClose()
    } else if (e.key === 'Escape') {
      setOpen(false)
      setNote('')
    }
  }

  function handleBlur() {
    if (suppressBlurRef.current) {
      suppressBlurRef.current = false
      return
    }
    copyAndClose()
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        onMouseDown={() => { suppressBlurRef.current = true }}
        onClick={handleToggle}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: open || copied ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)',
          fontSize: '12px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '8px 16px',
          transition: 'color 0.2s ease',
        }}
      >
        {copied ? 'Link copied.' : 'Share this film'}
      </button>

      {/* Slide-in panel — always in DOM for smooth exit animation */}
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
          height: open ? '46px' : '0',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(4px)',
          transition: 'height 0.22s ease-out, opacity 0.18s ease-out, transform 0.22s ease-out',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Add a note..."
          style={{
            width: '100%',
            height: '46px',
            background: '#0d0d0d',
            border: '1px solid #222',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            padding: '0 14px',
            outline: 'none',
            fontFamily: 'var(--font-geist-sans)',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  )
}
