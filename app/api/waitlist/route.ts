import { serverClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const { email, country, filmSlug } = await request.json()

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return Response.json({ error: 'Valid email required.' }, { status: 400 })
  }

  const { error } = await serverClient()
    .from('waitlist')
    .insert({ email: email.trim().toLowerCase(), country: country ?? null, film_slug: filmSlug ?? null })

  if (error) {
    // Ignore duplicate email+slug — treat as success so UX is clean
    if (error.code !== '23505') {
      console.error('[waitlist] insert error:', error)
      return Response.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
    }
  }

  return Response.json({ ok: true })
}
