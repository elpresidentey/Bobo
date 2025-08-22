# Checkout verification setup

This project includes client-side Paystack checkout and two example serverless verification endpoints.

Do not expose your Paystack SECRET key on the client. Keep it in serverless function environment variables only.

## Pick your platform

- Vercel
  - Function file: `api/verify-paystack.js`
  - URL in production: `https://<your-domain>/api/verify-paystack?reference=...`
  - Set env var in Vercel dashboard:
    - `PAYSTACK_SECRET_KEY = sk_test_xxx` (or `sk_live_xxx`)
  - Redeploy after setting the env var.

- Netlify
  - Function file: `netlify/functions/verify-paystack.js`
  - URL in production: `/.netlify/functions/verify-paystack?reference=...`
  - Set env var in Netlify Site settings → Build & Deploy → Environment:
    - `PAYSTACK_SECRET_KEY = sk_test_xxx` (or `sk_live_xxx`)
  - Redeploy after setting the env var.

## Local testing

- Vercel
  - Install vercel CLI: `npm i -g vercel`
  - From project root: `vercel dev`
  - Set local env: create `.env.local` with `PAYSTACK_SECRET_KEY=sk_test_xxx`
  - Test: `http://localhost:3000/api/verify-paystack?reference=REF123`

- Netlify
  - Install netlify CLI: `npm i -g netlify-cli`
  - From project root: `netlify dev`
  - Set local env: create `.env` with `PAYSTACK_SECRET_KEY=sk_test_xxx`
  - Test: `http://localhost:8888/.netlify/functions/verify-paystack?reference=REF123`

## Client behavior

The client (script.js) will attempt verification in this order:
1. `/api/verify-paystack?reference=...` (Vercel style)
2. `/.netlify/functions/verify-paystack?reference=...` (Netlify style)

The first endpoint found to exist and return OK will be used.

On success, the order stored in localStorage is marked `paid` and `verified=true`.
If no endpoint is present, the UI will show "verification pending".

## Security checklist

- Never put `PAYSTACK_SECRET_KEY` in client code. Keep it server-side.
- Serve your site over HTTPS in production.
- Consider validating the amount and currency on the server by re-computing the order from a trusted source (e.g., re-query product prices) before marking orders as paid.
- Log or store the full verification payload server-side for audit if needed.

## CSP

The page includes a CSP that allows Paystack script and frames. If you deploy behind a different domain and need stricter CSP, update the meta tag in `index.html` accordingly.

