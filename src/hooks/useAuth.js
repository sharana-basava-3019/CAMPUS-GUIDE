import { useState, useEffect, useCallback } from 'react'

/**
 * Reactive auth hook — reads/writes localStorage and re-renders on change.
 * Use this in ANY component that needs to know login state.
 */
export function useAuth() {
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem('userInfo')) } catch { return null }
  }

  const [user, setUserState] = useState(getUser)

  // Keep in sync if another tab logs in/out
  useEffect(() => {
    const onStorage = () => setUserState(getUser())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback((userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData))
    setUserState(userData)
  }, [])

  const continueAsGuest = useCallback(() => {
    const guestUser = {
      role: 'guest',
      name: 'Guest User',
      isGuest: true,
    }
    localStorage.setItem('userInfo', JSON.stringify(guestUser))
    setUserState(guestUser)
    return guestUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('userInfo')
    localStorage.removeItem('guestNotifications')
    localStorage.removeItem('guestKnownBuildingIds')
    setUserState(null)
  }, [])

  const exitGuestMode = useCallback(() => {
    localStorage.removeItem('userInfo')
    localStorage.removeItem('guestNotifications')
    localStorage.removeItem('guestKnownBuildingIds')
    setUserState(null)
  }, [])

  const updateUser = useCallback((userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData))
    setUserState(userData)
  }, [])

  return { user, login, logout, updateUser, continueAsGuest, exitGuestMode }
}
