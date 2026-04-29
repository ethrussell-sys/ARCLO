import { serverClient } from '@/lib/supabase'
import { presignedDownloadUrl } from '@/lib/s3'

export async function POST(request: Request) {
  const { code } = await request.json()

  if (!code || typeof code !== 'string') {
    return Response.json({ error: 'Code is required.' }, { status: 400 })
  }

  const normalized = code.trim().toUpperCase()

  const { data: purchase } = await serverClient()
    .from('purchases')
    .select('film_id')
    .eq('redemption_code', normalized)
    .maybeSingle()

  if (!purchase) {
    return Response.json({ error: 'Invalid code. Check for typos and try again.' }, { status: 404 })
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

  return Response.json({ downloadUrl, filmTitle: film.title })
}
