export type UtmParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

const UTM_KEY = 'solv_utm'
const LEGACY_UTM_KEY = 'arclo_utm'

export function saveUtm(params: UtmParams) {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => Boolean(v))
  ) as UtmParams
  if (Object.keys(filtered).length > 0) {
    localStorage.setItem(UTM_KEY, JSON.stringify(filtered))
  }
}

export function readUtm(): UtmParams {
  try {
    // Fall back to the pre-rename key so UTM attribution saved before the
    // rename still applies to an in-flight session's checkout/events.
    const raw = localStorage.getItem(UTM_KEY) ?? localStorage.getItem(LEGACY_UTM_KEY)
    return raw ? (JSON.parse(raw) as UtmParams) : {}
  } catch {
    return {}
  }
}
