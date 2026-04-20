import { notFound } from 'next/navigation'
import { serverClient } from '@/lib/supabase'
import BuyButton from './BuyButton'

function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : null
}

export default async function FilmPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const { data: film } = await serverClient()
    .from('films')
    .select('*')
    .eq('id', id)
    .single()

  if (!film) notFound()

  const embedUrl = film.trailer_url ? youtubeEmbedUrl(film.trailer_url) : null

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', paddingBottom: '144px' }}>

      {/* ── Hero: thumbnail + gradient overlay + title ── */}
      {/* padding-top: 56.25% forces 16:9 height without aspect-ratio,
          which collapses when all children are position:absolute */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0a0a0a' }}>

        {film.thumbnail_url && (
          <img
            src={film.thumbnail_url}
            alt={film.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Gradient: transparent top → solid black bottom */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.75) 65%, #000 100%)',
        }} />

        {/* Title + meta overlaid on gradient */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 24px' }}>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(2.8rem, 9vw, 5rem)',
            lineHeight: 1,
            textTransform: 'uppercase',
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            {film.title}
          </h1>
          {(film.director || film.year) && (
            <p style={{ color: '#a3a3a3', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '6px 0 0' }}>
              {[film.director, film.year].filter(Boolean).join('   ·   ')}
            </p>
          )}
        </div>
      </div>

      {/* ── Body: solid black, below the hero ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '32px 24px 0' }}>

        {film.description && (
          <p style={{ color: '#e5e5e5', fontSize: '17px', lineHeight: 1.7, letterSpacing: '-0.01em', margin: 0 }}>
            {film.description}
          </p>
        )}

        {embedUrl && (
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
            <iframe
              src={embedUrl}
              title={`${film.title} — trailer`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

      </div>

      {/* ── Buy button fixed to bottom ── */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '24px 24px 32px',
        background: 'linear-gradient(to top, #000 60%, transparent)',
      }}>
        <BuyButton filmId={film.id} price={film.price} title={film.title} />
      </div>

    </main>
  )
}
