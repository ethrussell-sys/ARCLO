# TODO — a2-a3-ownership branch

## STEP 2 — VERIFIED (2026-09-01)

The purchase-recording + UTM fix (consolidated `createOrGetPurchase()`,
wired into the webhook, `/success` page, and `/api/purchase`) is
confirmed working end-to-end via a real test purchase:
`?utm_source=manualtest` → Stripe Checkout redirect → 4242 test card →
`purchases` row `83800eea-e58f-4fae-a8fa-d24b7be790dc`, `created_at`
today, `utm_source: 'manualtest'`, `utm_medium: 'browser'` both
populated. Row creation + UTM capture confirmed. (Only the Stripe
Checkout redirect path was exercised — the Apple/Google Pay wallet
path shares the same `createOrGetPurchase()` call but hasn't been
separately tested on a real device with a wallet configured.)

### Bug found + fixed: purchase confirmation email crash

Every real purchase crashed the email send with "Failed to render
React component — install @react-email/render" — the success page's
"Download link sent to {email}" message was false whenever this hit,
silently. Fixed the same way `/api/submit` was fixed (`6ebc49c`):
replaced the `react:` (React-element) prop to Resend with a plain
`html:` template literal in `lib/emails/send.ts`, dropping the
react-email dependency entirely. Re-verified with a fresh test
purchase — server log showed `[email] sent successfully, id:
081c99c2-...` with no render error.

### Bug found, NOT fixed: Resend sending domain unverified (pre-launch blocker)

Sender is still `onboarding@resend.dev` (see the commented-out FROM
line in `lib/emails/send.ts`), which can only deliver to Resend's own
test addresses (e.g. `delivered@resend.dev`) — a real customer address
(e.g. `test-manualtest@example.com`) gets rejected with a 422
`validation_error`. **Purchase confirmation emails will not reach real
customers until `solvscreen.com` is verified in Resend** (add the
domain, add the DNS records Resend gives you, wait for verification),
and the FROM address in `lib/emails/send.ts` is switched over. Not
started — needs a decision on DNS registrar access.

### Timing note: one slow `/success` load, not the email

One `/success` request logged 25.4s server-side against a baseline of
0.9–2.5s on other requests in the same session. **Not the email
send** — `lib/purchase.ts` already fires it via `.catch()` without
`await`, and the server log shows the `/success` response completing
before the email promise resolved. Likely cause: Supabase free-tier
cold start after an idle gap — unconfirmed (one data point), should
resolve once Supabase is off the free tier (see below). Worth
re-checking if it recurs.

## STEP 3 — NOT BUILT YET

The gated download endpoint: a single endpoint every download routes
through. Verifies access via either (a) the A2 purchase token
(already minted by `createOrGetPurchase()` and stashed in
`sessionStorage` on the success page — currently inert, nothing reads
it back yet) or (b) an email-verified magic-link session (A3, also not
built). Runs ONE policy checkpoint (`assertDownloadAllowed` or
similar) shared by both credential types, mints a fresh presigned S3
URL per request with a clean filename via `ResponseContentDisposition`,
and reconciles the existing `download_limit=1`.

**Rule:** purchase-token downloads are always allowed and never
counted; only email-session re-downloads are ever counted against the
limit. This is the piece that makes the A2 purchase token actually
drive a download — right now it's stored but unused.

Uses the atomic `increment_download_count()` Postgres function
(migration `013_atomic_download_increment.sql`, already applied) for
the counted path.

**SEQUENCING:** step 2 (purchase recording + UTM capture) is now
verified — see above. Step 3 is unblocked.

## Before pushing A2/A3

- [ ] Add `DOWNLOAD_TOKEN_SECRET` to Vercel env vars (currently
      local-only, in `.env.local`)
- [ ] Remove the stray unused `AWS_S3_BUCKET` env var from Vercel
      (code reads `AWS_BUCKET_NAME`, not `AWS_S3_BUCKET`) — do this
      deliberately, since removing a Vercel env var triggers a redeploy
- [ ] Check the 4 "Needs Attention" env vars flagged in the Vercel
      dashboard
- [ ] Two known pre-existing logic bugs, left alone (real, but out of
      scope for this build): `react-hooks/set-state-in-effect` in
      `app/watch/[slug]/AgeGate.tsx` and
      `components/AddToHomeScreen.tsx`

## Pre-launch (before real traffic)

- [ ] Upgrade Supabase off the free tier (auto-pauses on inactivity)
- [ ] Upgrade Vercel off the Hobby plan
- [ ] Verify `solvscreen.com` as a sending domain in Resend, add the
      DNS records it gives you, then switch `FROM` in
      `lib/emails/send.ts` off `onboarding@resend.dev` — see STEP 2
      above. Purchase confirmation emails don't reach real customers
      until this is done.
