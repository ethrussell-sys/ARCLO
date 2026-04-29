import RedeemForm from './RedeemForm'

export default function DownloadPage() {
  return (
    <main style={{
      backgroundColor: '#000',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}>

        {/* Wordmark */}
        <div style={{ textAlign: 'center' }}>
          <span style={{
            color: '#525252',
            fontSize: '12px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-geist-sans)',
          }}>
            ARCLO
          </span>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(2.4rem, 10vw, 3.5rem)',
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '-0.5px',
            margin: 0,
          }}>
            Get your film
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '14px',
            margin: 0,
            lineHeight: 1.5,
          }}>
            Enter your redemption code to generate a fresh download link.
          </p>
        </div>

        {/* Form */}
        <RedeemForm />

        {/* Footer link */}
        <a
          href="/"
          style={{
            color: 'rgba(255,255,255,0.2)',
            fontSize: '12px',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Explore films
        </a>

      </div>
    </main>
  )
}
