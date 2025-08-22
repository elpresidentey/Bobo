// Netlify Function: Verify Paystack transaction
// File: netlify/functions/verify-paystack.js
// Env: PAYSTACK_SECRET_KEY (sk_test_... or sk_live_...)

const PAYSTACK_VERIFY_BASE = 'https://api.paystack.co/transaction/verify/';

exports.handler = async (event, context) => {
  const response = (statusCode, bodyObj) => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(bodyObj),
  });

  try {
    if (event.httpMethod === 'OPTIONS') {
      return response(204, {});
    }
    if (event.httpMethod !== 'GET') {
      return response(405, { error: 'Method Not Allowed' });
    }

    const params = event.queryStringParameters || {};
    const reference = params.reference;
    if (!reference) {
      return response(400, { error: 'Missing reference' });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return response(500, { error: 'Server not configured. Missing PAYSTACK_SECRET_KEY.' });
    }

    const res = await fetch(PAYSTACK_VERIFY_BASE + encodeURIComponent(reference), {
      headers: {
        Authorization: `Bearer ${secret}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json().catch(() => ({}));
    return response(res.status || 200, data);
  } catch (err) {
    return response(500, { error: 'Verification failed', details: err && err.message ? err.message : String(err) });
  }
};

