import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Dev-only stand-ins for the production serverless routes. Keeps the browser
 * code identical in dev and prod: both POST /api/si and GET /api/nasa.
 * The handler modules are loaded lazily so a missing api/** file cannot break
 * the dev server.
 */
function edgeDevApi(path: string): Plugin {
  return {
    name: `ignis-edge-dev-api-${path.replace(/\W/g, '-')}`,
    configureServer(server) {
      server.middlewares.use(path, async (req, res) => {
        try {
          const mod = (await server.ssrLoadModule(`${path}.ts`)) as {
            default?: (request: Request) => Promise<Response>
          }
          if (typeof mod.default !== 'function') {
            throw new Error(`${path}.ts does not export a default handler`)
          }
          const url = new URL(req.originalUrl ?? path, 'http://localhost')
          let body: string | undefined
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk as Buffer)
            body = Buffer.concat(chunks).toString('utf8')
          }
          const request = new Request(url, {
            method: req.method,
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body,
          })
          const response = await mod.default(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(await response.text())
        } catch (error) {
          // The client treats any non-200 as "use the offline fallback", so this is safe.
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'Route unavailable in dev',
              detail: error instanceof Error ? error.message : String(error),
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), edgeDevApi('/api/si'), edgeDevApi('/api/nasa')],
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
