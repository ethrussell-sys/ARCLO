import { cookies } from 'next/headers'
import { isValidToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { serverClient } from '@/lib/supabase'
import { getResend } from '@/lib/resend'
import { FilmRejectionEmail } from '@/lib/emails/FilmRejection'
import * as React from 'react'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  if (!isValidToken(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filmId, contactEmail, filmTitle, director } = await request.json()
  if (!filmId) return Response.json({ error: 'filmId required' }, { status: 400 })

  const { error } = await serverClient()
    .from('films')
    .update({ status: 'rejected' })
    .eq('id', filmId)

  if (error) {
    console.error('[admin/reject]', error)
    return Response.json({ error: 'DB update failed' }, { status: 500 })
  }

  if (contactEmail) {
    const { error: emailError } = await getResend().emails.send({
      from: 'ARCLO <onboarding@resend.dev>',
      to: contactEmail,
      subject: `Regarding your submission — ${filmTitle}`,
      react: React.createElement(FilmRejectionEmail, {
        filmTitle: filmTitle ?? 'your film',
        directorName: director ?? '',
      }),
    })
    if (emailError) console.error('[admin/reject] email failed:', emailError)
  }

  return Response.json({ ok: true })
}
