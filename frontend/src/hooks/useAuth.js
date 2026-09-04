import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SESSION_KEY = 'userInfo'
const CHANNEL_NAME = 'campus_guide_auth'
const AUTH_EVENT_KEY = 'campus_guide_auth_event'

const AuthContext = createContext(null)

// BroadcastChannel syncs login/logout across same-origin tabs
let channel = null
try {
  channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null
} catch {
  channel = null
}

function readUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)

  const syncUser = useCallback(() => {
    setUser(readUser())
  }, [])

  useEffect(() => {
    // 1. Listen for BroadcastChannel messages (from OTHER tabs)
    const onMessage = (event) => {
      if (event.data?.type === 'auth_change') {
        syncUser()
      }
    }
    if (channel) {
      channel.addEventListener('message', onMessage)
    }

    // 2. Listen for same-window auth events
    const onWindowAuth = () => syncUser()
    window.addEventListener(AUTH_EVENT_KEY, onWindowAuth)

    return () => {
      if (channel) {
        channel.removeEventListener('message', onMessage)
      }
      window.removeEventListener(AUTH_EVENT_KEY, onWindowAuth)
    }
  }, [syncUser])

  const notifyChange = () => {
    try {
      channel?.postMessage({ type: 'auth_change' })
    } catch {
      // channel may be closed; ignore
    }
    window.dispatchEvent(new Event(AUTH_EVENT_KEY))
  }

  const login = useCallback((userData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)
    notifyChange()
  }, [])

  const continueAsGuest = useCallback(() => {
    const guestUser = {
      role: 'guest',
      name: 'Guest User',
      isGuest: true,
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(guestUser))
    setUser(guestUser)
    notifyChange()
    return guestUser
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem('guestNotifications')
    sessionStorage.removeItem('guestKnownBuildingIds')
    setUser(null)
    notifyChange()
  }, [])

  const exitGuestMode = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem('guestNotifications')
    sessionStorage.removeItem('guestKnownBuildingIds')
    setUser(null)
    notifyChange()
  }, [])

  const updateUser = useCallback((userData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)
    notifyChange()
  }, [])

  const value = {
    user,
    login,
    logout,
    updateUser,
    continueAsGuest,
    exitGuestMode,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    // Fallback if component is somehow rendered outside AuthProvider
    return {
      user: readUser(),
      login: (userData) => {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
        window.dispatchEvent(new Event(AUTH_EVENT_KEY))
      },
      logout: () => {
        sessionStorage.removeItem(SESSION_KEY)
        window.dispatchEvent(new Event(AUTH_EVENT_KEY))
      },
      updateUser: (userData) => {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
        window.dispatchEvent(new Event(AUTH_EVENT_KEY))
      },
      continueAsGuest: () => {
        const guestUser = { role: 'guest', name: 'Guest User', isGuest: true }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(guestUser))
        window.dispatchEvent(new Event(AUTH_EVENT_KEY))
        return guestUser
      },
      exitGuestMode: () => {
        sessionStorage.removeItem(SESSION_KEY)
        window.dispatchEvent(new Event(AUTH_EVENT_KEY))
      },
    }
  }
  return context
}
