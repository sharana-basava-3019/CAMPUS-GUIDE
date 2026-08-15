const cards = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    iconColor: 'text-accentCyan',
    iconBg: 'bg-accentCyan/15 border-accentCyan/30',
    trendLabel: '+2 this week',
    trendType: 'up',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'totalResources',
    label: 'Total Resources',
    iconColor: 'text-accent',
    iconBg: 'bg-accent/15 border-accent/30',
    trendLabel: 'No change',
    trendType: 'flat',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path d="M6 4h8l4 4v12H6V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 4v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'totalUploads',
    label: 'Total Uploads',
    iconColor: 'text-success',
    iconBg: 'bg-success/15 border-success/30',
    trendLabel: '+3 uploads today',
    trendType: 'up',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path d="M12 16V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="m7 9 5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'totalBuildings',
    label: 'Total Buildings',
    iconColor: 'text-violet-300',
    iconBg: 'bg-violet-400/15 border-violet-300/30',
    trendLabel: 'No change',
    trendType: 'flat',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path d="M4 20V8l8-4 8 4v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const trendStyle = {
  up: {
    icon: '↑',
    className: 'text-success',
  },
  down: {
    icon: '↓',
    className: 'text-rose-300',
  },
  flat: {
    icon: '→',
    className: 'text-slate-300',
  },
}

const activityIconByType = {
  user: {
    color: 'text-accentCyan',
    bg: 'bg-accentCyan/15 border-accentCyan/30',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  resource: {
    color: 'text-accent',
    bg: 'bg-accent/15 border-accent/30',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path d="M6 4h8l4 4v12H6V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 4v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  block: {
    color: 'text-rose-300',
    bg: 'bg-rose-400/15 border-rose-300/30',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  building: {
    color: 'text-success',
    bg: 'bg-success/15 border-success/30',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path d="M4 20V8l8-4 8 4v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
}

const mockActivities = [
  { id: 1, type: 'user', message: 'New user registered – John Doe', offsetMs: 2 * 60 * 1000 },
  { id: 2, type: 'resource', message: 'Resource added – Data Structures Notes', offsetMs: 18 * 60 * 1000 },
  { id: 3, type: 'block', message: 'User blocked – user@email.com', offsetMs: 54 * 60 * 1000 },
  { id: 4, type: 'building', message: 'New building added – Library Block', offsetMs: 2 * 60 * 60 * 1000 },
  { id: 5, type: 'resource', message: 'Resource added – Computer Networks Slides', offsetMs: 4 * 60 * 60 * 1000 },
  { id: 6, type: 'user', message: 'New user registered – Priya Sharma', offsetMs: 7 * 60 * 60 * 1000 },
  { id: 7, type: 'block', message: 'User unblocked – faculty@campus.edu', offsetMs: 12 * 60 * 60 * 1000 },
]

function formatRelativeTime(offsetMs) {
  const minutes = Math.floor(offsetMs / (60 * 1000))
  if (minutes < 1) return 'Now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  return 'Today'
}

export function DashboardOverview({ summary, loading, onAddUser }) {
  const recentActivities = mockActivities.slice(0, 8)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary sm:text-xl">Dashboard</h2>
          <p className="mt-1 text-sm text-textAccent">Live summary of key admin metrics.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddUser}
            className="inline-flex items-center justify-center rounded-full bg-accentCyan/15 px-3 py-1.5 text-xs font-semibold text-accentCyan transition-colors duration-200 hover:bg-accentCyan/25"
          >
            + Add User
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.key}
            className="w-full rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(30,41,59,0.55),rgba(15,23,42,0.7))] p-4 shadow-soft transition-all duration-300 ease-out hover:-translate-y-[5px] hover:border-accentCyan/30 hover:shadow-[0_12px_26px_rgba(2,6,23,0.45)] sm:p-5 lg:p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.14em] text-textAccent">{card.label}</p>
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${card.iconBg} ${card.iconColor}`}>
                {card.icon}
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold leading-none text-textPrimary sm:text-4xl">
              {loading ? '...' : Number(summary?.[card.key] ?? 0).toLocaleString()}
            </p>

            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <span className={`font-semibold ${trendStyle[card.trendType]?.className || trendStyle.flat.className}`}>
                {trendStyle[card.trendType]?.icon || trendStyle.flat.icon}
              </span>
              <span className="text-textAccent/90">{card.trendLabel}</span>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(30,41,59,0.55),rgba(15,23,42,0.7))] p-5 shadow-soft sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-textPrimary sm:text-lg">Recent Activity</h3>
          <span className="text-xs uppercase tracking-[0.14em] text-textAccent">Latest actions</span>
        </div>

        <div className="mt-4 max-h-[320px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
          {recentActivities.map((activity, index) => {
            const iconMeta = activityIconByType[activity.type] || activityIconByType.resource

            return (
              <article
                key={activity.id}
                className="rounded-xl border border-white/10 bg-bgPrimary/35 p-3 transition-all duration-300 hover:bg-bgPrimary/55"
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${iconMeta.bg} ${iconMeta.color}`}>
                    {iconMeta.icon}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-textPrimary">{activity.message}</p>
                    <p className="mt-1 text-xs text-textAccent/85">{formatRelativeTime(activity.offsetMs)}</p>
                  </div>
                </div>

                {index < recentActivities.length - 1 ? <div className="mt-3 h-px bg-white/10" /> : null}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
