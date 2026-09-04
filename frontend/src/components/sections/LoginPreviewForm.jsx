import { motion } from 'framer-motion'
import { useState } from 'react'
import { PrimaryButton } from '../ui/Buttons'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../ui/ToastSystem'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'

const formTabs = ['Login', 'Register']

export const LoginPreviewForm = () => {
  const [activeTab, setActiveTab] = useState('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [adminSecretKey, setAdminSecretKey] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { pushToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      pushToast({ type: 'info', title: 'Missing fields', message: 'Please fill in all required fields.' })
      return
    }

    setLoading(true)
    try {
      if (activeTab === 'Login') {
        const payload = { email, password, role }
        if (role === 'admin') payload.adminSecretKey = adminSecretKey

        const { data } = await axios.post(`${API_BASE_URL}/auth/login`, payload)
        login(data.user ? { ...data.user, token: data.token } : data)
        pushToast({
          type: 'success',
          title: 'Login Successful',
          message: `Welcome back, ${data.user?.email || data.email || email}!`,
        })
      } else {
        const { data } = await axios.post(`${API_BASE_URL}/auth/register`, { email, password, role })
        login(data.user ? { ...data.user, token: data.token } : data)
        pushToast({
          type: 'success',
          title: 'Account Created',
          message: 'Your CAMPUS GUIDE account is ready.',
        })
      }
    } catch (error) {
      pushToast({
        type: 'error',
        title: `${activeTab} Failed`,
        message: error.response?.data?.message || 'Something went wrong.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#3C5A73]/30 p-6 shadow-soft backdrop-blur-md sm:p-8">
      <div className="relative mb-5 flex rounded-full border border-white/10 bg-black/20 p-1">
        <motion.div
          layout
          className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706]"
          style={{ left: activeTab === 'Login' ? 4 : '50%' }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
        {formTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab)
              if (tab === 'Register' && role === 'admin') setRole('student')
            }}
            className={`z-10 w-1/2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab ? 'text-slate-950 font-semibold' : 'text-textAccent hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            required
            className="peer h-12 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 pt-4 text-sm text-textPrimary outline-none transition focus:border-accentCyan/55 focus:shadow-soft"
          />
          <label
            htmlFor="email"
            className="pointer-events-none absolute left-3 top-3 text-xs text-textAccent transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs"
          >
            Academic Email
          </label>
        </div>

        <div className="relative">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=" "
            required
            className="peer h-12 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 pt-4 text-sm text-textPrimary outline-none transition focus:border-accentCyan/55 focus:shadow-soft"
          />
          <label
            htmlFor="password"
            className="pointer-events-none absolute left-3 top-3 text-xs text-textAccent transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs"
          >
            Password
          </label>
        </div>

        <div className="relative">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-12 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 text-sm capitalize text-textPrimary outline-none transition focus:border-accentCyan/55"
          >
            <option value="student" className="bg-[#0c1427] text-white">Student</option>
            <option value="professor" className="bg-[#0c1427] text-white">Professor</option>
            {activeTab === 'Login' ? <option value="admin" className="bg-[#0c1427] text-white">Admin</option> : null}
          </select>
        </div>

        {activeTab === 'Login' && role === 'admin' ? (
          <div className="relative">
            <input
              id="adminSecretKey"
              type="password"
              value={adminSecretKey}
              onChange={(e) => setAdminSecretKey(e.target.value)}
              placeholder=" "
              required
              className="peer h-12 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 pt-4 text-sm text-textPrimary outline-none transition focus:border-accentCyan/55"
            />
            <label
              htmlFor="adminSecretKey"
              className="pointer-events-none absolute left-3 top-3 text-xs text-textAccent transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs"
            >
              Admin Secret Key
            </label>
          </div>
        ) : null}

        <PrimaryButton type="submit" disabled={loading} className="w-full py-3">
          {loading
            ? activeTab === 'Login' ? 'Signing In...' : 'Creating Account...'
            : activeTab === 'Login' ? 'Sign In' : 'Create Account'}
        </PrimaryButton>
      </form>
    </div>
  )
}
