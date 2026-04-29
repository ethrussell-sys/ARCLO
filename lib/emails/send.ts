import * as React from 'react'
import { getResend } from '@/lib/resend'
import { PurchaseConfirmationEmail } from '@/lib/emails/PurchaseConfirmation'

// const FROM = 'ARCLO <purchases@arclo.com>' // restore once arclo.com is verified in Resend
const FROM = 'ARCLO <onboarding@resend.dev>'

export async function sendPurchaseConfirmation({
  to,
  filmTitle,
  downloadUrl,
  redemptionCode,
}: {
  to: string
  filmTitle: string
  downloadUrl: string
  redemptionCode: string
}) {
  console.log('[email] sending purchase confirmation', {
    to,
    filmTitle,
    from: FROM,
    apiKeySet: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 8),
  })

  const { data, error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `You own ${filmTitle} — download it now`,
    react: React.createElement(PurchaseConfirmationEmail, { filmTitle, downloadUrl, redemptionCode }),
  })

  if (error) {
    console.error('[email] resend error:', JSON.stringify(error, null, 2))
    throw new Error(`Resend error: ${JSON.stringify(error)}`)
  }

  console.log('[email] sent successfully, id:', data?.id)
}
