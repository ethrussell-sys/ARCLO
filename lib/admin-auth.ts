import { createHash } from 'crypto'

export const ADMIN_COOKIE = 'arclo-admin'

export function adminToken(): string {
  return createHash('sha256').update(process.env.ADMIN_PASSWORD ?? '').digest('hex')
}

export function isValidToken(value: string | undefined): boolean {
  if (!value) return false
  return value === adminToken()
}
