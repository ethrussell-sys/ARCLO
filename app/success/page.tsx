import { redirect } from 'next/navigation'
import { getStripe } from '@/lib/stripe'
import { serverClient } from '@/lib/supabase'
import { presignedDownloadUrl } from '@/lib/s3'
import { sendPurchaseConfirmation } from '@/lib/emails/send'
import { ID_TO_SLUG } from '@/lib/slug-map'
import DownloadButton from './DownloadButton'
import ShareSection from './ShareSection'

async function getOrCreatePurchase(sessionId: string) {
  const session = await getStripe().checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') return null

  const filmId = session.metadata?.filmId
  const email = session.customer_details?.email
  const paymentIntentId = session.payment_intent as string

  if (!filmId || !email) return null

  const { data: film } = await serverClient()
    .from('films')
    .select('id, title, file_key')
    .eq('id', filmId)
    .single()

  if (!film) return null

  // Check if this purchase already exists to avoid resending the email on refresh
  const { data: existing } = await serverClient()
    .from('purchases')
    .select('id')
    .eq('stripe_payment_id', paymentIntentId)
    .single()

  const isNew = !existing

  const downloadUrl = await presignedDownloadUrl(film.file_key)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await serverClient()
    .from('purchases')
    .upsert(
      {
        film_id: film.id,
        email,
        stripe_payment_id: paymentIntentId,
        download_url: downloadUrl,
        expires_at: expiresAt,
      },
      { onConflict: 'stripe_payment_id', ignoreDuplicates: false }
    )

  if (isNew) {
    sendPurchaseConfirmation({ to: email, filmTitle: film.title, downloadUrl }).catch(
      (err) => console.error('Purchase email failed:', err)
    )
  }

  const slug = ID_TO_SLUG[film.id] ?? film.id
  return { film, email, downloadUrl, slug }
}

export default async function SuccessPage(props: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await props.searchParams

  if (!session_id) redirect('/')

  const result = await getOrCreatePurchase(session_id)

  if (!result) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-3 px-5 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-neutral-400 text-sm">
          We couldn&apos;t verify your payment. If you were charged, email us and we&apos;ll sort it out.
        </p>
      </main>
    )
  }

  const { film, email, downloadUrl, slug } = result

  return (
    <main style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', paddingBottom: '80px' }}>

      <div style={{ width: '100%', maxWidth: '384px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', textAlign: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A84FF' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>You own it.</h1>
          <p style={{ color: '#737373', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            <span style={{ color: '#fff', fontWeight: 500 }}>{film.title}</span> is yours forever.
            <br />
            Download link sent to {email}.
          </p>
        </div>

        <DownloadButton url={downloadUrl} title={film.title} />

        <p style={{ color: '#404040', fontSize: '12px', margin: 0 }}>
          Link expires in 24 hours. Check your email for a permanent copy.
        </p>

        <ShareSection watchUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/watch/${slug}`} />

        <a
          href="/"
          style={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: '12px',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            textTransform: 'uppercase',
            display: 'block',
            textAlign: 'center',
            marginTop: '60px',
          }}
        >
          Explore more films
        </a>
      </div>

    </main>
  )
}
