import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { Sidebar }        from './components/layout/Sidebar'
import { Header }         from './components/layout/Header'
import { BottomNav }      from './components/layout/BottomNav'
import { PageTransition } from './components/layout/PageTransition'
import { PageSkeleton }   from './components/ui/Skeleton'

import Landing      from './pages/Landing'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Onboarding   from './pages/Onboarding'
import Dashboard    from './pages/Dashboard'
import Agenda       from './pages/Agenda'
import Services     from './pages/Services'
import Availability from './pages/Availability'
import Settings     from './pages/Settings'
import BookingPage  from './pages/BookingPage'
import BookingConfirm from './pages/BookingConfirm'
import NotFound     from './pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } },
})

function ProtectedRoute() {
  const { isAuthenticated, loading, hasProfile } = useAuth()
  if (loading) return (
    <div style={{ padding: 32 }}><PageSkeleton /></div>
  )
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasProfile)      return <Navigate to="/onboarding" replace />
  return <Outlet />
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <Header />
      <main className="app-main"><Outlet /></main>
      <BottomNav />
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Públicas */}
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/cadastro"   element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        {/* Booking público */}
        <Route path="/book/:slug"              element={<BookingPage />} />
        <Route path="/book/:slug/confirmacao"  element={<BookingConfirm />} />
        {/* App protegido */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/app"                  element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/app/agenda"           element={<PageTransition><Agenda /></PageTransition>} />
            <Route path="/app/servicos"         element={<PageTransition><Services /></PageTransition>} />
            <Route path="/app/disponibilidade"  element={<PageTransition><Availability /></PageTransition>} />
            <Route path="/app/configuracoes"    element={<PageTransition><Settings /></PageTransition>} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}