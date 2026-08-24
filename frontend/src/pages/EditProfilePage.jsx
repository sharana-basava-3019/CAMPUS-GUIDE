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

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const { user, updateUser } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!user?.token) {
      navigate('/login', { replace: true })
    }
  }, [navigate, user?.token])

  useEffect(() => {
    setName(user?.name || '')
    setEmail(user?.email || '')
  }, [user?.name, user?.email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.token) {
      navigate('/login', { replace: true })
      return
    }

    setSaving(true)
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/auth/profile`,
        { name, email },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      )

      updateUser(data)
      pushToast({ type: 'success', title: 'Profile updated', message: 'Your account details were updated successfully.' })
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Update failed',
        message: error.response?.data?.message || 'Could not update profile.',
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
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-textPrimary">Edit Profile</p>
          <p className="mt-2 text-sm text-textAccent">Update your account information.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-xs uppercase tracking-[0.1em] text-textAccent">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 text-sm text-textPrimary outline-none transition focus:border-blue-500/50"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-xs uppercase tracking-[0.1em] text-textAccent">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-bgPrimary/40 px-3 text-sm text-textPrimary outline-none transition focus:border-blue-500/50"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-textAccent">Role</label>
              <input
                type="text"
                value={(user.role || 'guest').charAt(0).toUpperCase() + (user.role || 'guest').slice(1)}
                readOnly
                className="h-11 w-full rounded-xl border border-white/10 bg-bgPrimary/30 px-3 text-sm text-textAccent"
              />
            </div>

            <PrimaryButton type="submit" className="mt-2 w-full py-3" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </PrimaryButton>
          </form>
        </motion.section>
      </main>

      <Footer />
    </div>
  )
}
