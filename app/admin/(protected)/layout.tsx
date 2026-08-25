import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isValidToken, ADMIN_COOKIE, LEGACY_ADMIN_COOKIE } from '@/lib/admin-auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value ?? cookieStore.get(LEGACY_ADMIN_COOKIE)?.value
  if (!isValidToken(token)) {
    redirect('/admin/login')
  }
  return <>{children}</>
}
