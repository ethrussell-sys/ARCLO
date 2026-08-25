import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE, LEGACY_ADMIN_COOKIE } from '@/lib/admin-auth'

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  cookieStore.delete(LEGACY_ADMIN_COOKIE)
  redirect('/admin/login')
}
