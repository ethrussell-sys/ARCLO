export type UtmParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

const UTM_KEY = 'arclo_utm'

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
    const raw = localStorage.getItem(UTM_KEY)
    return raw ? (JSON.parse(raw) as UtmParams) : {}
  } catch {
    return {}
  }
}
