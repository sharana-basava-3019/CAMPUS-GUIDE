import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

/**
 * Reactive auth guard — re-renders instantly when login state changes.
 * If not logged in, renders a glass "Login Required" prompt.
 * If logged in, renders `children` (the 3D map).
 */
export default function AuthGuard({ children }) {
  const { user } = useAuth()
  const isGuest = Boolean(user?.isGuest) || String(user?.role || '').toLowerCase() === 'guest'

  if (!user?.token && !isGuest) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#081B2C]/70 p-5 text-center backdrop-blur-sm sm:min-h-[460px] sm:p-8"
      >
        {/* Lock icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-accentCyan/30 bg-accentCyan/10">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h3 className="font-display text-2xl text-textPrimary mb-2">Login Required</h3>
        <p className="text-sm text-textAccent max-w-xs mb-8">
          The 3D campus map is available to signed-in users. Please sign in to continue.
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/login"
            className="w-full rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] px-6 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:from-[#fbbf24] hover:to-[#f59e0b] sm:w-auto"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="w-full rounded-xl border border-accentCyan/30 px-6 py-2.5 text-sm font-semibold text-accentCyan transition-all duration-300 hover:bg-accentCyan/10 sm:w-auto"
          >
            Create Account
          </Link>
        </div>
      </motion.div>
    )
  }

  return children
}
