'use client'

import { useEffect } from 'react'
import { saveUtm, type UtmParams } from '@/lib/utm'
import { incrementVisit, getVisitRecord } from '@/lib/session'
import { track } from '@/lib/track'

type Props = {
  utm: UtmParams
  filmId: string
  filmSlug: string
}

export default function PageTracker({ utm, filmId, filmSlug }: Props) {
  useEffect(() => {
    if (Object.values(utm).some(Boolean)) saveUtm(utm)

    const visit = incrementVisit(filmSlug)
    const pageStartAt = Date.now()
    const referrer = document.referrer || undefined
    const hasUtm = Object.values(utm).some(Boolean)

    track({
      event_type: 'page_view',
      film_id: filmId,
      film_slug: filmSlug,
      metadata: {
        referrer: hasUtm ? undefined : referrer,
        visit_count: visit.count,
      },
    })

    if (visit.count > 1) {
      track({
        event_type: 'return_visit',
        film_id: filmId,
        film_slug: filmSlug,
        metadata: {
          visit_count: visit.count,
          first_visit_at: visit.firstAt,
          days_since_first: Math.floor(
            (Date.now() - new Date(visit.firstAt).getTime()) / 86_400_000
          ),
        },
      })
    }

    // ── Scroll depth ────────────────────────────────────────────────────────
    const scrollMilestones = [25, 50, 75, 100]
    const firedScroll = new Set<number>()
    let maxScrollDepth = 0

    function onScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const pct = Math.min(100, Math.round((window.scrollY / docHeight) * 100))
      if (pct > maxScrollDepth) maxScrollDepth = pct
      for (const milestone of scrollMilestones) {
        if (pct >= milestone && !firedScroll.has(milestone)) {
          firedScroll.add(milestone)
          track({
            event_type: 'scroll_depth',
            film_id: filmId,
            film_slug: filmSlug,
            metadata: { depth_percent: milestone },
          })
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Intersection observers ───────────────────────────────────────────────
    const observers: IntersectionObserver[] = []

    function observe(selector: string, eventType: string) {
      const el = document.querySelector(selector)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            track({ event_type: eventType, film_id: filmId, film_slug: filmSlug })
            obs.disconnect()
          }
        },
        { threshold: 0.5 }
      )
      obs.observe(el)
      observers.push(obs)
    }

    observe('[data-track="synopsis"]', 'synopsis_viewed')
    observe('[data-track="buy-section"]', 'buy_button_visible')

    // ── Page exit ────────────────────────────────────────────────────────────
    function fireExit() {
      const purchased = sessionStorage.getItem(`arclo_purchased_${filmSlug}`)
      if (purchased) return
      const timeOnPage = Math.round((Date.now() - pageStartAt) / 1000)
      track({
        event_type: 'page_exit_without_purchase',
        film_id: filmId,
        film_slug: filmSlug,
        metadata: { time_on_page_seconds: timeOnPage, max_scroll_depth: maxScrollDepth },
      })
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        const timeOnPage = Math.round((Date.now() - pageStartAt) / 1000)
        track({
          event_type: 'time_on_page',
          film_id: filmId,
          film_slug: filmSlug,
          metadata: { time_on_page_seconds: timeOnPage, max_scroll_depth: maxScrollDepth },
        })
        fireExit()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('beforeunload', fireExit)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('beforeunload', fireExit)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      observers.forEach((o) => o.disconnect())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
