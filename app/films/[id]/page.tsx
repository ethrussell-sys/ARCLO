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
    <main className="min-h-screen bg-black text-white flex flex-col pb-36">

      {/* ── Hero: thumbnail + gradient overlay + title ── */}
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        {film.thumbnail_url ? (
          <img
            src={film.thumbnail_url}
            alt={film.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-950" />
        )}

        {/* Gradient: transparent top → solid black bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7) 65%, #000000 100%)',
          }}
        />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-6 flex flex-col gap-1">
          <h1
            className="uppercase leading-none tracking-tight"
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(2.8rem, 9vw, 5rem)',
            }}
          >
            {film.title}
          </h1>
          {(film.director || film.year) && (
            <p style={{ color: '#a3a3a3', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {[film.director, film.year].filter(Boolean).join('\u2003·\u2003')}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-10 px-6 md:px-12 pt-8 w-full max-w-2xl">

        {/* Description */}
        {film.description && (
          <p style={{ color: '#e5e5e5', fontSize: '17px', lineHeight: '1.7', letterSpacing: '-0.01em' }}>
            {film.description}
          </p>
        )}

        {/* Trailer */}
        {embedUrl && (
          <div
            className="w-full overflow-hidden bg-neutral-950"
            style={{ borderRadius: '16px', aspectRatio: '16/9' }}
          >
            <iframe
              src={embedUrl}
              title={`${film.title} — trailer`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

      </div>

      {/* ── Buy button fixed to bottom ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-6"
        style={{
          background: 'linear-gradient(to top, #000000 60%, transparent)',
        }}
      >
        <BuyButton filmId={film.id} price={film.price} title={film.title} />
      </div>

    </main>
  )
}
