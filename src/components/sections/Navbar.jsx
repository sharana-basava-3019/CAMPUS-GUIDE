import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { NotificationBell } from '../ui/NotificationBell'
import { useToast } from '../ui/ToastSystem'

const API_BASE = 'http://localhost:5000/api'

const Logo = () => (
  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-accentCyan/35 bg-accentCyan/10 p-1 shadow-cyanGlow">
    <img
      src="/logo.png"
      alt="Campus Guide Logo"
      className="h-full w-full object-contain filter drop-shadow-[0_0_10px_rgba(34,211,238,0.38)] transition-transform duration-300 group-hover:scale-110"
    />
  </div>
)

export const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, updateUser, continueAsGuest, exitGuestMode } = useAuth()
  const { pushToast } = useToast()
  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [updateEmailOpen, setUpdateEmailOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailUpdating, setEmailUpdating] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    setOpen(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleHomeClick = (event) => {
    if (location.pathname !== '/') return
    event.preventDefault()
    const hero = document.getElementById('hero')
    if (hero) { hero.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLocate = () => {
    setMobileMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      window.setTimeout(() => scrollToSection('test-demo'), 120)
      return
    }
    scrollToSection('test-demo')
  }

  const handleLogout = () => {
    setOpen(false)
    setMobileMenuOpen(false)
    logout()
    navigate('/login')
  }

  const handleContinueAsGuest = () => {
    continueAsGuest()
    setMobileMenuOpen(false)

    if (location.pathname !== '/') {
      navigate('/')
      return
    }

    window.setTimeout(() => {
      document.getElementById('test-demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  const handleExitGuestMode = () => {
    setOpen(false)
    exitGuestMode()
    navigate('/')
  }

  const goToAccountPage = (path) => {
    setOpen(false)
    navigate(path)
  }

  const openUpdateEmailModal = () => {
    setOpen(false)
    setNewEmail(user?.email || '')
    setEmailPassword('')
    setUpdateEmailOpen(true)
  }

  const closeUpdateEmailModal = () => {
    setUpdateEmailOpen(false)
    setNewEmail('')
    setEmailPassword('')
  }

  const handleUpdateEmail = async (event) => {
    event.preventDefault()

    const nextEmail = String(newEmail || '').trim().toLowerCase()
    const password = String(emailPassword || '').trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!nextEmail || !password) {
      pushToast({ type: 'error', title: 'Validation error', message: 'New email and password are required.' })
      return
    }

    if (!emailPattern.test(nextEmail)) {
      pushToast({ type: 'error', title: 'Validation error', message: 'Please enter a valid email address.' })
      return
    }

    if (nextEmail === String(user?.email || '').trim().toLowerCase()) {
      pushToast({ type: 'error', title: 'Validation error', message: 'New email must be different from current email.' })
      return
    }

    setEmailUpdating(true)
    try {
      const response = await fetch(`${API_BASE}/auth/user/update-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ newEmail: nextEmail, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Could not update email.')
      }

      updateUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      })

      pushToast({
        type: 'success',
        title: 'Email updated',
        message: data?.message || 'Email updated successfully',
      })

      closeUpdateEmailModal()
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Update failed',
        message: error.message || 'Could not update email.',
      })
    } finally {
      setEmailUpdating(false)
    }
  }

  const formatRole = (role) => {
    const value = String(role || 'guest').toLowerCase()
    if (value === 'student') return 'Student'
    if (value === 'admin') return 'Admin'
    if (value === 'professor' || value === 'faculty' || value === 'admin') return 'Professor'
    return 'Guest'
  }

  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'
  const isGuest = Boolean(user?.isGuest) || String(user?.role || '').toLowerCase() === 'guest'
  const userInitials = String(user?.name || user?.email || 'U')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex w-full max-w-full items-center justify-between rounded-2xl border border-accentCyan/15 bg-bgSecondary/70 px-3 py-3 shadow-soft backdrop-blur-lg sm:px-4"
      >
        {/* Left: Logo + nav links */}
        <div className="flex min-w-0 items-center gap-4 sm:gap-7">
          <Link
            to="/"
            onClick={handleHomeClick}
            className="group flex min-w-0 items-center gap-3 font-display text-base font-bold tracking-tight text-textPrimary sm:text-xl"
          >
            <Logo />
            <span className="truncate bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">CAMPUS GUIDE</span>
          </Link>

          <ul className="hidden items-center gap-7 md:flex">
            <li>
              <Link to="/" onClick={handleHomeClick} className="text-sm text-textAccent transition-colors duration-300 hover:text-accentCyan">
                HOME
              </Link>
            </li>
            <li>
              <button type="button" onClick={handleLocate} className="text-sm text-textAccent transition-colors duration-300 hover:text-accentCyan">
                LOCATE
              </button>
            </li>
            <li>
              <Link to="/about" className="text-sm text-textAccent transition-colors duration-300 hover:text-accentCyan">
                ABOUT
              </Link>
            </li>
            {isAdmin ? (
              <li>
                <Link to="/admin" className="text-sm text-textAccent transition-colors duration-300 hover:text-accentCyan">
                  ADMIN
                </Link>
              </li>
            ) : null}
          </ul>
        </div>

        {/* Right: Auth controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isGuest ? <NotificationBell /> : null}

          <AnimatePresence mode="wait">
            {user ? (
              <motion.div
                key="logged-in"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="relative flex items-center gap-3"
                ref={profileMenuRef}
              >
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-2 rounded-full border border-accentCyan/25 bg-bgPrimary/20 px-3 py-1.5 text-sm font-semibold tracking-wide text-textAccent transition-all duration-300 hover:border-accentCyan/50 hover:bg-accentCyan/10 hover:text-accentCyan"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-accentCyan/25 bg-accentCyan/15 text-xs font-bold text-accentCyan">
                  {userInitials || 'U'}
                </span>
                <span className="hidden max-w-[120px] truncate sm:inline">{user?.name || 'Profile'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <AnimatePresence>
                {open ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-xl border border-accentCyan/20 bg-[rgba(17,24,39,0.95)] p-3 shadow-[0_16px_34px_rgba(0,0,0,0.45)] backdrop-blur-lg"
                  >
                    <div className="rounded-xl border border-white/10 bg-bgPrimary/30 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-textPrimary">{user?.name || 'Campus User'}</p>
                      <p className="mt-1 truncate text-xs text-textAccent">{isGuest ? 'Temporary session' : (user?.email || 'Unknown user')}</p>
                      <span className="mt-2 inline-flex rounded-full border border-accentCyan/25 bg-accentCyan/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accentCyan">
                        {formatRole(user?.role)}
                      </span>
                    </div>

                    {isGuest ? (
                      <div className="mt-2 space-y-1">
                        <p className="rounded-lg px-3 py-2 text-left text-sm text-textAccent">Signed in as Guest</p>
                        <button
                          type="button"
                          onClick={handleExitGuestMode}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        >
                          Exit Guest Mode
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mt-2 space-y-1">
                          <button
                            type="button"
                            onClick={() => goToAccountPage('/edit-profile')}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-textAccent transition-colors duration-300 hover:bg-accentCyan/10 hover:text-accentCyan"
                          >
                            Profile
                          </button>
                          <button
                            type="button"
                            onClick={openUpdateEmailModal}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-textAccent transition-colors duration-300 hover:bg-accentCyan/10 hover:text-accentCyan"
                          >
                            Update Email
                          </button>
                          <button
                            type="button"
                            onClick={() => goToAccountPage('/change-password')}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-textAccent transition-colors duration-300 hover:bg-accentCyan/10 hover:text-accentCyan"
                          >
                            Security
                          </button>
                        </div>

                        <div className="my-2 h-px bg-white/10" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        >
                          Logout
                        </button>
                      </>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="logged-out"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2"
              >
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] px-4 py-2 text-sm font-semibold tracking-wide text-slate-950 shadow-glow transition-all duration-300 hover:from-[#fbbf24] hover:to-[#f59e0b] hover:shadow-soft hover:scale-103 active:scale-97"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex items-center justify-center rounded-full border border-accentCyan/30 px-4 py-2 text-sm font-semibold tracking-wide text-accentCyan transition-all duration-300 hover:border-accentCyan/60 hover:bg-accentCyan/10"
              >
                Sign Up
              </Link>
              {location.pathname === '/' ? (
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="hidden md:inline-flex items-center justify-center rounded-full border border-emerald-300/30 px-4 py-2 text-sm font-semibold tracking-wide text-emerald-300 transition-all duration-300 hover:border-emerald-300/60 hover:bg-emerald-400/10"
                >
                  Continue as Guest
                </button>
              ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accentCyan/25 text-accentCyan transition-colors duration-300 hover:bg-accentCyan/10 md:hidden"
        >
          {mobileMenuOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-2 rounded-2xl border border-accentCyan/20 bg-bgSecondary/90 p-3 shadow-soft backdrop-blur-lg md:hidden"
          >
            <div className="grid grid-cols-1 gap-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-textAccent transition-colors duration-300 hover:bg-accentCyan/10 hover:text-accentCyan">
                HOME
              </Link>
              <button type="button" onClick={handleLocate} className="rounded-lg px-3 py-2 text-left text-sm text-textAccent transition-colors duration-300 hover:bg-accentCyan/10 hover:text-accentCyan">
                LOCATE
              </button>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-textAccent transition-colors duration-300 hover:bg-accentCyan/10 hover:text-accentCyan">
                ABOUT
              </Link>
              {isAdmin ? (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-textAccent transition-colors duration-300 hover:bg-accentCyan/10 hover:text-accentCyan">
                  ADMIN
                </Link>
              ) : null}

              {!user ? (
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] px-3 py-2 text-sm font-semibold text-slate-950"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg border border-accentCyan/30 px-3 py-2 text-sm font-semibold text-accentCyan"
                  >
                    Sign Up
                  </Link>
                  {location.pathname === '/' ? (
                    <button
                      type="button"
                      onClick={handleContinueAsGuest}
                      className="inline-flex items-center justify-center rounded-lg border border-emerald-300/30 px-3 py-2 text-sm font-semibold text-emerald-300"
                    >
                      Continue as Guest
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {updateEmailOpen && !isGuest ? (
          <motion.div
            className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUpdateEmailModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-lg rounded-xl border border-white/12 bg-[rgba(17,24,39,0.95)] p-4 shadow-[0_20px_44px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-5"
            >
              <div className="mb-4">
                <h3 className="text-base font-semibold text-textPrimary">Update Email</h3>
                <p className="mt-1 text-sm text-textAccent">Verify your password to securely update your email address.</p>
              </div>

              <form onSubmit={handleUpdateEmail} className="space-y-3">
                <div>
                  <label htmlFor="currentEmail" className="mb-1 block text-xs uppercase tracking-[0.1em] text-textAccent">Current Email</label>
                  <input
                    id="currentEmail"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="h-11 w-full rounded-xl border border-white/10 bg-bgPrimary/30 px-3 text-sm text-textAccent"
                  />
                </div>

                <div>
                  <label htmlFor="newEmail" className="mb-1 block text-xs uppercase tracking-[0.1em] text-textAccent">New Email</label>
                  <input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 text-sm text-textPrimary outline-none transition-colors duration-200 focus:border-accentCyan/50"
                    placeholder="Enter new email address"
                  />
                </div>

                <div>
                  <label htmlFor="emailPassword" className="mb-1 block text-xs uppercase tracking-[0.1em] text-textAccent">Password</label>
                  <input
                    id="emailPassword"
                    type="password"
                    value={emailPassword}
                    onChange={(event) => setEmailPassword(event.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 text-sm text-textPrimary outline-none transition-colors duration-200 focus:border-accentCyan/50"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeUpdateEmailModal}
                    className="inline-flex items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-textAccent transition-colors duration-200 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailUpdating}
                    className="inline-flex items-center justify-center rounded-lg bg-accentCyan/20 px-4 py-2 text-sm font-semibold text-accentCyan transition-colors duration-200 hover:bg-accentCyan/30 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {emailUpdating ? 'Updating...' : 'Update Email'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
