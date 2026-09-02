import { serverClient } from '@/lib/supabase'

// The one checkpoint every download path funnels through, regardless of
// which credential proved access. A2 purchase tokens are always allowed
// and never touch the counter; every other credential kind is gated by
// the atomic increment_download_count() (migration 013), whose boolean
// result IS the allow/deny decision — no separate read-then-check.
export type CredentialKind =
  | 'purchase_token'
  | 'download_token'
  | 'redemption_code'
  | 'magic_link_session'

export type DownloadDecision =
  | { allowed: true }
  | { allowed: false; reason: 'not_found' | 'limit_reached' | 'not_implemented' }

export async function assertDownloadAllowed(
  purchaseId: string,
  credentialKind: CredentialKind
): Promise<DownloadDecision> {
  if (credentialKind === 'magic_link_session') {
    // A3 (email-magic-link session) isn't built yet — stubbed until the
    // session-cookie verification flow exists.
    return { allowed: false, reason: 'not_implemented' }
  }

  if (credentialKind === 'purchase_token') {
    const { data: purchase } = await serverClient()
      .from('purchases')
      .select('id')
      .eq('id', purchaseId)
      .maybeSingle()

    if (!purchase) return { allowed: false, reason: 'not_found' }
    return { allowed: true }
  }

  // download_token and redemption_code both land here: counted, via the
  // same atomic function, no special-casing between them.
  const { data: allowed, error } = await serverClient().rpc('increment_download_count', {
    p_purchase_id: purchaseId,
  })

  if (error) {
    console.error('[download-policy] increment_download_count failed:', error)
    return { allowed: false, reason: 'not_found' }
  }

  if (!allowed) return { allowed: false, reason: 'limit_reached' }
  return { allowed: true }
}
