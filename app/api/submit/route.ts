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
  const body = await request.json()
  console.log('[submit] received body:', JSON.stringify({ ...body, fileKey: body.fileKey?.slice(0, 40) }))

  const { title, director, year, description, trailerUrl, contactEmail, rating, fileKey } = body

  const VALID_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17']

  if (!title || !fileKey || !contactEmail) {
    console.log('[submit] validation failed — missing fields:', { title: !!title, fileKey: !!fileKey, contactEmail: !!contactEmail })
    return Response.json({ error: 'title, fileKey, and contactEmail are required' }, { status: 400 })
  }
  if (!rating || !VALID_RATINGS.includes(rating)) {
    console.log('[submit] validation failed — bad rating:', rating)
    return Response.json({ error: 'A valid content rating is required' }, { status: 400 })
  }

  console.log('[submit] generating slug for:', title)
  const slug = await uniqueSlug(toSlug(title))
  console.log('[submit] slug:', slug)

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
    console.error('[submit] supabase insert error:', JSON.stringify(dbError))
    return Response.json({ error: `Failed to save submission: ${dbError.message}` }, { status: 500 })
  }

  console.log('[submit] DB insert succeeded, sending email to:', contactEmail)

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

  console.log('[submit] done — returning ok')
  return Response.json({ ok: true })
}
