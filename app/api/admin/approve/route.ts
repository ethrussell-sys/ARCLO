import { cookies } from 'next/headers'
import { isValidToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { serverClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  if (!isValidToken(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filmId } = await request.json()
  if (!filmId) return Response.json({ error: 'filmId required' }, { status: 400 })

  const { error } = await serverClient()
    .from('films')
    .update({ status: 'live' })
    .eq('id', filmId)

  if (error) {
    console.error('[admin/approve]', error)
    return Response.json({ error: 'DB update failed' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
