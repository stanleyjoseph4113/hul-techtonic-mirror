import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.loadEnvFile(path.join(__dirname, '.env'));

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function sendHtml(response, statusCode, html) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(html);
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.svg': return 'image/svg+xml';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.ico': return 'image/x-icon';
    default: return 'application/octet-stream';
  }
}

export function createApp({ distDir = path.join(__dirname, 'dist'), geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY } = {}) {
  return async function app(request, response) {
    const url = new URL(request.url || '/', 'http://localhost');

    if (url.pathname === '/api/mirror/analyze') {
      if (request.method !== 'POST') {
        sendJson(response, 405, { error: 'Method not allowed' });
        return;
      }
      if (!geminiApiKey) {
        sendJson(response, 500, { error: 'GEMINI_API_KEY is missing from environment.' });
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of request) {
          chunks.push(Buffer.from(chunk));
        }

        const upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: Buffer.concat(chunks).toString('utf8'),
          },
        );

        const body = await upstream.text();
        response.statusCode = upstream.status;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(body);
        return;
      } catch (error) {
        sendJson(response, 502, { error: error instanceof Error ? error.message : 'Unable to reach Gemini.' });
        return;
      }
    }

    if (url.pathname === '/') {
      const indexPath = path.join(distDir, 'index.html');
      const html = await fs.promises.readFile(indexPath, 'utf8');
      sendHtml(response, 200, html);
      return;
    }

    const candidate = path.join(distDir, url.pathname.replace(/^\/+/, ''));
    const resolved = path.resolve(candidate);
    const distRoot = path.resolve(distDir);
    if (!resolved.startsWith(distRoot)) {
      sendHtml(response, 403, 'Forbidden');
      return;
    }

    try {
      const file = await fs.promises.readFile(resolved);
      response.statusCode = 200;
      response.setHeader('Content-Type', getMimeType(resolved));
      response.end(file);
    } catch {
      const indexPath = path.join(distDir, 'index.html');
      try {
        const html = await fs.promises.readFile(indexPath, 'utf8');
        sendHtml(response, 200, html);
      } catch {
        sendHtml(response, 404, 'Not Found');
      }
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  const app = createApp();
  http.createServer(app).listen(port, () => {
    console.log(`Mirror production server running on http://localhost:${port}`);
  });
}
