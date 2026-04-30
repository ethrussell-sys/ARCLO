import { serverClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  const {
    event_type,
    film_id,
    session_id,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
  } = body

  if (!event_type || !session_id) {
    return Response.json({ error: 'event_type and session_id required' }, { status: 400 })
  }

  await serverClient()
    .from('events')
    .insert({
      event_type,
      film_id: film_id ?? null,
      session_id,
      utm_source: utm_source ?? null,
      utm_medium: utm_medium ?? null,
      utm_campaign: utm_campaign ?? null,
      utm_content: utm_content ?? null,
      utm_term: utm_term ?? null,
    })

  return new Response('OK', { status: 200 })
}
