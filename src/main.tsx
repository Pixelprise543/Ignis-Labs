import { StrictMode, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import '@/design-system/theme.css'
import { initUrlSync } from '@/store/urlSync'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root is missing from index.html')

const root = createRoot(container)

/**
 * PC3 owns "@/app/App". Globbing instead of a static import keeps this scaffold
 * buildable before the shell lands, and picks it up automatically after merge
 * (no edit needed here). Matches PC3's own import.meta.glob routing strategy.
 */
const appModules = import.meta.glob<{ default: ComponentType }>([
  '/src/app/App.tsx',
  '/src/app/App/index.tsx',
])

function MissingShell() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'var(--ig-vacuum)',
        color: 'var(--ig-frost)',
        fontFamily: 'var(--font-sans)',
        textAlign: 'center',
        lineHeight: 1.6,
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Ignis scaffold is running</p>
        <p style={{ margin: '8px 0 0', color: 'var(--ig-muted)' }}>
          The app shell (<code>src/app/App.tsx</code>) has not landed yet. PC3 owns that file; this
          page is the plain-text fallback so the build and dev server stay usable.
        </p>
      </div>
    </div>
  )
}

async function start() {
  // Apply a shared URL to the store before the first render, so a pasted link
  // opens on its scenario instead of flashing the default. Calling this twice is
  // harmless: each caller gets its own disposer.
  initUrlSync()

  for (const load of Object.values(appModules)) {
    const mod = await load()
    if (typeof mod.default === 'function') {
      const App = mod.default
      root.render(
        <StrictMode>
          <App />
        </StrictMode>,
      )
      return
    }
  }

  root.render(
    <StrictMode>
      <MissingShell />
    </StrictMode>,
  )
}

void start()
