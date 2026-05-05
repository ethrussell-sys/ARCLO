import { getSessionId, getDeviceInfo } from './session'
import { readUtm } from './utm'

export type TrackPayload = {
  event_type: string
  film_id?: string
  film_slug?: string
  metadata?: Record<string, unknown>
}

export function track(payload: TrackPayload): void {
  const sessionId = getSessionId()
  const { device_type, browser, os } = getDeviceInfo()
  const utm = readUtm()
  const now = new Date()

  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: payload.event_type,
      film_id: payload.film_id ?? null,
      film_slug: payload.film_slug ?? null,
      session_id: sessionId,
      device_type,
      ...utm,
      metadata: {
        browser,
        os,
        hour_of_day: now.getHours(),
        day_of_week: now.getDay(),
        ...payload.metadata,
      },
    }),
  }).catch(() => {})
}
