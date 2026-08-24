import { memo } from 'react'

const typeDotClass = {
  resource: 'bg-cyan-400',
  building: 'bg-emerald-400',
  warning: 'bg-red-400',
  info: 'bg-blue-400',
}

export const NotificationItem = memo(function NotificationItem({ message, time, type = 'info', unread = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left transition-all duration-200 hover:bg-bgPrimary/55 ${
        unread
          ? 'border-accentCyan/20 bg-accentCyan/10'
          : 'border-white/10 bg-bgPrimary/25 opacity-85'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${typeDotClass[type] || typeDotClass.info}`}
        />

        <div className="min-w-0 flex-1">
          <p className={`text-sm leading-relaxed ${unread ? 'font-semibold text-textPrimary' : 'font-normal text-textAccent/80'}`}>
            {message}
          </p>
          <p className="mt-1 text-xs text-textAccent/75">{time}</p>
        </div>
      </div>
    </button>
  )
})
