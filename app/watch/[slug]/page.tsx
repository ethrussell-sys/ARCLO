import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { serverClient } from '@/lib/supabase'
import { SLUG_TO_ID } from '@/lib/slug-map'
import BuyButton from '@/app/films/[id]/BuyButton'
import WaitlistPanel from './WaitlistPanel'
import AgeGate from './AgeGate'
import ShareButton from './ShareButton'
import TrailerPlayer from './TrailerPlayer'

function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (!match) return null
  const id = match[1]
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${id}`
}

export default async function WatchPage(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ note?: string; from?: string }>
}) {
  const { slug } = await props.params
  const { note, from } = await props.searchParams
  const country = (await headers()).get('x-vercel-ip-country')
  const isUS = !country || country === 'US'
  const filmId = SLUG_TO_ID[slug]
  if (!filmId) notFound()

  const { data: film } = await serverClient()
    .from('films')
    .select('id, title, director, year, price, trailer_url, description, rating')
    .eq('id', filmId)
    .single()

  if (!film) notFound()

  const embedUrl = film.trailer_url ? youtubeEmbedUrl(film.trailer_url) : null

  const meta = [
    film.director,
    film.year,
    film.price != null ? `$${Number(film.price).toFixed(2)}` : null,
  ].filter(Boolean).join('   ·   ')

  return (
    <>
    {film.rating === 'R' && <AgeGate slug={slug} />}
    <main style={{
      backgroundColor: '#000',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>

      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px 40px',
        gap: '20px',
      }}>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(2.8rem, 12vw, 4.5rem)',
          lineHeight: 1,
          textTransform: 'uppercase',
          letterSpacing: '-0.5px',
          textAlign: 'center',
          margin: 0,
        }}>
          {film.title}
        </h1>

        {/* Metadata */}
        {meta && (
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            margin: 0,
            textAlign: 'center',
          }}>
            {meta}
          </p>
        )}

        {/* Trailer */}
        {embedUrl && <TrailerPlayer embedUrl={embedUrl} title={`${film.title} — trailer`} />}

        {/* Synopsis */}
        {film.description && (
          <p style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '15px',
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: '300px',
            margin: '32px auto',
          }}>
            {film.description}
          </p>
        )}

        {/* Buy button (US) or waitlist (non-US) → note → share */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            {isUS
              ? <BuyButton filmId={film.id} price={film.price} title={film.title} />
              : <WaitlistPanel slug={slug} country={country!} />
            }
          </div>

          {note && (
            <p style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '14px',
              fontStyle: 'italic',
              textAlign: 'center',
              margin: '48px 0',
              lineHeight: 1.6,
            }}>
              {note && from ? `${note} — From ${from}` : note}
            </p>
          )}

          <ShareButton />
        </div>

      </div>
    </main>
    </>
  )
}
