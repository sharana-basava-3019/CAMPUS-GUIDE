import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './components/ui/ToastSystem'
import { RequireAuth, RedirectIfAuthed } from './components/ui/RouteGuards'
import './index.css'

// Lazy-load all pages — each gets its own JS chunk, none parsed at startup
const AboutPage          = lazy(() => import('./pages/AboutPage'))
const AdminPage          = lazy(() => import('./pages/AdminPage'))
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'))
const EditProfilePage    = lazy(() => import('./pages/EditProfilePage'))
const LoginPage          = lazy(() => import('./pages/LoginPage'))
const PrivacyPage        = lazy(() => import('./pages/PrivacyPage'))
const SignupPage         = lazy(() => import('./pages/SignupPage'))
const TermsPage          = lazy(() => import('./pages/TermsPage'))
const GuestRestrictedPage = lazy(() => import('./pages/GuestRestrictedPage'))

// Minimal spinner shown while a lazy chunk loads
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0f172a',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(34,211,238,0.18)',
        borderTopColor: '#22d3ee',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/"        element={<App />} />
            <Route path="/about"   element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms"   element={<TermsPage />} />

            {/* Auth routes */}
            <Route path="/login"  element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
            <Route path="/signup" element={<RedirectIfAuthed><SignupPage /></RedirectIfAuthed>} />

            {/* Protected routes */}
            <Route path="/admin"           element={<RequireAuth><AdminPage /></RequireAuth>} />
            <Route path="/change-password" element={<RequireAuth><ChangePasswordPage /></RequireAuth>} />
            <Route path="/edit-profile"    element={<RequireAuth><EditProfilePage /></RequireAuth>} />

            {/* Guest-mode restricted */}
            <Route path="/resources" element={<GuestRestrictedPage />} />
            <Route path="/download"  element={<GuestRestrictedPage />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
