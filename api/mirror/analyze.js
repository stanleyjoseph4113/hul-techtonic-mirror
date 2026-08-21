export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!geminiApiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'GEMINI_API_KEY is missing from environment.' }));
    return;
  }

  // Get raw body (Vercel may already parse JSON into req.body)
  let incoming;
  if (req.body && Object.keys(req.body).length) {
    try {
      incoming = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    } catch {
      incoming = '';
    }
  } else {
    const chunks = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    incoming = Buffer.concat(chunks).toString('utf8');
  }

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: incoming }
    );

    const body = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(body);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to reach Gemini.' }));
  }
}
