import { serverClient } from '@/lib/supabase'
import { getResend } from '@/lib/resend'
import { FilmSubmissionEmail } from '@/lib/emails/FilmSubmission'
import * as React from 'react'

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function uniqueSlug(base: string): Promise<string> {
  const db = serverClient()
  let candidate = base
  let suffix = 2
  while (true) {
    const { data } = await db.from('films').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
    candidate = `${base}-${suffix++}`
  }
}

export async function POST(request: Request) {
  const { title, director, year, description, trailerUrl, contactEmail, rating, fileKey } =
    await request.json()

  const VALID_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17']

  if (!title || !fileKey || !contactEmail) {
    return Response.json({ error: 'title, fileKey, and contactEmail are required' }, { status: 400 })
  }
  if (!rating || !VALID_RATINGS.includes(rating)) {
    return Response.json({ error: 'A valid content rating is required' }, { status: 400 })
  }

  const slug = await uniqueSlug(toSlug(title))

  const { error: dbError } = await serverClient()
    .from('films')
    .insert({
      title,
      slug,
      director: director || null,
      year: year || null,
      description: description || null,
      trailer_url: trailerUrl || null,
      contact_email: contactEmail,
      rating,
      file_key: fileKey,
      status: 'pending',
      price: 1.99,
    })

  if (dbError) {
    console.error('[submit] supabase insert error:', dbError)
    return Response.json({ error: 'Failed to save submission' }, { status: 500 })
  }

  const { error: emailError } = await getResend().emails.send({
    from: 'ARCLO <onboarding@resend.dev>',
    to: contactEmail,
    subject: `We have your film — ${title}`,
    react: React.createElement(FilmSubmissionEmail, {
      filmTitle: title,
      directorName: director ?? '',
    }),
  })

  if (emailError) {
    console.error('[submit] confirmation email failed:', JSON.stringify(emailError))
  }

  return Response.json({ ok: true })
}
