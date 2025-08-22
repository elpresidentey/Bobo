# Bobo & Omoge

A static site showcasing luxury African-inspired fashion with a client-side cart and optional Paystack checkout.

Live deployment
- GitHub Pages workflow is included in .github/workflows/pages.yml
- Push to main and GitHub Actions will build and publish
- Your site will be available at https://<your-user>.github.io/<repo>/

Local development
- Simple static preview (no serverless verification):
  - npm i -g serve
  - serve -l 3000 --single -s "C:\\Users\\hp\\bobo & omoge"
- Netlify Dev (enables /.netlify/functions/verify-paystack):
  - npm i -g netlify-cli
  - Create .env with PAYSTACK_SECRET_KEY=sk_test_xxx
  - netlify dev --dir "C:\\Users\\hp\\bobo & omoge"
- Vercel Dev (enables /api/verify-paystack):
  - npm i -g vercel
  - Create .env.local with PAYSTACK_SECRET_KEY=sk_test_xxx
  - vercel dev --cwd "C:\\Users\\hp\\bobo & omoge"

Paystack setup
- In script.js, replace the placeholder with your Paystack public key:
  const PAYSTACK_PUBLIC_KEY = 'pk_test_replace_with_your_key'
- Keep PAYSTACK_SECRET_KEY ONLY in serverless env (.env/.env.local or host dashboard), NOT in client code.

Notes for GitHub Pages
- index.html injects a dynamic <base href> so assets work under /<repo>/ subpath.
- Serverless verification isn’t supported on GitHub Pages. For end-to-end payment verification, deploy to Netlify or Vercel and set PAYSTACK_SECRET_KEY.

