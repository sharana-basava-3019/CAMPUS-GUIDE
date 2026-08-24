import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const tabs = ['Dashboard', 'Users', 'Resources', 'Map']

export function AdminLayout({ activeTab, onTabChange, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() =>  { 
    setSidebarOpen(false)
  }, [activeTab])

  const renderTabs = () => (
    <div className="space-y-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-all ${
            activeTab === tab
              ? 'bg-surface/70 text-textPrimary'
              : 'text-textAccent hover:bg-white/5 hover:text-textPrimary'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )

  return (
    <div className="w-full overflow-x-clip px-3 pb-16 pt-24 sm:px-5 lg:px-8">
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-bgSecondary/55 px-3 py-2 text-sm font-medium text-textPrimary shadow-soft backdrop-blur-lg transition-colors duration-200 hover:bg-bgSecondary/70"
          aria-label="Open admin sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Menu
        </button>
        <p className="text-xs uppercase tracking-[0.14em] text-textAccent">{activeTab}</p>
      </div>

      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="hidden h-fit w-full rounded-2xl border border-white/10 bg-bgSecondary/55 p-4 shadow-soft backdrop-blur-lg lg:sticky lg:top-24 lg:block lg:h-[calc(100vh-7rem)] lg:w-[240px] lg:shrink-0 lg:overflow-y-auto">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-textAccent">Admin Panel</p>
          {renderTabs()}
        </aside>

        <motion.section
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full min-w-0 flex-1 overflow-x-hidden rounded-2xl border border-white/10 bg-bgSecondary/55 p-3 shadow-soft backdrop-blur-lg sm:p-5 lg:p-6"
        >
          {children}
        </motion.section>
      </div>

      <AnimatePresence>
        {sidebarOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close admin sidebar overlay"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-[70] bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed left-0 top-0 z-[80] flex h-screen w-[82%] max-w-[280px] flex-col border-r border-white/12 bg-bgSecondary/95 p-4 shadow-[0_18px_38px_rgba(2,6,23,0.6)] backdrop-blur-xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.16em] text-textAccent">Admin Panel</p>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-textAccent transition-colors duration-200 hover:bg-white/10 hover:text-textPrimary"
                  aria-label="Close admin sidebar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto">
                {renderTabs()}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
