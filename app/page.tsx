import Link from 'next/link'
import { serverClient } from '@/lib/supabase'

async function getFeaturedFilms() {
  const { data } = await serverClient()
    .from('films')
    .select('id, title, director, year, thumbnail_url')
    .order('created_at', { ascending: false })
    .limit(6)
  return data ?? []
}

const stats = [
  { number: '73%', label: 'of Sundance films never find distribution' },
  { number: '32%', label: 'drop in streaming subscriptions' },
  { number: '37%', label: 'of social users buy what they discover' },
]

export default async function HomePage() {
  const films = await getFeaturedFilms()

  return (
    <main className="bg-black text-white">

      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col justify-between px-6 py-10 md:px-12 md:py-14">
        <span
          className="text-sm tracking-[0.25em] uppercase text-neutral-500"
          style={{ fontFamily: 'var(--font-geist-sans)' }}
        >
          ARCLO
        </span>

        <div className="flex flex-col gap-8 max-w-4xl">
          <h1
            className="text-[13vw] md:text-[9vw] leading-none tracking-tight uppercase"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Own the films<br />that matter.
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl leading-relaxed max-w-sm">
            One tap.&nbsp; $1.99.&nbsp; Yours forever.
          </p>
          <a
            href="#films"
            className="inline-flex items-center justify-center self-start px-8 py-4 rounded-2xl text-white font-semibold text-base tracking-wide transition-opacity hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#0A84FF' }}
          >
            See what&apos;s here
          </a>
        </div>

        <div className="text-neutral-700 text-xs tracking-widest uppercase">
          Cinema for everyone
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-6 py-24 md:px-12 border-t border-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 max-w-5xl">
          {stats.map(({ number, label }) => (
            <div key={number} className="flex flex-col gap-3">
              <span
                className="text-7xl md:text-8xl leading-none"
                style={{ fontFamily: 'var(--font-bebas)', color: '#0A84FF' }}
              >
                {number}
              </span>
              <span className="text-neutral-500 text-sm leading-relaxed max-w-[18ch]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Films ── */}
      <section id="films" className="px-6 py-24 md:px-12 border-t border-neutral-900">
        <h2
          className="text-5xl md:text-6xl uppercase mb-16 tracking-tight"
          style={{ fontFamily: 'var(--font-bebas)' }}
        >
          Featured Films
        </h2>

        {films.length === 0 ? (
          <p className="text-neutral-600 text-sm">Films coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {films.map((film) => (
              <Link
                key={film.id}
                href={`/films/${film.id}`}
                className="group flex flex-col gap-3"
              >
                <div className="aspect-video w-full bg-neutral-900 overflow-hidden rounded-lg">
                  {film.thumbnail_url ? (
                    <img
                      src={film.thumbnail_url}
                      alt={film.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-neutral-700 text-xs tracking-widest uppercase">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-white font-medium text-sm leading-snug group-hover:text-[#0A84FF] transition-colors">
                    {film.title}
                  </span>
                  {film.director && (
                    <span className="text-neutral-500 text-xs">{film.director}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-16 md:px-12 border-t border-neutral-900 flex flex-col gap-2">
        <span
          className="text-3xl uppercase tracking-tight"
          style={{ fontFamily: 'var(--font-bebas)' }}
        >
          ARCLO
        </span>
        <span className="text-neutral-600 text-xs tracking-widest uppercase">
          The films that matter.
        </span>
      </footer>

    </main>
  )
}
