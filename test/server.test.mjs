import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';

const { createApp } = await import('../server.mjs');

function toUrl(url) {
  return new URL(url, 'http://localhost');
}

test('serves the SPA index for root requests', async () => {
  const app = createApp({ distDir: new URL('../dist/', import.meta.url).pathname });
  const server = createServer(app);
  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');

    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/`);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /<!doctype html|<html/i);
  } finally {
    server.close();
  }
});

test('returns a JSON API error when the Gemini key is missing', async () => {
  const app = createApp({ distDir: new URL('../dist/', import.meta.url).pathname, geminiApiKey: undefined });
  const server = createServer(app);
  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');

    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/mirror/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] })
    });

    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.ok(payload.error);
  } finally {
    server.close();
  }
});
