'use client'

import { useEffect } from 'react'
import { tokens } from '@/lib/tokens'

type Props = { url: string; title: string; filmId: string; purchaseToken?: string }

export default function DownloadButton({ url, title, filmId, purchaseToken }: Props) {
  // Stash the purchase token client-side so a later re-download gate
  // (still to be built) can pick it up without re-plumbing this page —
  // no network call happens with it yet.
  useEffect(() => {
    if (!purchaseToken) return
    try {
      sessionStorage.setItem(`solv_purchase_token_${filmId}`, purchaseToken)
    } catch {
      // sessionStorage unavailable (private mode, etc.) — non-critical
    }
  }, [filmId, purchaseToken])

  return (
    <a
      href={url}
      download
      className="w-full py-4 rounded-2xl text-white text-lg font-semibold tracking-wide text-center active:scale-95 transition-transform block"
      style={{ backgroundColor: tokens.color.blue }}
    >
      Download {title}
    </a>
  )
}
