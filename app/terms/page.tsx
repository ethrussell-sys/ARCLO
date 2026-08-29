import type { Metadata } from 'next'
import Link from 'next/link'
import { Wordmark } from '@/components/Wordmark'
import { tokens } from '@/lib/tokens'

export const metadata: Metadata = {
  title: 'Terms of Service — Sølv',
}

const EFFECTIVE_DATE = 'May 19, 2025'
const CONTACT_EMAIL = 'legal@solvscreen.com'

const section: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}

const sectionLabel: React.CSSProperties = {
  color: tokens.color.muted2,
  fontSize: '10px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontWeight: 700,
  margin: 0,
}

const sectionHeading: React.CSSProperties = {
  color: tokens.color.ink,
  fontSize: '18px',
  fontWeight: 700,
  letterSpacing: '-0.2px',
  margin: 0,
  lineHeight: 1.3,
}

const body: React.CSSProperties = {
  color: tokens.color.muted2,
  fontSize: '14px',
  lineHeight: 1.8,
  margin: 0,
}

const strong: React.CSSProperties = {
  color: tokens.color.muted,
  fontWeight: 500,
}

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: `1px solid ${tokens.color.line}`,
  margin: 0,
}

export default function TermsPage() {
  return (
    <main style={{ backgroundColor: tokens.color.bg, color: tokens.color.ink, minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '64px 24px 96px' }}>

        {/* Wordmark */}
        <div style={{ marginBottom: '56px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Wordmark size={12} tracking="0.25em" color={tokens.color.muted2} fontFamily={tokens.font.body} />
          </Link>
        </div>

        {/* Page title */}
        <div style={{ marginBottom: '48px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(2.8rem, 8vw, 4rem)',
              textTransform: 'uppercase',
              lineHeight: 1,
              letterSpacing: '-0.5px',
              margin: '0 0 16px',
            }}
          >
            Terms of Service
          </h1>
          <p style={{ color: tokens.color.line2, fontSize: '12px', margin: 0 }}>
            Effective {EFFECTIVE_DATE}
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

          {/* 1. About Sølv */}
          <div style={section}>
            <p style={sectionLabel}>1</p>
            <h2 style={sectionHeading}>What Sølv Is</h2>
            <p style={body}>
              Sølv is a platform for purchasing permanent download licenses for independent films.
              When you complete a purchase, you receive a personal license to download and watch
              the film on your own devices. Sølv acts as a distributor on behalf of the filmmakers
              who submit their work to the platform.
            </p>
            <p style={body}>
              By using Sølv you agree to these Terms. If you do not agree, do not make a purchase
              or submit content to the platform.
            </p>
          </div>

          <hr style={divider} />

          {/* 2. License grant */}
          <div style={section}>
            <p style={sectionLabel}>2</p>
            <h2 style={sectionHeading}>What You Get</h2>
            <p style={body}>
              Upon completing a purchase, Sølv grants you a{' '}
              <span style={strong}>personal, non-transferable, non-exclusive license</span>{' '}
              to download and watch the purchased film for your own private, non-commercial use.
            </p>
            <p style={body}>
              Your license includes{' '}
              <span style={strong}>1 download</span>{' '}
              of the film file. If you need to re-download after losing your copy, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: tokens.color.blue, textDecoration: 'none' }}>
                {CONTACT_EMAIL}
              </a>
              {' '}and we will assist you on a case-by-case basis.
            </p>
            <p style={body}>
              Your owner link is permanent and does not expire. Keep it somewhere safe — it is
              your proof of purchase.
            </p>
          </div>

          <hr style={divider} />

          {/* 3. Restrictions */}
          <div style={section}>
            <p style={sectionLabel}>3</p>
            <h2 style={sectionHeading}>What You Don&apos;t Get</h2>
            <p style={body}>
              Your license does not include any of the following:
            </p>
            <ul style={{ ...body, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <span style={strong}>Resale or sublicensing.</span>{' '}
                You may not sell, rent, lend, or otherwise transfer your license or the film
                file to any other person.
              </li>
              <li>
                <span style={strong}>Public performance.</span>{' '}
                You may not screen the film publicly, at events, in venues, or broadcast it
                in any form without a separate performance license from the filmmaker.
              </li>
              <li>
                <span style={strong}>Redistribution.</span>{' '}
                You may not upload, post, stream, or otherwise distribute the film or any
                portion of it on any platform, website, or service.
              </li>
              <li>
                <span style={strong}>Modification.</span>{' '}
                You may not edit, adapt, or create derivative works based on the film.
              </li>
            </ul>
            <p style={body}>
              Violation of these restrictions terminates your license immediately and may result
              in legal action.
            </p>
          </div>

          <hr style={divider} />

          {/* 4. Payment & refunds */}
          <div style={section}>
            <p style={sectionLabel}>4</p>
            <h2 style={sectionHeading}>Payment &amp; Refund Policy</h2>
            <p style={body}>
              All purchases are processed securely through Stripe. By completing a purchase you
              authorise the charge shown at checkout.
            </p>
            <p style={body}>
              <span style={strong}>All sales are final.</span>{' '}
              Because films are delivered as digital downloads, we do not offer refunds once your
              owner link has been issued. If you experience a technical problem preventing download,
              contact us and we will resolve it promptly.
            </p>
          </div>

          <hr style={divider} />

          {/* 5. Filmmaker submissions */}
          <div style={section}>
            <p style={sectionLabel}>5</p>
            <h2 style={sectionHeading}>Filmmaker Submissions</h2>
            <p style={body}>
              Filmmakers who submit content to Sølv warrant and represent that:
            </p>
            <ul style={{ ...body, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                They hold all rights necessary to distribute the film commercially, including
                rights to all music, footage, performances, and other third-party content
                incorporated in the work.
              </li>
              <li>
                The film does not infringe the intellectual property rights, privacy rights,
                or any other rights of any third party.
              </li>
              <li>
                The self-declared content rating accurately reflects the film&apos;s content
                in accordance with MPA guidelines.
              </li>
            </ul>
            <p style={body}>
              Sølv is not responsible for, and expressly disclaims all liability arising from,
              any unlicensed third-party content included in submitted films. Filmmakers agree
              to indemnify and hold harmless Sølv from any claim, loss, or expense (including
              legal fees) arising from a breach of these warranties.
            </p>
            <p style={body}>
              Sølv reserves the right to remove any film from the platform at any time without
              prior notice if it receives a credible claim of infringement or otherwise deems
              removal appropriate.
            </p>
          </div>

          <hr style={divider} />

          {/* 6. Limitation of liability */}
          <div style={section}>
            <p style={sectionLabel}>6</p>
            <h2 style={sectionHeading}>Limitation of Liability</h2>
            <p style={body}>
              To the fullest extent permitted by applicable law, Sølv and its operators shall
              not be liable for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of the platform or the content purchased through it,
              even if advised of the possibility of such damages.
            </p>
            <p style={body}>
              In no event shall Sølv&apos;s total liability to you exceed the amount you paid
              for the purchase giving rise to the claim.
            </p>
          </div>

          <hr style={divider} />

          {/* 7. Governing law */}
          <div style={section}>
            <p style={sectionLabel}>7</p>
            <h2 style={sectionHeading}>Governing Law</h2>
            <p style={body}>
              Any dispute arising out of or relating to these Terms or your use of Sølv shall
              be subject to the applicable laws of the jurisdiction in which the dispute arises.
              Nothing in these Terms limits any rights you may have under mandatory consumer
              protection legislation in your country of residence.
            </p>
          </div>

          <hr style={divider} />

          {/* 8. Contact */}
          <div style={section}>
            <p style={sectionLabel}>8</p>
            <h2 style={sectionHeading}>Contact</h2>
            <p style={body}>
              Questions about these Terms? Email us at{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                style={{ color: tokens.color.blue, textDecoration: 'none' }}
              >
                {CONTACT_EMAIL}
              </a>
              . We aim to respond within 2 business days.
            </p>
          </div>

        </div>

        {/* Footer nav */}
        <div style={{ marginTop: '80px', paddingTop: '32px', borderTop: `1px solid ${tokens.color.surface2}`, display: 'flex', gap: '24px' }}>
          <Link
            href="/"
            style={{ color: tokens.color.line2, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            ← Back to films
          </Link>
        </div>

      </div>
    </main>
  )
}
