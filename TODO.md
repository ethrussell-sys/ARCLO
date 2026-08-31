# TODO — a2-a3-ownership branch

## STEP 2 NOT YET VERIFIED

The purchase-recording + UTM fix (consolidated `createOrGetPurchase()`,
wired into the webhook, `/success` page, and `/api/purchase`) is
written and committed, but has never been observed actually working
end-to-end. No `purchases` row has been created and inspected through
either real checkout path since the consolidation landed.

**Tomorrow's first task, before building anything further:** do a real
browser test purchase (test mode — local Stripe keys are `sk_test_`)
with `?utm_source=manualtest` in the film page URL, then confirm a NEW
row lands in `purchases` with `utm_source` populated. Test **both**
paths:

- Apple/Google Pay wallet
- Stripe Checkout redirect

The full step-by-step plan (including the optional Stripe CLI webhook
forwarding route) is in the session transcript — ask Claude to
reproduce it if needed.

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
