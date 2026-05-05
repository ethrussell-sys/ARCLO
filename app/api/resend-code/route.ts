import { serverClient } from '@/lib/supabase'
import { presignedDownloadUrl } from '@/lib/s3'
import { sendPurchaseConfirmation } from '@/lib/emails/send'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email address is required.' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data: rows } = await serverClient()
    .from('purchases')
    .select('id, film_id, email, redemption_code')
    .ilike('email', normalizedEmail)
    .not('redemption_code', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)

  const purchase = rows?.[0] ?? null

  if (!purchase || !purchase.redemption_code) {
    return Response.json({ error: 'No purchase found for that email address.' }, { status: 404 })
  }

  const { data: film } = await serverClient()
    .from('films')
    .select('title, file_key')
    .eq('id', purchase.film_id)
    .single()

  if (!film) {
    return Response.json({ error: 'Film not found.' }, { status: 404 })
  }

  const downloadUrl = await presignedDownloadUrl(film.file_key)

  await sendPurchaseConfirmation({
    to: purchase.email,
    filmTitle: film.title,
    downloadUrl,
    redemptionCode: purchase.redemption_code,
  })

  return Response.json({ message: `Your code has been sent to ${purchase.email}.` })
}
