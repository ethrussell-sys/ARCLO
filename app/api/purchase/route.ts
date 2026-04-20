import { getStripe } from '@/lib/stripe'
import { serverClient } from '@/lib/supabase'
import { presignedDownloadUrl } from '@/lib/s3'
import { sendPurchaseConfirmation } from '@/lib/emails/send'

export async function POST(request: Request) {
  const { paymentIntentId, email } = await request.json()

  if (!paymentIntentId) {
    return Response.json({ error: 'paymentIntentId required' }, { status: 400 })
  }

  const intent = await getStripe().paymentIntents.retrieve(paymentIntentId)

  if (intent.status !== 'succeeded') {
    return Response.json({ error: 'Payment not confirmed' }, { status: 400 })
  }

  const filmId = intent.metadata.filmId

  const { data: film } = await serverClient()
    .from('films')
    .select('id, title, file_key')
    .eq('id', filmId)
    .single()

  if (!film) {
    return Response.json({ error: 'Film not found' }, { status: 404 })
  }

  const downloadUrl = await presignedDownloadUrl(film.file_key)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await serverClient()
    .from('purchases')
    .upsert(
      {
        film_id: film.id,
        email: email ?? '',
        stripe_payment_id: paymentIntentId,
        download_url: downloadUrl,
        expires_at: expiresAt,
      },
      { onConflict: 'stripe_payment_id', ignoreDuplicates: false }
    )

  // Send email without blocking the response — download URL is the critical path
  if (email) {
    sendPurchaseConfirmation({ to: email, filmTitle: film.title, downloadUrl }).catch(
      (err) => console.error('Purchase email failed:', err)
    )
  }

  return Response.json({ downloadUrl, filmTitle: film.title })
}
