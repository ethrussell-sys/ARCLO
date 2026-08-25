export type DeviceInfo = {
  device_type: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
}

export type VisitRecord = {
  count: number
  firstAt: string
}

const SESSION_KEY = 'solv_session'
const LEGACY_SESSION_KEY = 'arclo_session'
const VISITS_KEY = 'solv_visits'
const LEGACY_VISITS_KEY = 'arclo_visits'

export function getSessionId(): string {
  // Fall back to the pre-rename key so an existing visitor's session id (and
  // the analytics continuity tied to it) carries over instead of resetting.
  const existing = localStorage.getItem(SESSION_KEY) ?? localStorage.getItem(LEGACY_SESSION_KEY)
  if (existing) {
    localStorage.setItem(SESSION_KEY, existing)
    return existing
  }
  const id = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY, id)
  return id
}

export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent

  let device_type: DeviceInfo['device_type'] = 'desktop'
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device_type = 'tablet'
  } else if (/mobile|iphone|ipod|android|blackberry|windows phone/i.test(ua)) {
    device_type = 'mobile'
  }

  let browser = 'unknown'
  if (/edg\//i.test(ua)) browser = 'Edge'
  else if (/opr\//i.test(ua)) browser = 'Opera'
  else if (/chrome/i.test(ua)) browser = 'Chrome'
  else if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/safari/i.test(ua)) browser = 'Safari'

  let os = 'unknown'
  if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/mac os x/i.test(ua)) os = 'macOS'
  else if (/windows/i.test(ua)) os = 'Windows'
  else if (/linux/i.test(ua)) os = 'Linux'

  return { device_type, browser, os }
}

// Falls back to the pre-rename key so existing visitors keep their visit
// history (return-visit / multi-visit-conversion analytics) after the rename.
function readVisits(): Record<string, VisitRecord> {
  try {
    const raw = localStorage.getItem(VISITS_KEY) ?? localStorage.getItem(LEGACY_VISITS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getVisitRecord(filmSlug: string): VisitRecord {
  const all = readVisits()
  return all[filmSlug] ?? { count: 0, firstAt: new Date().toISOString() }
}

export function incrementVisit(filmSlug: string): VisitRecord {
  try {
    const all = readVisits()
    const existing = all[filmSlug]
    const updated: VisitRecord = existing
      ? { count: existing.count + 1, firstAt: existing.firstAt }
      : { count: 1, firstAt: new Date().toISOString() }
    all[filmSlug] = updated
    localStorage.setItem(VISITS_KEY, JSON.stringify(all))
    return updated
  } catch {
    return { count: 1, firstAt: new Date().toISOString() }
  }
}
