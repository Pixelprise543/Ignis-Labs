import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Dev-only stand-in for the production serverless route at api/si.ts.
 * Keeps the browser code identical in dev and prod: both POST /api/si.
 * The handler module is loaded lazily so a missing api/si.ts cannot break the dev server.
 */
function siDevApi(): Plugin {
  return {
    name: 'ignis-si-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/si', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Use POST for /api/si' }))
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)

        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          const mod = (await server.ssrLoadModule('/api/si.ts')) as {
            handleSiRequest?: (input: unknown) => Promise<unknown>
          }
          if (typeof mod.handleSiRequest !== 'function') {
            throw new Error('api/si.ts does not export handleSiRequest')
          }
          const result = await mod.handleSiRequest(body)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (error) {
          // The client treats any non-200 as "use the offline fallback", so this is safe.
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'SI provider unavailable in dev',
              detail: error instanceof Error ? error.message : String(error),
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siDevApi()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    css: false,
  },
})
