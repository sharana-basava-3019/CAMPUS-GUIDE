import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * Wraps protected routes. If the user is not authenticated, redirects to
 * /login?from=<current path> using `replace` so no extra history entry is
 * created, and pressing Back goes to the page before the protected one.
 */
export function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user?.token) {
    return (
      <Navigate
        to={`/login?from=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    )
  }

  return children
}

/**
 * Wraps /login and /signup. If the user is already logged in, redirects them
 * away so they can't navigate back to the auth pages while logged in.
 * Admins go to /admin; everyone else goes to / (or the ?from= target).
 */
export function RedirectIfAuthed({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (user?.token) {
    const params = new URLSearchParams(location.search)
    const from = params.get('from')
    const isAdmin = String(user?.role || '').toLowerCase() === 'admin'

    // Validate `from` to prevent open redirects — only allow same-origin paths.
    const safePath =
      from && from.startsWith('/') && !from.startsWith('//')
        ? from
        : isAdmin
        ? '/admin'
        : '/'

    return <Navigate to={safePath} replace />
  }

  return children
}
