import Link from 'next/link'
import { serverClient } from '@/lib/supabase'

async function getLiveFilms() {
  const { data } = await serverClient()
    .from('films')
    .select('id, thumbnail_url, title, director')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(12)
  return data ?? []
}

export default async function HomePage() {
  const films = await getLiveFilms()

  return (
    <main style={{ backgroundColor: '#000', color: '#fff', paddingLeft: '48px', paddingRight: '48px' }}>

      {/* ── Hero ── */}
      <section className="hero-section" style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 0 0',
      }}>

        {/* Wordmark */}
        <span style={{
          color: '#525252',
          fontSize: '12px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-geist-sans)',
        }}>
          ARCLO
        </span>

        {/* Headline + subtext + CTA — vertically centered */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
            className="explore-link"
            style={{ animation: 'fade-up 0.8s ease-out 0.3s both' }}
          >
            Explore films →
          </a>
        </div>

        {/* Film strip */}
        {films.length > 0 && (
          <>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0' }} />
            <div
              id="films"
              className="film-strip hero-strip"
              style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                padding: '48px 0 48px',
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
                    position: 'relative',
                  }}
                >
                  {film.thumbnail_url && (
                    <img
                      src={film.thumbnail_url}
                      alt={film.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                    zIndex: 1,
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
          </>
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
