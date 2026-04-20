import { serverClient } from '@/lib/supabase'
import { getResend } from '@/lib/resend'
import { FilmSubmissionEmail } from '@/lib/emails/FilmSubmission'
import * as React from 'react'

export async function POST(request: Request) {
  const { title, director, year, description, trailerUrl, contactEmail, fileKey } =
    await request.json()

  if (!title || !fileKey || !contactEmail) {
    return Response.json({ error: 'title, fileKey, and contactEmail are required' }, { status: 400 })
  }

  const { error: dbError } = await serverClient()
    .from('films')
    .insert({
      title,
      director: director || null,
      year: year || null,
      description: description || null,
      trailer_url: trailerUrl || null,
      contact_email: contactEmail,
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
