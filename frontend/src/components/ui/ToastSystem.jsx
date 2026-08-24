import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

const typeStyles = {
  success: 'border-l-4 border-l-[#10b981]',
  error: 'border-l-4 border-l-[#ef4444]',
  warning: 'border-l-4 border-l-[#f59e0b]',
  info: 'border-l-4 border-l-[#22d3ee]',
}

const typeIcons = {
  success: '✓',
  error: '!',
  warning: '!',
  info: 'i',
}

const typeIconStyles = {
  success: 'text-[#10b981] bg-[#10b981]/15',
  error: 'text-[#ef4444] bg-[#ef4444]/15',
  warning: 'text-[#f59e0b] bg-[#f59e0b]/15',
  info: 'text-[#22d3ee] bg-[#22d3ee]/15',
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(({ type = 'info', title, message }) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, title, message }])
    window.setTimeout(() => dismissToast(id), 3200)
  }, [dismissToast])

  const value = useMemo(() => ({ pushToast, dismissToast }), [dismissToast, pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-24 z-[60] flex w-[92%] max-w-[560px] -translate-x-1/2 flex-col gap-3 sm:left-auto sm:right-5 sm:top-24 sm:w-full sm:max-w-sm sm:translate-x-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`pointer-events-auto rounded-xl border border-white/12 bg-[rgba(17,24,39,0.85)] px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.4)] backdrop-blur-[10px] ${typeStyles[toast.type] || typeStyles.info}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${typeIconStyles[toast.type] || typeIconStyles.info}`}
                  aria-hidden="true"
                >
                  {typeIcons[toast.type] || typeIcons.info}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{toast.title}</p>
                  <p className="mt-1 text-xs text-[#9ca3af]">{toast.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
