'use client'

import { useState } from 'react'
import { track } from '@/lib/track'

export default function ShareButton({ filmId, filmSlug }: { filmId?: string; filmSlug?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    track({ event_type: 'share_button_click', film_id: filmId, film_slug: filmSlug })
    const url = window.location.href
    const canShare = typeof navigator.share === 'function'

    if (canShare) {
      try {
        await navigator.share({ url })
      } catch {
        // user cancelled — no-op
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.35)',
        fontSize: '12px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '8px 0',
        transition: 'color 0.2s ease',
      }}
    >
      {copied ? 'Link copied.' : 'Share this film'}
    </button>
  )
}
