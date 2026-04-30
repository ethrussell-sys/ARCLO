import { serverClient } from '@/lib/supabase'
import SubmissionsTable from './SubmissionsTable'

async function getData() {
  const db = serverClient()

  const [
    { data: submissions },
    { data: purchases },
    { data: waitlist },
    { count: pageViews },
    { count: trailerPlays },
    { count: checkoutStarts },
    { count: completedPurchases },
  ] = await Promise.all([
    db.from('films')
      .select('id, title, director, year, contact_email, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),

    db.from('purchases')
      .select('id, email, created_at, utm_source, utm_medium, utm_campaign, films(title, price)')
      .order('created_at', { ascending: false }),

    db.from('waitlist')
      .select('id, email, country, film_slug, created_at')
      .order('created_at', { ascending: false }),

    db.from('events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
    db.from('events').select('*', { count: 'exact', head: true }).eq('event_type', 'trailer_play'),
    db.from('events').select('*', { count: 'exact', head: true }).eq('event_type', 'checkout_start'),
    db.from('events').select('*', { count: 'exact', head: true }).eq('event_type', 'purchase_complete'),
  ])

  const totalRevenue = (purchases ?? []).reduce((sum, p) => {
    const film = p.films as { price?: number } | null
    return sum + (film?.price ?? 1.99)
  }, 0)

  const conversionRate =
    pageViews && pageViews > 0
      ? (((completedPurchases ?? 0) / pageViews) * 100).toFixed(2)
      : '0.00'

  return {
    submissions: submissions ?? [],
    purchases: purchases ?? [],
    waitlist: waitlist ?? [],
    totalRevenue,
    stats: {
      pageViews: pageViews ?? 0,
      trailerPlays: trailerPlays ?? 0,
      checkoutStarts: checkoutStarts ?? 0,
      completedPurchases: completedPurchases ?? 0,
      conversionRate,
    },
  }
}

const sectionHead: React.CSSProperties = {
  fontFamily: 'var(--font-bebas)',
  fontSize: '28px',
  letterSpacing: '-0.5px',
  textTransform: 'uppercase',
  color: '#ffffff',
  margin: 0,
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
  color: '#a3a3a3',
}

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #1a1a1a',
  margin: '48px 0',
}

export default async function AdminPage() {
  const { submissions, purchases, waitlist, totalRevenue, stats } = await getData()

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header style={{ borderBottom: '1px solid #111', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '22px', color: '#0A84FF', letterSpacing: '1px' }}>ARCLO</span>
          <span style={{ color: '#404040', fontSize: '13px' }}>Admin</span>
        </div>
        <a
          href="/api/admin/logout"
          style={{ color: '#525252', fontSize: '13px', textDecoration: 'none' }}
        >
          Logout
        </a>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px' }}>

        {/* ── Submissions ─────────────────────────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
            <h2 style={sectionHead}>Submissions</h2>
            <span style={{ color: '#525252', fontSize: '13px' }}>
              {submissions.length} pending
            </span>
          </div>
          <SubmissionsTable films={submissions} />
        </section>

        <hr style={divider} />

        {/* ── Purchases ───────────────────────────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '24px' }}>
            <h2 style={sectionHead}>Purchases</h2>
            <span style={{ color: '#0A84FF', fontSize: '22px', fontFamily: 'var(--font-bebas)', letterSpacing: '0.5px' }}>
              ${totalRevenue.toFixed(2)}
            </span>
          </div>

          {purchases.length === 0 ? (
            <p style={{ color: '#404040', fontSize: '14px' }}>No purchases yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Film</th>
                    <th style={th}>Buyer</th>
                    <th style={th}>Source</th>
                    <th style={th}>Medium</th>
                    <th style={th}>Campaign</th>
                    <th style={th}>Date</th>
                    <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => {
                    const film = p.films as { title?: string; price?: number } | null
                    const row = p as typeof p & { utm_source?: string; utm_medium?: string; utm_campaign?: string }
                    return (
                      <tr key={p.id}>
                        <td style={{ ...td, color: '#fff' }}>{film?.title ?? '—'}</td>
                        <td style={td}>{p.email}</td>
                        <td style={td}>{row.utm_source ?? '—'}</td>
                        <td style={td}>{row.utm_medium ?? '—'}</td>
                        <td style={td}>{row.utm_campaign ?? '—'}</td>
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ ...td, textAlign: 'right', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                          ${(film?.price ?? 1.99).toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <hr style={divider} />

        {/* ── Waitlist ────────────────────────────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
            <h2 style={sectionHead}>Waitlist</h2>
            <span style={{ color: '#525252', fontSize: '13px' }}>{waitlist.length} signups</span>
          </div>

          {waitlist.length === 0 ? (
            <p style={{ color: '#404040', fontSize: '14px' }}>No waitlist signups yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Email</th>
                    <th style={th}>Country</th>
                    <th style={th}>Film</th>
                    <th style={th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((w) => (
                    <tr key={w.id}>
                      <td style={{ ...td, color: '#fff' }}>{w.email}</td>
                      <td style={td}>{w.country ?? '—'}</td>
                      <td style={td}>{w.film_slug ?? '—'}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        {new Date(w.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <hr style={divider} />

        {/* ── Events ──────────────────────────────────────────────────────── */}
        <section>
          <h2 style={{ ...sectionHead, marginBottom: '24px' }}>Events</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', marginBottom: '32px' }}>
            {[
              { label: 'Page views', value: stats.pageViews },
              { label: 'Trailer plays', value: stats.trailerPlays },
              { label: 'Checkout starts', value: stats.checkoutStarts },
              { label: 'Purchases', value: stats.completedPurchases },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{ background: '#0a0a0a', padding: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <span style={{ color: '#ffffff', fontSize: '36px', fontFamily: 'var(--font-bebas)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {value.toLocaleString()}
                </span>
                <span style={{ color: '#525252', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ color: '#0A84FF', fontSize: '28px', fontFamily: 'var(--font-bebas)' }}>
              {stats.conversionRate}%
            </span>
            <span style={{ color: '#525252', fontSize: '13px' }}>
              page view → purchase conversion
            </span>
          </div>
        </section>

      </div>
    </main>
  )
}
