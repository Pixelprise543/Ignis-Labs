import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CorporateShell } from './CorporateShell'
import { PlatformShell } from './PlatformShell'

// Lazy corporate pages
const HomePage = lazy(() => import('../features/corporate').then((m) => ({ default: m.HomePage as React.ComponentType })))
const ProductPage = lazy(() => import('../features/corporate').then((m) => ({ default: m.ProductPage as React.ComponentType })))
const SolutionsPage = lazy(() => import('../features/corporate').then((m) => ({ default: m.SolutionsPage as React.ComponentType })))
const TechnologyPage = lazy(() => import('../features/corporate').then((m) => ({ default: m.TechnologyPage as React.ComponentType })))
const PricingPage = lazy(() => import('../features/corporate').then((m) => ({ default: m.PricingPage as React.ComponentType })))
const AboutPage = lazy(() => import('../features/corporate').then((m) => ({ default: m.AboutPage as React.ComponentType })))

// Lazy platform pages
const DashboardPage = lazy(() => import('../features/platform').then((m) => ({ default: m.DashboardPage as React.ComponentType })))
const ExplorePage = lazy(() =>
  import('../features/platform/research').then((m) => ({ default: m.ExplorePage as React.ComponentType }))
)
const DetailPage = lazy(() =>
  import('../features/platform/research').then((m) => ({ default: m.DetailPage as React.ComponentType }))
)
const AnalysisWorkspace = lazy(() =>
  import('../features/platform/analysis').then((m) => ({ default: m.AnalysisWorkspace as React.ComponentType }))
)
const InsightsPage = lazy(() =>
  import('../features/platform/insights').then((m) => ({ default: m.InsightsPage as React.ComponentType }))
)
const MissionPage = lazy(() =>
  import('../features/platform/mission').then((m) => ({ default: m.MissionPage as React.ComponentType }))
)
const DocsPage = lazy(() => import('../features/platform/docs').then((m) => ({ default: m.DocsPage as React.ComponentType })))

export default function App() {
  return (
    <Routes>
      {/* Corporate routes — root level */}
      <Route path="/" element={<Suspense fallback={null}><CorporateShell><HomePage /></CorporateShell></Suspense>} />
      <Route path="/product" element={<Suspense fallback={null}><CorporateShell><ProductPage /></CorporateShell></Suspense>} />
      <Route path="/solutions" element={<Suspense fallback={null}><CorporateShell><SolutionsPage /></CorporateShell></Suspense>} />
      <Route path="/technology" element={<Suspense fallback={null}><CorporateShell><TechnologyPage /></CorporateShell></Suspense>} />
      <Route path="/pricing" element={<Suspense fallback={null}><CorporateShell><PricingPage /></CorporateShell></Suspense>} />
      <Route path="/about" element={<Suspense fallback={null}><CorporateShell><AboutPage /></CorporateShell></Suspense>} />

      {/* Platform routes — under /app */}
      <Route path="/app" element={<Suspense fallback={null}><PlatformShell><DashboardPage /></PlatformShell></Suspense>} />
      <Route path="/app/research" element={<Suspense fallback={null}><PlatformShell><ExplorePage /></PlatformShell></Suspense>} />
      <Route path="/app/research/experiments/:id" element={<Suspense fallback={null}><PlatformShell><DetailPage /></PlatformShell></Suspense>} />
      <Route path="/app/analysis" element={<Suspense fallback={null}><PlatformShell><AnalysisWorkspace /></PlatformShell></Suspense>} />
      <Route path="/app/insights" element={<Suspense fallback={null}><PlatformShell><InsightsPage /></PlatformShell></Suspense>} />
      <Route path="/app/mission" element={<Suspense fallback={null}><PlatformShell><MissionPage /></PlatformShell></Suspense>} />
      <Route path="/app/docs" element={<Suspense fallback={null}><PlatformShell><DocsPage /></PlatformShell></Suspense>} />

      {/* Redirects from old routes */}
      <Route path="/rankings" element={<Navigate to="/app/analysis" replace />} />
      <Route path="/compare" element={<Navigate to="/app/analysis" replace />} />
      <Route path="/app/analysis/rankings" element={<Navigate to="/app/analysis" replace />} />
      <Route path="/app/analysis/compare" element={<Navigate to="/app/analysis" replace />} />
      <Route path="/insights" element={<Navigate to="/app/insights" replace />} />
      <Route path="/experiments/:id" element={<Navigate to="/app/research/experiments/:id" replace />} />

      {/* 404 fallback */}
      <Route path="*" element={<Suspense fallback={null}><CorporateShell><HomePage /></CorporateShell></Suspense>} />
    </Routes>
  )
}
