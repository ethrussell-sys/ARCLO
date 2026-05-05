'use client'

import { useEffect } from 'react'
import { track } from '@/lib/track'
import { getVisitRecord } from '@/lib/session'

export default function PurchaseTracker({ filmId, filmSlug }: { filmId: string; filmSlug: string }) {
  useEffect(() => {
    // Avoid double-firing if Apple Pay already set this flag
    const alreadyFired = sessionStorage.getItem(`arclo_purchased_${filmSlug}`)
    if (alreadyFired) return

    sessionStorage.setItem(`arclo_purchased_${filmSlug}`, '1')

    const visit = getVisitRecord(filmSlug)
    const secondsToPurchase = Math.round(
      (Date.now() - new Date(visit.firstAt).getTime()) / 1000
    )

    track({
      event_type: 'purchase_completed',
      film_id: filmId,
      film_slug: filmSlug,
      metadata: {
        visit_count: visit.count,
        first_visit_at: visit.firstAt,
        seconds_to_purchase: secondsToPurchase,
      },
    })

    if (visit.count > 1) {
      track({
        event_type: 'multi_visit_conversion',
        film_id: filmId,
        film_slug: filmSlug,
        metadata: {
          visit_count: visit.count,
          days_to_convert: Math.floor(secondsToPurchase / 86_400),
        },
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
