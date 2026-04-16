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
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Thumbnail */}
      {film.thumbnail_url && (
        <div className="w-full aspect-video bg-neutral-900">
          <img
            src={film.thumbnail_url}
            alt={film.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col gap-6 px-5 pt-6 pb-32">
        {/* Title + meta */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            {film.title}
          </h1>
          {(film.director || film.year) && (
            <p className="text-sm text-neutral-400">
              {[film.director, film.year].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Description */}
        {film.description && (
          <p className="text-base text-neutral-300 leading-relaxed">
            {film.description}
          </p>
        )}

        {/* Trailer */}
        {embedUrl && (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-neutral-900">
            <iframe
              src={embedUrl}
              title={`${film.title} trailer`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Buy button — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <BuyButton filmId={film.id} price={film.price} title={film.title} />
      </div>
    </main>
  )
}
