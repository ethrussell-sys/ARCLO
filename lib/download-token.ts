export function generateDownloadToken(): string {
  return crypto.randomUUID().replace(/-/g, '')
}
