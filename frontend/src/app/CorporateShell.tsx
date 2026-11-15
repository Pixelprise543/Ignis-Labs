import { useState } from 'react'
import { colors } from '../design-system/tokens/colors'
import { CorporateHeader } from './CorporateHeader'
import { MobileMenu } from './MobileMenu'
import { CorporateFooter } from './CorporateFooter'

export function CorporateShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div
      className="flex flex-col min-h-screen text-slate-200"
      style={{ backgroundColor: colors.semantic.background }}
    >
      <CorporateHeader
        onMenuToggle={() =>
          setIsMobileOpen((prev) => !prev)
        }
      />
      {isMobileOpen && (
        <MobileMenu
          isOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
        />
      )}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </main>
      <CorporateFooter />
    </div>
  )
}
