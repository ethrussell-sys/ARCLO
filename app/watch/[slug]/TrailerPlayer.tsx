'use client'

import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/track'

// Minimal YT Player types — avoids requiring @types/youtube
interface YTPlayer {
  mute(): void
  unMute(): void
  isMuted(): boolean
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
  destroy(): void
}

interface YTPlayerOptions {
  videoId: string
  playerVars?: Record<string, string | number>
  events?: {
    onReady?: (e: { target: YTPlayer }) => void
    onStateChange?: (e: { data: number; target: YTPlayer }) => void
  }
}

declare global {
  interface Window {
    YT: { Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer; PlayerState: Record<string, number> }
    onYouTubeIframeAPIReady?: () => void
  }
}

// Module-level so multiple instances share one script load
let ytApiReady = false
const ytWaiters: Array<() => void> = []

function ensureYTApi(cb: () => void) {
  if (ytApiReady) { cb(); return }
  ytWaiters.push(cb)
  if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return
  const prev = window.onYouTubeIframeAPIReady
  window.onYouTubeIframeAPIReady = () => {
    prev?.()
    ytApiReady = true
    ytWaiters.forEach((fn) => fn())
    ytWaiters.length = 0
  }
  const script = document.createElement('script')
  script.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(script)
}

function extractVideoId(embedUrl: string): string {
  const m = embedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : ''
}

const PROGRESS_MILESTONES = [10, 25, 50, 75, 90, 100]
const YT_PLAYING = 1
const YT_PAUSED = 2
const YT_ENDED = 0

type Props = { embedUrl: string; title: string; filmId: string; filmSlug: string }

export default function TrailerPlayer({ embedUrl, title, filmId, filmSlug }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const [muted, setMuted] = useState(true)

  const state = useRef({
    plays: 0,
    paused: false,
    pausedAt: 0,
    ended: false,
    progressFired: new Set<number>(),
    intervalId: null as ReturnType<typeof setInterval> | null,
  })

  useEffect(() => {
    const videoId = extractVideoId(embedUrl)
    if (!videoId || !containerRef.current) return
    const container = containerRef.current

    ensureYTApi(() => {
      const s = state.current

      const player = new window.YT.Player(container, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          loop: 1,
          playlist: videoId,
        },
        events: {
          onStateChange({ data: ytState, target }) {
            if (ytState === YT_PLAYING) {
              if (s.plays === 0) {
                // First ever play
                s.plays = 1
                track({ event_type: 'trailer_play', film_id: filmId, film_slug: filmSlug })
              } else if (s.paused) {
                // Resume after pause
                track({
                  event_type: 'trailer_resume',
                  film_id: filmId,
                  film_slug: filmSlug,
                  metadata: { resumed_at_seconds: Math.round(s.pausedAt) },
                })
                s.paused = false
                s.pausedAt = 0
              } else if (s.ended) {
                // Loop / replay
                s.plays += 1
                s.ended = false
                s.progressFired.clear()
                track({ event_type: 'trailer_replay', film_id: filmId, film_slug: filmSlug })
              }

              if (s.intervalId) clearInterval(s.intervalId)
              s.intervalId = setInterval(() => {
                const duration = target.getDuration()
                if (!duration) return
                const pct = (target.getCurrentTime() / duration) * 100
                for (const milestone of PROGRESS_MILESTONES) {
                  if (pct >= milestone && !s.progressFired.has(milestone)) {
                    s.progressFired.add(milestone)
                    track({
                      event_type: 'trailer_progress',
                      film_id: filmId,
                      film_slug: filmSlug,
                      metadata: { progress_percent: milestone },
                    })
                  }
                }
              }, 1000)
            }

            if (ytState === YT_PAUSED) {
              if (s.intervalId) { clearInterval(s.intervalId); s.intervalId = null }
              s.pausedAt = target.getCurrentTime()
              s.paused = true
              track({
                event_type: 'trailer_pause',
                film_id: filmId,
                film_slug: filmSlug,
                metadata: { paused_at_seconds: Math.round(s.pausedAt) },
              })
            }

            if (ytState === YT_ENDED) {
              if (s.intervalId) { clearInterval(s.intervalId); s.intervalId = null }
              s.ended = true
              s.paused = false
            }
          },
        },
      })

      playerRef.current = player
    })

    return () => {
      if (state.current.intervalId) clearInterval(state.current.intervalId)
      playerRef.current?.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleMute() {
    const player = playerRef.current
    if (!player) return
    if (muted) {
      player.unMute()
      track({ event_type: 'trailer_unmute', film_id: filmId, film_slug: filmSlug })
    } else {
      player.mute()
    }
    setMuted((m) => !m)
  }

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
      {/* Clip wrapper — overflow:hidden here so button outside is never clipped */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
      }}>
        <div
          ref={containerRef}
          title={title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      </div>

      <button
        onClick={toggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 10,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          color: '#fff',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}
