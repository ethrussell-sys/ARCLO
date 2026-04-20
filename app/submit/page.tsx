'use client'

import { useRef, useState, ChangeEvent, FormEvent } from 'react'

type Phase = 'form' | 'uploading' | 'saving' | 'success' | 'error'

const CURRENT_YEAR = new Date().getFullYear()
const DESC_MAX = 200

const inputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #1c1c1c',
  color: '#ffffff',
  fontSize: '16px',
  padding: '12px 0',
  width: '100%',
  outline: 'none',
  borderRadius: 0,
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  color: '#525252',
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '4px',
}

export default function SubmitPage() {
  const [phase, setPhase] = useState<Phase>('form')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [descLen, setDescLen] = useState(0)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const fd = new FormData(e.currentTarget)
    const file = fileRef.current?.files?.[0]

    if (!file) { setError('Please select the film file.'); return }

    const year = Number(fd.get('year'))
    if (year && (year < 1888 || year > CURRENT_YEAR)) {
      setError(`Year must be between 1888 and ${CURRENT_YEAR}.`)
      return
    }

    try {
      // ── 1. Get presigned S3 upload URL ──────────────────────────────────
      setPhase('uploading')
      setProgress(0)

      const presignRes = await fetch('/api/submit/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'video/mp4',
        }),
      })

      if (!presignRes.ok) throw new Error('Could not initialise upload.')
      const { uploadUrl, fileKey } = await presignRes.json()

      // ── 2. Upload directly to S3 with XHR for progress ──────────────────
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100))
        }
        xhr.onload = () =>
          xhr.status === 200 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`))
        xhr.onerror = () => reject(new Error('Upload failed — check your connection.'))
        xhr.send(file)
      })

      // ── 3. Save metadata + send email ────────────────────────────────────
      setPhase('saving')

      const submitRes = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fd.get('title'),
          director: fd.get('director'),
          year: year || null,
          description: fd.get('description'),
          trailerUrl: fd.get('trailerUrl'),
          contactEmail: fd.get('contactEmail'),
          fileKey,
        }),
      })

      if (!submitRes.ok) throw new Error('Submission failed. Please try again.')

      setPhase('success')
    } catch (err) {
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (phase === 'success') {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-8 max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pop-in"
            style={{ backgroundColor: '#0A84FF' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex flex-col gap-3">
            <h1
              className="text-5xl uppercase tracking-tight"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              Film submitted.
            </h1>
            <p className="text-neutral-400 text-base leading-relaxed">
              We&apos;ll be in touch within 24 hours.
            </p>
          </div>
          <p className="text-neutral-700 text-xs">Check your email for a confirmation.</p>
        </div>
      </main>
    )
  }

  // ── Uploading / saving ───────────────────────────────────────────────────
  if (phase === 'uploading' || phase === 'saving') {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 gap-8">
        <p
          className="text-4xl uppercase tracking-tight"
          style={{ fontFamily: 'var(--font-bebas)', color: phase === 'saving' ? '#0A84FF' : '#fff' }}
        >
          {phase === 'saving' ? 'Saving…' : 'Uploading…'}
        </p>

        {phase === 'uploading' && (
          <div className="w-full max-w-sm flex flex-col gap-3">
            <div className="w-full h-px bg-neutral-900 relative overflow-hidden rounded-full">
              <div
                className="absolute left-0 top-0 h-full transition-all duration-150"
                style={{ width: `${progress}%`, backgroundColor: '#0A84FF' }}
              />
            </div>
            <span className="text-neutral-600 text-xs text-right tabular-nums">{progress}%</span>
          </div>
        )}
      </main>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto px-6 py-16">

        {/* Header */}
        <div className="flex flex-col gap-6 mb-16">
          <span style={{ color: '#0A84FF', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>
            ARCLO
          </span>
          <h1
            className="text-6xl uppercase leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Submit your film.
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            We review every submission personally. If it&apos;s a fit, we&apos;ll be in touch within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">

          {/* Title */}
          <div>
            <label style={labelStyle}>Film title *</label>
            <input name="title" required style={inputStyle} placeholder="—" autoComplete="off" />
          </div>

          {/* Director */}
          <div>
            <label style={labelStyle}>Director</label>
            <input name="director" style={inputStyle} placeholder="—" autoComplete="off" />
          </div>

          {/* Year */}
          <div>
            <label style={labelStyle}>Year</label>
            <input
              name="year"
              type="number"
              min={1888}
              max={CURRENT_YEAR}
              style={inputStyle}
              placeholder={String(CURRENT_YEAR)}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Short description (max {DESC_MAX} characters)</label>
            <textarea
              name="description"
              maxLength={DESC_MAX}
              rows={3}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescLen(e.target.value.length)}
              style={{
                ...inputStyle,
                resize: 'none',
                lineHeight: '1.6',
                borderBottom: '1px solid #1c1c1c',
              }}
              placeholder="—"
            />
            <div className="text-right" style={{ color: descLen > DESC_MAX - 20 ? '#0A84FF' : '#404040', fontSize: '11px', marginTop: '4px' }}>
              {descLen}/{DESC_MAX}
            </div>
          </div>

          {/* Trailer URL */}
          <div>
            <label style={labelStyle}>Trailer URL (YouTube or Vimeo)</label>
            <input
              name="trailerUrl"
              type="url"
              style={inputStyle}
              placeholder="https://youtube.com/watch?v=…"
            />
          </div>

          {/* Contact email */}
          <div>
            <label style={labelStyle}>Contact email *</label>
            <input
              name="contactEmail"
              type="email"
              required
              style={inputStyle}
              placeholder="you@studio.com"
            />
          </div>

          {/* Film file */}
          <div>
            <label style={labelStyle}>Film file * (MP4, MOV, or MKV)</label>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-matroska,.mp4,.mov,.mkv"
              required
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                ...inputStyle,
                textAlign: 'left',
                cursor: 'pointer',
                color: fileName ? '#ffffff' : '#404040',
                paddingLeft: 0,
              }}
            >
              {fileName || 'Choose file…'}
            </button>
          </div>

          {/* Error */}
          {(phase === 'error' || error) && (
            <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{error}</p>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid #1c1c1c' }} />

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-white font-semibold text-base tracking-wide active:scale-95 transition-transform"
            style={{ backgroundColor: '#0A84FF' }}
          >
            Submit film
          </button>

          <p style={{ color: '#404040', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>
            By submitting, you confirm you hold the rights to distribute this film.
          </p>

        </form>
      </div>
    </main>
  )
}
