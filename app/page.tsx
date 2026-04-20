import Link from 'next/link'
import { serverClient } from '@/lib/supabase'

async function getLiveFilms() {
  const { data } = await serverClient()
    .from('films')
    .select('id, thumbnail_url, title')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(12)
  return data ?? []
}

export default async function HomePage() {
  const films = await getLiveFilms()

  return (
    <main style={{ backgroundColor: '#000', color: '#fff' }}>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 0 0',
      }}>

        {/* Wordmark */}
        <span style={{
          padding: '0 24px',
          color: '#525252',
          fontSize: '12px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-geist-sans)',
        }}>
          ARCLO
        </span>

        {/* Headline + subtext + CTA — vertically centered */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(3.5rem, 14vw, 8rem)',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              letterSpacing: '-0.5px',
              margin: '0 0 24px',
              animation: 'fade-up 0.8s ease-out both',
            }}
          >
            Own the films<br />that matter.
          </h1>

          <p style={{
            color: '#737373',
            fontSize: '15px',
            lineHeight: 1.6,
            margin: '0 0 32px',
            animation: 'fade-up 0.8s ease-out 0.15s both',
          }}>
            One tap.&nbsp;&nbsp;$1.99.&nbsp;&nbsp;Yours forever.
          </p>

          <a
            href="#films"
            style={{
              display: 'inline-block',
              color: '#fff',
              fontSize: '14px',
              letterSpacing: '0.1em',
              textDecoration: 'none',
              animation: 'fade-up 0.8s ease-out 0.3s both',
            }}
          >
            Explore films →
          </a>
        </div>

        {/* Film strip */}
        {films.length > 0 && (
          <div
            id="films"
            className="film-strip"
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              padding: '48px 24px 48px',
              animation: 'fade-up 0.8s ease-out 0.45s both',
            }}
          >
            {films.map((film) => (
              <Link
                key={film.id}
                href={`/films/${film.id}`}
                className="film-card"
                style={{
                  flexShrink: 0,
                  width: '200px',
                  height: '280px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#111',
                  display: 'block',
                }}
              >
                {film.thumbnail_url && (
                  <img
                    src={film.thumbnail_url}
                    alt={film.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </Link>
            ))}
          </div>
        )}

      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '48px 24px', borderTop: '1px solid #111' }}>
        <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
          ARCLO
        </span>
        <p style={{ color: '#404040', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '8px 0 0' }}>
          The films that matter.
        </p>
      </footer>

    </main>
  )
}
