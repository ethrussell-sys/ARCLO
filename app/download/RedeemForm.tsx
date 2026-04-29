'use client'

import { useState } from 'react'

type Result = { downloadUrl: string; filmTitle: string }

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0d0d0d',
  border: '1px solid #222',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '16px',
  letterSpacing: '0.08em',
  padding: '16px 20px',
  outline: 'none',
  fontFamily: 'monospace',
  boxSizing: 'border-box',
  textTransform: 'uppercase',
}

export default function RedeemForm() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
    } else {
      setResult(data)
    }
  }

  if (result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
          {result.filmTitle}
        </p>
        <a
          href={result.downloadUrl}
          style={{
            display: 'block',
            width: '100%',
            padding: '18px',
            borderRadius: '14px',
            backgroundColor: '#0A84FF',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            textDecoration: 'none',
            textAlign: 'center',
            letterSpacing: '0.02em',
            boxSizing: 'border-box',
          }}
        >
          Download now
        </a>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0 }}>
          Link expires in 24 hours. Enter your code again to generate a new one.
        </p>
        <button
          onClick={() => { setResult(null); setCode('') }}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Enter another code
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="text"
        value={code}
        onChange={(e) => { setCode(e.target.value); setError('') }}
        placeholder="ARCLO-XXXX-XXXX"
        maxLength={14}
        spellCheck={false}
        autoCapitalize="characters"
        autoCorrect="off"
        style={inputStyle}
      />

      {error && (
        <p style={{ color: 'rgba(255,80,80,0.8)', fontSize: '13px', margin: 0, textAlign: 'center' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !code.trim()}
        style={{
          width: '100%',
          padding: '18px',
          borderRadius: '14px',
          border: '1px solid #333',
          background: 'transparent',
          color: loading || !code.trim() ? 'rgba(255,255,255,0.3)' : '#fff',
          fontSize: '15px',
          letterSpacing: '0.06em',
          cursor: loading || !code.trim() ? 'default' : 'pointer',
          textTransform: 'uppercase',
          transition: 'color 0.2s ease',
        }}
      >
        {loading ? 'Checking…' : 'Get download link'}
      </button>
    </form>
  )
}
