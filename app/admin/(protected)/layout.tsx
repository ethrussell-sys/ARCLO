import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isValidToken, ADMIN_COOKIE } from '@/lib/admin-auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  if (!isValidToken(cookieStore.get(ADMIN_COOKIE)?.value)) {
    redirect('/admin/login')
  }
  return <>{children}</>
}
