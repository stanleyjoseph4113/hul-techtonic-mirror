import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function nvidiaProxy(apiKey: string | undefined): Plugin {
  return {
    name: 'mirror-nvidia-proxy',
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
          response.end(JSON.stringify({ error: 'NVIDIA_API_KEY is missing from .env.' }))
          return
        }
        try {
          const chunks: Buffer[] = []
          for await (const chunk of request) chunks.push(Buffer.from(chunk))
          const upstream = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
            body: Buffer.concat(chunks).toString('utf8')
          })
          const body = await upstream.text()
          response.statusCode = upstream.status
          response.setHeader('Content-Type', 'application/json')
          response.end(body)
        } catch (error) {
          response.statusCode = 502
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to reach NVIDIA.' }))
        }
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // NVIDIA_API_KEY is server-only. VITE_NVIDIA_API_KEY is supported only so
  // existing local setups keep working; rename it before sharing the project.
  const nvidiaApiKey = env.NVIDIA_API_KEY || env.VITE_NVIDIA_API_KEY
  return {
    plugins: [react(), nvidiaProxy(nvidiaApiKey)],
    base: './',
    build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 1000 }
  }
})
