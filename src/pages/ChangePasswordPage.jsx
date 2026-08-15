import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Navbar } from '../components/sections/Navbar'
import { Footer } from '../components/sections/Footer'
import { PrimaryButton } from '../components/ui/Buttons'
import { useToast } from '../components/ui/ToastSystem'
import { useAuth } from '../hooks/useAuth'

const API_BASE_URL = 'http://localhost:5000/api'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const { user } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!user?.token) {
      navigate('/login')
    }
  }, [navigate, user?.token])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user?.token) {
      navigate('/login')
      return
    }

    if (newPassword !== confirmPassword) {
      pushToast({ type: 'error', title: 'Validation error', message: 'New password and confirm password do not match.' })
      return
    }

    setSaving(true)
    try {
      await axios.put(
        `${API_BASE_URL}/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      )

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      pushToast({ type: 'success', title: 'Password changed', message: 'Your password was updated successfully.' })
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Update failed',
        message: error.response?.data?.message || 'Could not update password.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user?.token) return null

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-xl rounded-3xl border border-textAccent/15 bg-bgSecondary/45 p-6 shadow-soft backdrop-blur-sm sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-textPrimary">Change Password</p>
          <p className="mt-2 text-sm text-textAccent">Use a strong password and keep it secure.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="currentPassword" className="mb-1 block text-xs uppercase tracking-[0.1em] text-textAccent">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 text-sm text-textPrimary outline-none transition focus:border-blue-500/50"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="mb-1 block text-xs uppercase tracking-[0.1em] text-textAccent">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 text-sm text-textPrimary outline-none transition focus:border-blue-500/50"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-xs uppercase tracking-[0.1em] text-textAccent">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 text-sm text-textPrimary outline-none transition focus:border-blue-500/50"
                required
              />
            </div>

            <PrimaryButton type="submit" className="mt-2 w-full py-3" disabled={saving}>
              {saving ? 'Updating...' : 'Update Password'}
            </PrimaryButton>
          </form>
        </motion.section>
      </main>

      <Footer />
    </div>
  )
}
