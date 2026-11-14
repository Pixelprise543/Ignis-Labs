import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root is missing from index.html')

// Placeholder shell from the scaffold commit. Replaced in the next commit by the
// theme import + lazy "@/app/App" loader with a plain-text fallback.
createRoot(container).render(
  <StrictMode>
    <main>Ignis scaffold ready</main>
  </StrictMode>,
)
