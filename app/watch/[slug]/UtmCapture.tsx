'use client'

import { useEffect } from 'react'
import { saveUtm, readUtm, type UtmParams } from '@/lib/utm'

export default function UtmCapture({ utm, filmId }: { utm: UtmParams; filmId: string }) {
  useEffect(() => {
    if (Object.values(utm).some(Boolean)) {
      saveUtm(utm)
    }

    const sessionKey = 'arclo_session'
    const sessionId =
      sessionStorage.getItem(sessionKey) ??
      (() => {
        const id = crypto.randomUUID()
        sessionStorage.setItem(sessionKey, id)
        return id
      })()

    const effectiveUtm = Object.values(utm).some(Boolean) ? utm : readUtm()

    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'page_view', film_id: filmId, session_id: sessionId, ...effectiveUtm }),
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
