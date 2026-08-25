import { createHash } from 'crypto'

export const ADMIN_COOKIE = 'solv-admin'
// Read on login/session checks so an admin already logged in before the
// rename isn't logged out; never set on new logins.
export const LEGACY_ADMIN_COOKIE = 'arclo-admin'

export function adminToken(): string {
  return createHash('sha256').update(process.env.ADMIN_PASSWORD ?? '').digest('hex')
}

export function isValidToken(value: string | undefined): boolean {
  if (!value) return false
  return value === adminToken()
}
