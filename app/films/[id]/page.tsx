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
    <main style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', paddingBottom: '120px' }}>

      {/* ── Hero ── */}
      <div className="film-hero" style={{ position: 'relative', width: '100%', backgroundColor: '#0a0a0a', flexShrink: 0 }}>

        {film.thumbnail_url && (
          <img
            src={film.thumbnail_url}
            alt={film.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Gradient: transparent top → rgba(0,0,0,0.85) bottom 40% */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.85) 100%)',
        }} />

        {/* Title + meta */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 0, paddingBottom: '8px', paddingLeft: '32px', paddingRight: '32px' }}>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            lineHeight: 1,
            textTransform: 'uppercase',
            margin: 0,
            letterSpacing: '-0.5px',
            color: '#fff',
          }}>
            {film.title}
          </h1>
          {(film.director || film.year || film.price) && (
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              margin: '8px 0 0',
            }}>
              {[film.director, film.year, film.price != null ? `$${Number(film.price).toFixed(2)}` : null].filter(Boolean).join('   ·   ')}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingTop: '32px', paddingLeft: '32px', paddingRight: '32px', paddingBottom: 0 }}>

        {film.description && (
          <p style={{
            color: '#fff',
            opacity: 0.85,
            fontSize: '17px',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: 0,
          }}>
            {film.description}
          </p>
        )}

        {embedUrl && (
          <div style={{ marginLeft: '32px', marginRight: '32px' }}>
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
              <iframe
                src={embedUrl}
                title={`${film.title} — trailer`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
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
