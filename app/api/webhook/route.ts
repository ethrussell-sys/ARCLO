/*
 * Stripe Webhook — /api/webhook
 *
 * SETUP IN STRIPE DASHBOARD:
 *   1. Go to Developers → Webhooks → Add endpoint
 *   2. Endpoint URL: https://yourdomain.com/api/webhook
 *   3. Select event: checkout.session.completed
 *   4. After saving, reveal the Signing secret — that is STRIPE_WEBHOOK_SECRET
 *
 * LOCAL TESTING (Stripe CLI):
 *   stripe listen --forward-to localhost:3000/api/webhook
 *   The CLI prints a whsec_... secret — use that as STRIPE_WEBHOOK_SECRET locally
 *
 * ENV VAR:
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 */

import { getStripe } from '@/lib/stripe'
import { serverClient } from '@/lib/supabase'
import { presignedDownloadUrl } from '@/lib/s3'
import { sendPurchaseConfirmation } from '@/lib/emails/send'
import { generateRedemptionCode } from '@/lib/redemption-code'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  // Raw body required for signature verification — do not use request.json()
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook] signature verification failed:', msg)
    return new Response(`Webhook error: ${msg}`, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response('OK', { status: 200 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (session.payment_status !== 'paid') {
    return new Response('OK', { status: 200 })
  }

  const paymentIntentId = session.payment_intent as string
  const filmId = session.metadata?.filmId
  const email = session.customer_details?.email
  const utm_source = session.metadata?.utm_source ?? null
  const utm_medium = session.metadata?.utm_medium ?? null
  const utm_campaign = session.metadata?.utm_campaign ?? null
  const utm_content = session.metadata?.utm_content ?? null
  const utm_term = session.metadata?.utm_term ?? null

  if (!paymentIntentId || !filmId) {
    console.error('[webhook] missing paymentIntentId or filmId', { paymentIntentId, filmId })
    return new Response('OK', { status: 200 })
  }

  // Idempotency check — skip if purchase already recorded
  const { data: existing } = await serverClient()
    .from('purchases')
    .select('id')
    .eq('stripe_payment_id', paymentIntentId)
    .single()

  if (existing) {
    console.log('[webhook] purchase already exists, skipping:', paymentIntentId)
    return new Response('OK', { status: 200 })
  }

  const { data: film } = await serverClient()
    .from('films')
    .select('id, title, file_key')
    .eq('id', filmId)
    .single()

  if (!film) {
    console.error('[webhook] film not found:', filmId)
    return new Response('OK', { status: 200 })
  }

  const downloadUrl = await presignedDownloadUrl(film.file_key)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const redemptionCode = generateRedemptionCode()

  await serverClient()
    .from('purchases')
    .insert({
      film_id: film.id,
      email: email ?? '',
      stripe_payment_id: paymentIntentId,
      download_url: downloadUrl,
      expires_at: expiresAt,
      redemption_code: redemptionCode,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    })

  if (email) {
    sendPurchaseConfirmation({ to: email, filmTitle: film.title, downloadUrl, redemptionCode }).catch(
      (err) => console.error('[webhook] email failed:', err)
    )
  }

  console.log('[webhook] purchase recorded and email queued for:', paymentIntentId)
  return new Response('OK', { status: 200 })
}
