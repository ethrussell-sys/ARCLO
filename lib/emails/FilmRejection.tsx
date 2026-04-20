import * as React from 'react'

type Props = { filmTitle: string; directorName: string }

export function FilmRejectionEmail({ filmTitle, directorName }: Props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Regarding {filmTitle}</title>
      </head>
      <body style={body}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={outer}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '48px 24px' }}>
                <table width="100%" cellPadding={0} cellSpacing={0} style={card}>
                  <tbody>

                    <tr>
                      <td style={{ paddingBottom: '48px' }}>
                        <span style={wordmark}>ARCLO</span>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ paddingBottom: '16px' }}>
                        <h1 style={headline}>Thank you for submitting.</h1>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ paddingBottom: '40px' }}>
                        <p style={sub}>
                          {directorName ? `${directorName}, we` : 'We'} reviewed{' '}
                          <em style={{ color: '#ffffff', fontStyle: 'italic' }}>{filmTitle}</em>{' '}
                          and it isn&apos;t the right fit for ARCLO at this time.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ paddingBottom: '40px' }}>
                        <hr style={divider} />
                      </td>
                    </tr>

                    <tr>
                      <td style={{ paddingBottom: '40px' }}>
                        <p style={copy}>
                          This decision is about fit, not quality. We&apos;re a small platform with a specific curatorial vision, and we can&apos;t always articulate exactly what we&apos;re looking for until we see it.
                          <br /><br />
                          We hope you find the right home for this film. You&apos;re welcome to submit future work.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ paddingBottom: '40px' }}>
                        <hr style={divider} />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <p style={finePrint}>Questions? Reply to this email.</p>
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

const body: React.CSSProperties = {
  backgroundColor: '#000000',
  margin: 0,
  padding: 0,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
}
const outer: React.CSSProperties = { backgroundColor: '#000000', width: '100%' }
const card: React.CSSProperties = { maxWidth: '480px', width: '100%' }
const wordmark: React.CSSProperties = { color: '#0A84FF', fontSize: '13px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }
const headline: React.CSSProperties = { color: '#ffffff', fontSize: '42px', fontWeight: 900, margin: 0, lineHeight: 1, letterSpacing: '-1px' }
const sub: React.CSSProperties = { color: '#a3a3a3', fontSize: '17px', margin: 0, lineHeight: 1.5 }
const copy: React.CSSProperties = { color: '#525252', fontSize: '14px', margin: 0, lineHeight: 1.7 }
const divider: React.CSSProperties = { border: 'none', borderTop: '1px solid #1c1c1c', margin: 0 }
const finePrint: React.CSSProperties = { color: '#404040', fontSize: '12px', margin: 0, lineHeight: 1.7 }
