import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Navbar } from '../components/sections/Navbar'
import { Footer } from '../components/sections/Footer'
import { PrimaryButton } from '../components/ui/Buttons'
import { useToast } from '../components/ui/ToastSystem'
import { useAuth } from '../hooks/useAuth'
import axios from 'axios'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const { pushToast } = useToast()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', { email, password, role })
      login(data)  // updates sessionStorage + triggers Navbar re-render
      pushToast({
        type: 'success',
        title: 'Account Created',
        message: 'Your CAMPUS GUIDE account is ready.',
      })
      const params = new URLSearchParams(location.search)
      const from = params.get('from')
      const safePath =
        from && from.startsWith('/') && !from.startsWith('//')
          ? from
          : '/'
      navigate(safePath, { replace: true })
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Signup Failed',
        message: error.response?.data?.message || 'Something went wrong.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#081B2C]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-bgSecondary/60 p-8 shadow-soft backdrop-blur-lg sm:p-10"
        >
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold text-textPrimary">Get Started</h1>
            <p className="mt-2 text-sm text-textAccent">Create your account to access the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer h-12 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 pt-4 text-sm text-textPrimary outline-none transition focus:border-blue-500/50"
                required
              />
              <label className="pointer-events-none absolute left-3 top-3 text-xs text-textAccent transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs">
                Email address
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer h-12 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 pt-4 text-sm text-textPrimary outline-none transition focus:border-blue-500/50"
                required
              />
              <label className="pointer-events-none absolute left-3 top-3 text-xs text-textAccent transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs">
                Password
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 text-sm capitalize text-textPrimary outline-none transition focus:border-blue-500/50"
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                </select>
              </div>
            </div>

            <PrimaryButton type="submit" className="w-full py-4" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </PrimaryButton>
          </form>

          <div className="mt-6 text-center text-sm text-textAccent">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-textPrimary transition-colors hover:text-blue-400">
              Login
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
