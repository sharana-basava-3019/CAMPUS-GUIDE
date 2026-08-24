import { useState, useEffect, useCallback } from 'react'

const SESSION_KEY = 'userInfo'
const CHANNEL_NAME = 'campus_guide_auth'

// BroadcastChannel syncs login/logout across same-origin tabs in the same session.
// Falls back gracefully (SSR / old browsers that lack BroadcastChannel).
let channel = null
try {
  channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null
} catch {
  channel = null
}

function readUser() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

/**
 * Reactive auth hook — reads/writes sessionStorage and re-renders on change.
 * sessionStorage is cleared when the browser tab/window is closed, so a
 * "fresh session" always requires the user to log in again.
 * BroadcastChannel propagates login/logout to other same-session tabs instantly.
 */
export function useAuth() {
  const [user, setUserState] = useState(readUser)

  // Listen for auth changes broadcast from other tabs in this session.
  useEffect(() => {
    if (!channel) return
    const onMessage = (event) => {
      if (event.data?.type === 'auth_change') {
        setUserState(readUser())
      }
    }
    channel.addEventListener('message', onMessage)
    return () => channel.removeEventListener('message', onMessage)
  }, [])

  /** Notify all other same-session tabs that auth state changed. */
  const broadcast = () => {
    try {
      channel?.postMessage({ type: 'auth_change' })
    } catch {
      // channel may be closed; ignore
    }
  }

  const login = useCallback((userData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUserState(userData)
    broadcast()
  }, [])

  const continueAsGuest = useCallback(() => {
    const guestUser = {
      role: 'guest',
      name: 'Guest User',
      isGuest: true,
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(guestUser))
    setUserState(guestUser)
    broadcast()
    return guestUser
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem('guestNotifications')
    sessionStorage.removeItem('guestKnownBuildingIds')
    setUserState(null)
    broadcast()
  }, [])

  const exitGuestMode = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem('guestNotifications')
    sessionStorage.removeItem('guestKnownBuildingIds')
    setUserState(null)
    broadcast()
  }, [])

  const updateUser = useCallback((userData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUserState(userData)
    broadcast()
  }, [])

  return { user, login, logout, updateUser, continueAsGuest, exitGuestMode }
}
