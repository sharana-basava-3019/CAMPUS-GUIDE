const features = [
  {
    icon: 'M3 12h18M12 3v18',
    title: 'Smart Search',
    description: 'Quickly find academic resources using intelligent keyword matching.',
  },
  {
    icon: 'M4 16l5-5 4 4 7-7',
    title: '3D Navigation',
    description: 'Explore campus buildings with an interactive 3D map system.',
  },
  {
    icon: 'M12 3 4 7v6c0 3.3 2.2 6.4 8 8 5.8-1.6 8-4.7 8-8V7l-8-4Z',
    title: 'Instant Access',
    description: 'Open notes, materials, and resources instantly from one place.',
  },
  {
    icon: 'M6 12h12M6 7h12M6 17h8',
    title: 'Role-Based Workspace',
    description: 'Each user gets focused actions based on Student, Professor, or Guest role.',
  },
]

export const FeaturesSection = () => {
  return (
    <section id="features" className="w-full bg-bgPrimary/75 px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <div className="w-full max-w-full rounded-3xl border border-accent/20 bg-bgSecondary/80 px-5 py-7 shadow-soft sm:px-8 md:px-10 md:py-9">
        <div className="flex flex-col gap-10">
          <div>
            <p className="text-sm tracking-widest text-accentCyan uppercase">Platform Capabilities</p>
            <h2 className="mt-2 text-4xl font-semibold text-textPrimary">
              Designed for fast academic workflows
            </h2>
            <span className="mt-3 block h-1 w-24 rounded-full bg-gradient-to-r from-accent to-accentCyan" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-accentCyan/20 bg-surface/55 p-6 text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-accent/45 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.24),0_16px_34px_rgba(2,6,23,0.5)] sm:min-h-[220px]"
              >
                <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-accentCyan/35 bg-accentCyan/10 text-accentCyan">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d={feature.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>

                <h3 className="font-display text-xl text-textPrimary">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-textAccent">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
