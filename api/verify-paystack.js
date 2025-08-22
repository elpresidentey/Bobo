// Vercel Serverless Function: Verify Paystack transaction
// Path: /api/verify-paystack
// Env: PAYSTACK_SECRET_KEY (sk_test_... or sk_live_...)

const PAYSTACK_VERIFY_BASE = 'https://api.paystack.co/transaction/verify/';

module.exports = async (req, res) => {
  const send = (status, payload) => {
    try {
      res.status(status).json(payload);
    } catch (_) {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    }
  };

  try {
    // Only allow GET
    const method = req.method || (req && req.httpMethod) || 'GET';
    if (method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return send(204, {});
    }
    if (method !== 'GET') {
      return send(405, { error: 'Method Not Allowed' });
    }

    // Extract reference from query
    let reference = null;
    if (req.query && req.query.reference) {
      reference = req.query.reference;
    } else if (req.url) {
      const url = new URL(req.url, `http://localhost`);
      reference = url.searchParams.get('reference');
    }
    if (!reference) {
      return send(400, { error: 'Missing reference' });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return send(500, { error: 'Server not configured. Missing PAYSTACK_SECRET_KEY.' });
    }

    const resp = await fetch(PAYSTACK_VERIFY_BASE + encodeURIComponent(reference), {
      headers: {
        Authorization: `Bearer ${secret}`,
        Accept: 'application/json',
      },
    });

    const data = await resp.json().catch(() => ({}));
    // Mirror paystack response with status code passthrough when possible
    const status = resp.status || 200;
    // Allow CORS if needed
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-store');
    } catch (_) {}
    return send(status, data);
  } catch (err) {
    return send(500, { error: 'Verification failed', details: err && err.message ? err.message : String(err) });
  }
};

