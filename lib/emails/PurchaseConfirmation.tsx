import * as React from 'react'

type Props = {
  filmTitle: string
  downloadUrl: string
}

export function PurchaseConfirmationEmail({ filmTitle, downloadUrl }: Props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>You own {filmTitle}</title>
      </head>
      <body style={body}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={outer}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '48px 24px' }}>
                <table width="100%" cellPadding={0} cellSpacing={0} style={card}>
                  <tbody>

                    {/* Wordmark */}
                    <tr>
                      <td style={{ paddingBottom: '48px' }}>
                        <span style={wordmark}>ARCLO</span>
                      </td>
                    </tr>

                    {/* Headline */}
                    <tr>
                      <td style={{ paddingBottom: '12px' }}>
                        <h1 style={headline}>You own it.</h1>
                      </td>
                    </tr>

                    {/* Film title */}
                    <tr>
                      <td style={{ paddingBottom: '40px' }}>
                        <p style={filmName}>{filmTitle}</p>
                      </td>
                    </tr>

                    {/* Divider */}
                    <tr>
                      <td style={{ paddingBottom: '40px' }}>
                        <hr style={divider} />
                      </td>
                    </tr>

                    {/* Download instruction */}
                    <tr>
                      <td style={{ paddingBottom: '24px' }}>
                        <p style={instruction}>
                          Your download link is ready. Tap below to save the film to your device.
                        </p>
                      </td>
                    </tr>

                    {/* CTA */}
                    <tr>
                      <td style={{ paddingBottom: '40px' }}>
                        <a href={downloadUrl} style={button}>
                          Download {filmTitle}
                        </a>
                      </td>
                    </tr>

                    {/* Divider */}
                    <tr>
                      <td style={{ paddingBottom: '32px' }}>
                        <hr style={divider} />
                      </td>
                    </tr>

                    {/* Fine print */}
                    <tr>
                      <td>
                        <p style={finePrint}>
                          This link expires in 24 hours. Keep this email — it&apos;s your receipt.
                          <br />
                          Questions? Reply to this email and we&apos;ll sort it out.
                        </p>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#000000',
  margin: 0,
  padding: 0,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  WebkitTextSizeAdjust: '100%',
}

const outer: React.CSSProperties = {
  backgroundColor: '#000000',
  width: '100%',
}

const card: React.CSSProperties = {
  maxWidth: '480px',
  width: '100%',
}

const wordmark: React.CSSProperties = {
  color: '#0A84FF',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
}

const headline: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '52px',
  fontWeight: 900,
  margin: 0,
  lineHeight: 1,
  letterSpacing: '-1.5px',
}

const filmName: React.CSSProperties = {
  color: '#a3a3a3',
  fontSize: '18px',
  margin: 0,
  lineHeight: 1.5,
}

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #1c1c1c',
  margin: 0,
}

const instruction: React.CSSProperties = {
  color: '#525252',
  fontSize: '14px',
  margin: 0,
  lineHeight: 1.6,
}

const button: React.CSSProperties = {
  backgroundColor: '#0A84FF',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '12px',
  display: 'inline-block',
  letterSpacing: '0.1px',
}

const finePrint: React.CSSProperties = {
  color: '#404040',
  fontSize: '12px',
  margin: 0,
  lineHeight: 1.7,
}
