import { useState } from 'react'
import { PlatformHeader } from './PlatformHeader'
import { PlatformSidebar } from './PlatformSidebar'
import { AskIgnisDrawer } from '../features/platform/shared/AskIgnisDrawer'

interface PlatformShellProps {
  children?: React.ReactNode
}

/**
 * Layout wrapper for platform (/app/*) pages.
 *
 * Composes the persistent PlatformSidebar, PlatformHeader (with scenario
 * controls, Ask Ignis access, and user actions), a main workspace content
 * area, and an Ask Ignis drawer that slides in from the right.
 */
export function PlatformShell({ children }: PlatformShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-void-950 text-slate-200">
      <PlatformHeader
        onAskIgnis={() => setDrawerOpen(true)}
        onUserAction={() => {}}
      />
      <div className="flex flex-1 overflow-hidden">
        <PlatformSidebar />
        <main className="flex-1 overflow-y-auto bg-void-950">
          <div className="px-6 py-5">
            <div className="space-y-5">{children}</div>
          </div>
        </main>
      </div>
      <AskIgnisDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}

export default PlatformShell
