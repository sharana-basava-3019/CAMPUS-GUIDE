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
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/"       element={<App />} />
          <Route path="/admin"  element={<AdminPage />} />
          <Route path="/about"  element={<AboutPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/terms"  element={<TermsPage />} />
          <Route path="/resources" element={<GuestRestrictedPage />} />
          <Route path="/download" element={<GuestRestrictedPage />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
