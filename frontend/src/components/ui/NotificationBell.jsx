import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from './ToastSystem'
import { NotificationItem } from './NotificationItem'
import { API_BASE_URL as API_BASE } from '../../config/api'

function formatRelativeTime(dateValue) {
  const timestamp = new Date(dateValue).getTime()
  if (Number.isNaN(timestamp)) return 'Now'

  const diffMs = Date.now() - timestamp
  const mins = Math.floor(diffMs / (60 * 1000))
  if (mins < 1) return 'Now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  return 'Today'
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const wrapperRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pushToast } = useToast()

  const authConfig = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  }), [user?.token])

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications])

  const fetchNotifications = useCallback(async () => {
    if (!user?.token) {
      setNotifications([])
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.get(`${API_BASE}/notifications`, authConfig)
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Notifications unavailable',
        message: error.response?.data?.message || 'Could not load notifications.',
      })
    } finally {
      setLoading(false)
    }
  }, [authConfig, pushToast, user?.token])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  const goToHomeSection = useCallback((sectionId) => {
    navigate('/')
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }, [navigate])

  const handleMarkAsRead = useCallback(async (notification) => {
    if (!notification) return

    if (!user?.token) return

    if (!notification.isRead) {
      setNotifications((prev) => prev.map((item) => (
        item._id === notification._id ? { ...item, isRead: true } : item
      )))

      try {
        await axios.patch(`${API_BASE}/notifications/${notification._id}/read`, {}, authConfig)
      } catch (error) {
        setNotifications((prev) => prev.map((item) => (
          item._id === notification._id ? { ...item, isRead: false } : item
        )))
        pushToast({
          type: 'error',
          title: 'Update failed',
          message: error.response?.data?.message || 'Could not mark notification as read.',
        })
      }
    }

    setOpen(false)

    if (notification.type === 'resource') {
      goToHomeSection('test-demo')
      return
    }

    if (notification.type === 'building') {
      goToHomeSection('test-demo')
      return
    }

    if (notification.type === 'warning') {
      pushToast({ type: 'warning', title: 'Account notice', message: notification.message })
    }
  }, [authConfig, goToHomeSection, pushToast, user?.token])

  const handleMarkAllAsRead = useCallback(async () => {
    if (!user?.token || notifications.length === 0) return

    const prev = notifications
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })))

    try {
      await axios.patch(`${API_BASE}/notifications/read-all`, {}, authConfig)
    } catch (error) {
      setNotifications(prev)
      pushToast({
        type: 'error',
        title: 'Update failed',
        message: error.response?.data?.message || 'Could not mark all notifications as read.',
      })
    }
  }, [authConfig, notifications, pushToast, user?.token])

  const renderedNotifications = useMemo(() => {
    return notifications.map((notification) => (
      <NotificationItem
        key={notification._id}
        message={notification.message}
        time={formatRelativeTime(notification.createdAt)}
        type={notification.type}
        unread={!notification.isRead}
        onClick={() => handleMarkAsRead(notification)}
      />
    ))
  }, [notifications, handleMarkAsRead])

  return (
    <div ref={wrapperRef} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Toggle notifications"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accentCyan/25 bg-bgPrimary/25 text-textAccent transition-all duration-200 hover:border-accentCyan/45 hover:bg-accentCyan/10 hover:text-accentCyan"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 10a5 5 0 1 1 10 0v4.4l1.5 2.3H5.5L7 14.4V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>

        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-red-300/35 bg-red-500 text-[10px] font-semibold text-white shadow-[0_0_12px_rgba(239,68,68,0.35)]">
            {unreadCount}
          </span>
        ) : null}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed left-1/2 top-20 z-[90] w-[92vw] max-w-[320px] -translate-x-1/2 rounded-xl border border-white/12 bg-[rgba(17,24,39,0.9)] p-3 shadow-[0_16px_34px_rgba(0,0,0,0.45)] backdrop-blur-lg sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[300px] sm:translate-x-0"
          >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-accentCyan transition-colors duration-200 hover:text-cyan-300"
            >
              Mark all as read
            </button>
          </div>

          <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto scroll-smooth pr-1 custom-scrollbar">
            {!user?.token ? (
              <p className="rounded-xl border border-white/10 bg-bgPrimary/35 px-3 py-3 text-sm text-textAccent">Sign in to view notifications.</p>
            ) : loading ? (
              <p className="rounded-xl border border-white/10 bg-bgPrimary/35 px-3 py-3 text-sm text-textAccent">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-bgPrimary/35 px-3 py-3 text-sm text-textAccent">No notifications yet.</p>
            ) : renderedNotifications}
          </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
