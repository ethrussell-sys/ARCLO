import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isValidToken, ADMIN_COOKIE } from '@/lib/admin-auth'

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  // Already logged in — skip to dashboard
  const cookieStore = await cookies()
  if (isValidToken(cookieStore.get(ADMIN_COOKIE)?.value)) redirect('/admin')

  const { error } = await props.searchParams

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-10">

        <div className="flex flex-col gap-3">
          <span style={{ color: '#0A84FF', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>
            ARCLO
          </span>
          <h1
            className="text-5xl uppercase leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Admin
          </h1>
        </div>

        <form action="/api/admin/login" method="POST" className="flex flex-col gap-8">
          <div>
            <label style={{ color: '#525252', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoFocus
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #1c1c1c',
                color: '#ffffff',
                fontSize: '16px',
                padding: '12px 0',
                width: '100%',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>Incorrect password.</p>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-white font-semibold text-base tracking-wide"
            style={{ backgroundColor: '#0A84FF' }}
          >
            Enter
          </button>
        </form>

      </div>
    </main>
  )
}
