'use client'

import { useState } from 'react'

type Film = {
  id: string
  title: string
  director: string | null
  year: number | null
  contact_email: string | null
  created_at: string
}

const th: React.CSSProperties = {
  color: '#404040',
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  textAlign: 'left',
  padding: '0 16px 12px 0',
  whiteSpace: 'nowrap',
}

const td: React.CSSProperties = {
  fontSize: '14px',
  padding: '14px 16px 14px 0',
  borderTop: '1px solid #111',
  verticalAlign: 'middle',
}

export default function SubmissionsTable({ films }: { films: Film[] }) {
  const [actioned, setActioned] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<Record<string, 'approving' | 'rejecting' | null>>({})

  const visible = films.filter((f) => !actioned.has(f.id))

  async function approve(film: Film) {
    setLoading((l) => ({ ...l, [film.id]: 'approving' }))
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filmId: film.id }),
    })
    if (res.ok) setActioned((s) => new Set(s).add(film.id))
    setLoading((l) => ({ ...l, [film.id]: null }))
  }

  async function reject(film: Film) {
    setLoading((l) => ({ ...l, [film.id]: 'rejecting' }))
    const res = await fetch('/api/admin/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filmId: film.id,
        contactEmail: film.contact_email,
        filmTitle: film.title,
        director: film.director,
      }),
    })
    if (res.ok) setActioned((s) => new Set(s).add(film.id))
    setLoading((l) => ({ ...l, [film.id]: null }))
  }

  if (visible.length === 0) {
    return <p style={{ color: '#404040', fontSize: '14px' }}>No pending submissions.</p>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Title</th>
            <th style={th}>Director</th>
            <th style={th}>Year</th>
            <th style={th}>Email</th>
            <th style={th}>Submitted</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {visible.map((film) => {
            const state = loading[film.id]
            return (
              <tr key={film.id}>
                <td style={{ ...td, color: '#fff', fontWeight: 500 }}>{film.title}</td>
                <td style={{ ...td, color: '#a3a3a3' }}>{film.director ?? '—'}</td>
                <td style={{ ...td, color: '#a3a3a3' }}>{film.year ?? '—'}</td>
                <td style={{ ...td, color: '#a3a3a3' }}>{film.contact_email ?? '—'}</td>
                <td style={{ ...td, color: '#525252', whiteSpace: 'nowrap' }}>
                  {new Date(film.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => approve(film)}
                      disabled={!!state}
                      style={{
                        backgroundColor: '#0A84FF',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: state ? 'not-allowed' : 'pointer',
                        opacity: state ? 0.5 : 1,
                      }}
                    >
                      {state === 'approving' ? '…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => reject(film)}
                      disabled={!!state}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#a3a3a3',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '13px',
                        cursor: state ? 'not-allowed' : 'pointer',
                        opacity: state ? 0.5 : 1,
                      }}
                    >
                      {state === 'rejecting' ? '…' : 'Reject'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
