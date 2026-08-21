import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function geminiProxy(apiKey: string | undefined): Plugin {
  return {
    name: 'mirror-gemini-proxy',
    configureServer(server) {
      server.middlewares.use('/api/mirror/analyze', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.end('Method not allowed')
          return
        }
        if (!apiKey) {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: 'GEMINI_API_KEY is missing from .env.' }))
          return
        }
        try {
          const chunks: Buffer[] = []
          for await (const chunk of request) chunks.push(Buffer.from(chunk))
          const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: Buffer.concat(chunks).toString('utf8') }
          )
          const body = await upstream.text()
          response.statusCode = upstream.status
          response.setHeader('Content-Type', 'application/json')
          response.end(body)
        } catch (error) {
          response.statusCode = 502
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to reach Gemini.' }))
        }
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), geminiProxy(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY)],
    base: './',
    build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 1000 }
  }
})
