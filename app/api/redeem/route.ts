import { serverClient } from '@/lib/supabase'
import { presignedDownloadUrl } from '@/lib/s3'

export async function POST(request: Request) {
  const { code, email } = await request.json()

  if (!code || typeof code !== 'string') {
    return Response.json({ error: 'Code is required.' }, { status: 400 })
  }
  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email address is required.' }, { status: 400 })
  }

  const normalized = code.trim().toUpperCase()
  const normalizedEmail = email.trim().toLowerCase()

  const { data: purchase } = await serverClient()
    .from('purchases')
    .select('id, film_id, email, download_count, download_limit')
    .eq('redemption_code', normalized)
    .maybeSingle()

  // Treat missing code and email mismatch identically to prevent enumeration
  if (!purchase || purchase.email.toLowerCase() !== normalizedEmail) {
    return Response.json(
      { error: "The code and email address don't match. Please check your confirmation email." },
      { status: 404 }
    )
  }

  const limit = purchase.download_limit ?? 5
  const count = purchase.download_count ?? 0

  if (count >= limit) {
    return Response.json(
      { error: "You've reached the maximum number of downloads for this film. Please contact support@arclo.com for assistance." },
      { status: 403 }
    )
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

  await serverClient()
    .from('purchases')
    .update({ download_count: count + 1 })
    .eq('id', purchase.id)

  return Response.json({
    downloadUrl,
    filmTitle: film.title,
    downloadsRemaining: limit - count - 1,
  })
}
