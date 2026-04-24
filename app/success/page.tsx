import { redirect } from 'next/navigation'
import { getStripe } from '@/lib/stripe'
import { serverClient } from '@/lib/supabase'
import { presignedDownloadUrl } from '@/lib/s3'
import { sendPurchaseConfirmation } from '@/lib/emails/send'
import { ID_TO_SLUG } from '@/lib/slug-map'
import DownloadButton from './DownloadButton'
import ShareSection from './ShareSection'

async function getMoreFilms(excludeId: string) {
  // Fetch purchased film's tags and all other live films in parallel
  const [{ data: purchased }, { data: candidates }] = await Promise.all([
    serverClient()
      .from('films')
      .select('tags')
      .eq('id', excludeId)
      .single(),
    serverClient()
      .from('films')
      .select('id, title, director, price, thumbnail_url, tags')
      .eq('status', 'live')
      .neq('id', excludeId)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const films = candidates ?? []
  const purchasedTags: string[] = purchased?.tags ?? []

  if (purchasedTags.length === 0) return films.slice(0, 3)

  // Score by number of overlapping tags, then fall back to insertion order
  const scored = films.map((f) => {
    const overlap = (f.tags as string[] ?? []).filter((t) =>
      purchasedTags.includes(t)
    ).length
    return { film: f, overlap }
  })

  scored.sort((a, b) => b.overlap - a.overlap)

  return scored.slice(0, 3).map((s) => s.film)
}

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
  const moreFilms = await getMoreFilms(film.id)

  return (
    <main style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', paddingBottom: '80px' }}>

      {/* ── Purchase confirmation ── */}
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
      </div>

      {/* ── More films ── */}
      {moreFilms.length > 0 && (
        <div style={{ width: '100%', marginTop: '72px' }}>
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            More films you&apos;ll want to own
          </p>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingLeft: '20px', paddingRight: '20px', scrollbarWidth: 'none' }}>
            {moreFilms.map((f) => {
              const fSlug = ID_TO_SLUG[f.id] ?? f.id
              return (
                <a
                  key={f.id}
                  href={`/watch/${fSlug}`}
                  style={{
                    flexShrink: 0,
                    width: '200px',
                    height: '280px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#111',
                    display: 'block',
                    position: 'relative',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '8px', overflow: 'hidden' }}>
                    {f.thumbnail_url && (
                      <img
                        src={f.thumbnail_url}
                        alt={f.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    )}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    borderRadius: '0 0 8px 8px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                    zIndex: 2,
                  }}>
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
                      <span style={{
                        fontFamily: 'var(--font-bebas)',
                        fontSize: '14px',
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        lineHeight: 1,
                        display: 'block',
                      }}>
                        {f.title}
                      </span>
                      {f.director && (
                        <span style={{
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.5)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          display: 'block',
                          marginTop: '4px',
                        }}>
                          {f.director}
                        </span>
                      )}
                      {f.price != null && (
                        <span style={{
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.4)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          display: 'block',
                          marginTop: '2px',
                        }}>
                          ${Number(f.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', paddingTop: '60px', paddingBottom: '40px' }}>
        <a
          href="/"
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '13px',
            letterSpacing: '0.05em',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
        >
          Explore more films
        </a>
      </div>

    </main>
  )
}
