import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminToken, ADMIN_COOKIE } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const form = await request.formData()
  const password = form.get('password') as string

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login?error=1')
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })

  redirect('/admin')
}
