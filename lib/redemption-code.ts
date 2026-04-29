const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I, O, 0, 1 to avoid confusion

function segment(n: number): string {
  return Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}

export function generateRedemptionCode(): string {
  return `ARCLO-${segment(4)}-${segment(4)}`
}
