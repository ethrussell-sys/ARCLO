import { serverClient } from '@/lib/supabase'
import { presignedDownloadUrl } from '@/lib/s3'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return new Response('Missing token', { status: 400 })
  }

  const { data: purchase } = await serverClient()
    .from('purchases')
    .select('id, film_id, download_count, download_limit')
    .eq('download_token', token)
    .maybeSingle()

  if (!purchase) {
    return new Response('Not found', { status: 404 })
  }

  const limit = purchase.download_limit ?? 5
  const count = purchase.download_count ?? 0

  if (count >= limit) {
    return new Response(
      'Download limit reached. Contact support@arclo.com for assistance.',
      { status: 403 }
    )
  }

  const { data: film } = await serverClient()
    .from('films')
    .select('file_key')
    .eq('id', purchase.film_id)
    .single()

  if (!film) {
    return new Response('Film not found', { status: 404 })
  }

  const presigned = await presignedDownloadUrl(film.file_key)

  await serverClient()
    .from('purchases')
    .update({ download_count: count + 1 })
    .eq('id', purchase.id)

  return Response.redirect(presigned, 302)
}
