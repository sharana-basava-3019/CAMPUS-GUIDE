import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import EditProfilePage from './pages/EditProfilePage'
import LoginPage from './pages/LoginPage'
import PrivacyPage from './pages/PrivacyPage'
import SignupPage from './pages/SignupPage'
import TermsPage from './pages/TermsPage'
import GuestRestrictedPage from './pages/GuestRestrictedPage'
import { ToastProvider } from './components/ui/ToastSystem'
import { RequireAuth, RedirectIfAuthed } from './components/ui/RouteGuards'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public routes — accessible without login */}
          <Route path="/"        element={<App />} />
          <Route path="/about"   element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms"   element={<TermsPage />} />

          {/* Auth routes — redirect away if already logged in */}
          <Route path="/login"  element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
          <Route path="/signup" element={<RedirectIfAuthed><SignupPage /></RedirectIfAuthed>} />

          {/* Protected routes — require a valid JWT token */}
          <Route path="/admin"           element={<RequireAuth><AdminPage /></RequireAuth>} />
          <Route path="/change-password" element={<RequireAuth><ChangePasswordPage /></RequireAuth>} />
          <Route path="/edit-profile"    element={<RequireAuth><EditProfilePage /></RequireAuth>} />

          {/* Guest-mode restricted notice — accessible to guests; non-guests redirected in-component */}
          <Route path="/resources" element={<GuestRestrictedPage />} />
          <Route path="/download"  element={<GuestRestrictedPage />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
