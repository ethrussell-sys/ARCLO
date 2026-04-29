'use client'

import { useEffect, useState } from 'react'

export default function AgeGate({ slug }: { slug: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const key = `age-confirmed-${slug}`
    if (!localStorage.getItem(key)) setVisible(true)
  }, [slug])

  function confirm() {
    localStorage.setItem(`age-confirmed-${slug}`, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>

      {/* Wordmark */}
      <span style={{
        position: 'absolute',
        top: '40px',
        color: '#525252',
        fontSize: '12px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-geist-sans)',
      }}>
        ARCLO
      </span>

      <div style={{
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        textAlign: 'center',
      }}>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '15px',
          lineHeight: 1.7,
          margin: 0,
        }}>
          This film is rated R. You must be 18 or older to continue.
        </p>

        <button
          onClick={confirm}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: '#0A84FF',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            cursor: 'pointer',
          }}
        >
          I am 18 or older
        </button>

        <a
          href="/"
          style={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: '13px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Go back
        </a>
      </div>
    </div>
  )
}
