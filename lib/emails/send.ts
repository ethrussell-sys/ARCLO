import * as React from 'react'
import { getResend } from '@/lib/resend'
import { PurchaseConfirmationEmail } from '@/lib/emails/PurchaseConfirmation'

const FROM = 'ARCLO <purchases@arclo.com>'

export async function sendPurchaseConfirmation({
  to,
  filmTitle,
  downloadUrl,
}: {
  to: string
  filmTitle: string
  downloadUrl: string
}) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `You own ${filmTitle} — download it now`,
    react: React.createElement(PurchaseConfirmationEmail, { filmTitle, downloadUrl }),
  })
}
