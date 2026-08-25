import Link from 'next/link'
import { serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function getLiveFilms() {
  const { data, error } = await serverClient()
    .from('films')
    .select('id, thumbnail_url, title, director')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
  if (error) console.error('[films] failed to load live films:', error)
  return data ?? []
}

export default async function FilmsPage() {
  const films = await getLiveFilms()

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', paddingLeft: '48px', paddingRight: '48px' }}>
      <div style={{ padding: '40px 0 24px' }}>
        <Link
          href="/"
          style={{ height: '28px', width: 'auto', display: 'inline-block' }}
        >
          <img
            src="/solv-wordmark_2.png"
            alt="solv"
            style={{ height: '28px', width: 'auto', display: 'block' }}
          />
        </Link>
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          lineHeight: 0.95,
          textTransform: 'uppercase',
          letterSpacing: '-0.5px',
          margin: '0 0 32px',
        }}
      >
        Films
      </h1>

      {films.length === 0 ? (
        <p style={{ color: '#737373', fontSize: '15px', paddingBottom: '80px' }}>
          No films are live yet. Check back soon.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            paddingBottom: '80px',
          }}
        >
          {films.map((film) => (
            <Link
              key={film.id}
              href={`/films/${film.id}`}
              className="film-card"
              style={{
                height: '280px',
                borderRadius: '8px',
                backgroundColor: '#111',
                display: 'block',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, borderRadius: '8px', overflow: 'hidden' }}>
                {film.thumbnail_url && (
                  <img
                    src={film.thumbnail_url}
                    alt={film.title}
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
                    {film.title}
                  </span>
                  {film.director && (
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      lineHeight: 1,
                      display: 'block',
                      marginTop: '4px',
                    }}>
                      {film.director}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
