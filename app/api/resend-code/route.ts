import { serverClient } from '@/lib/supabase'
import { sendPurchaseConfirmation } from '@/lib/emails/send'
import { generateDownloadToken } from '@/lib/download-token'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email address is required.' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data: rows } = await serverClient()
    .from('purchases')
    .select('id, film_id, email, redemption_code, download_token')
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
    .select('title')
    .eq('id', purchase.film_id)
    .single()

  if (!film) {
    return Response.json({ error: 'Film not found.' }, { status: 404 })
  }

  // Back-fill token for purchases made before the download_token migration
  let token = purchase.download_token
  if (!token) {
    token = generateDownloadToken()
    await serverClient()
      .from('purchases')
      .update({ download_token: token })
      .eq('id', purchase.id)
  }

  const origin = new URL(request.url).origin
  const ownerLink = `${origin}/api/download?token=${token}`

  await sendPurchaseConfirmation({
    to: purchase.email,
    filmTitle: film.title,
    ownerLink,
    redemptionCode: purchase.redemption_code,
  })

  return Response.json({ message: `Your code has been sent to ${purchase.email}.` })
}
