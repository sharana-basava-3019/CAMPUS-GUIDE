import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/sections/Navbar'
import { Footer } from '../components/sections/Footer'
import { useAuth } from '../hooks/useAuth'

export default function GuestRestrictedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isGuest = Boolean(user?.isGuest) || String(user?.role || '').toLowerCase() === 'guest'

  useEffect(() => {
    if (!isGuest) {
      navigate('/')
    }
  }, [isGuest, navigate])

  if (!isGuest) return null

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />

      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 pt-24 sm:px-6 lg:px-8">
        <section className="w-full rounded-2xl border border-amber-300/25 bg-amber-400/10 p-6 text-center shadow-soft backdrop-blur-md sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-200">Restricted Feature</p>
          <h1 className="mt-3 text-2xl font-semibold text-textPrimary sm:text-3xl">Login required to access this feature</h1>
          <p className="mt-3 text-sm text-textAccent sm:text-base">
            Guest mode supports map access only. Sign in as Student, Professor, or Admin for full features.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-textAccent"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
