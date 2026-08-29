import Link from 'next/link'
import { tokens } from '@/lib/tokens'

type FilmCardProps = {
  href: string
  title: string
  director?: string | null
  thumbnailUrl?: string | null
}

export function FilmCard({ href, title, director, thumbnailUrl }: FilmCardProps) {
  return (
    <Link
      href={href}
      className="film-card"
      style={{
        flexShrink: 0,
        width: 200,
        height: 280,
        borderRadius: tokens.radius.sm,
        backgroundColor: tokens.color.surface2,
        display: 'block',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, borderRadius: tokens.radius.sm, overflow: 'hidden' }}>
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          borderRadius: `0 0 ${tokens.radius.sm}px ${tokens.radius.sm}px`,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          zIndex: 2,
        }}
      >
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
          <span
            style={{
              fontFamily: tokens.font.display,
              fontSize: 14,
              color: tokens.color.ink,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              lineHeight: 1,
              display: 'block',
            }}
          >
            {title}
          </span>
          {director && (
            <span
              style={{
                fontFamily: tokens.font.body,
                fontSize: 10,
                color: tokens.color.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                lineHeight: 1,
                display: 'block',
                marginTop: 4,
              }}
            >
              {director}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
