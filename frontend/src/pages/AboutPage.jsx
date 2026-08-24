import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/sections/Navbar'
import { Footer } from '../components/sections/Footer'
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons'

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const processSteps = [
  {
    title: 'Select Start & Destination',
    description: 'Choose where you are and where you need to go inside the campus experience.',
  },
  {
    title: 'System Finds Route',
    description: 'Our route logic evaluates options and chooses a clear path in moments.',
  },
  {
    title: 'Map Highlights Path',
    description: 'The selected path is emphasized on the interactive visual scene for clarity.',
  },
  {
    title: 'Navigate Visually',
    description: 'Follow landmarks and layout context to move confidently to your destination.',
  },
]

const keyFeatures = [
  {
    title: 'Smart Search',
    description: 'Find academic resources quickly with intent-aware search behavior.',
  },
  {
    title: '3D Navigation',
    description: 'Explore spaces with an interactive campus model and visual depth.',
  },
  {
    title: 'Route Highlighting',
    description: 'See your selected route emphasized clearly across buildings and paths.',
  },
  {
    title: 'Authentication',
    description: 'Access personalized actions securely through account-based sessions.',
  },
  {
    title: 'Interactive Map',
    description: 'Engage with campus layers through controls built for fast orientation.',
  },
]

const useCases = [
  {
    title: 'Students',
    description: 'Locate classrooms, libraries, and study zones with fewer missed turns.',
  },
  {
    title: 'Professors',
    description: 'Reach labs, lecture halls, and office spaces efficiently between sessions.',
  },
  {
    title: 'Visitors',
    description: 'Navigate an unfamiliar campus confidently using guided visual context.',
  },
]

export default function AboutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const goToMapSection = () => {
    navigate('/')
    window.setTimeout(() => {
      document.getElementById('test-demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-4 pb-16 pt-24 sm:space-y-14 sm:px-6 lg:space-y-16 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2rem] border border-textAccent/15 bg-bgSecondary/45 p-6 shadow-soft backdrop-blur-md sm:p-8 md:p-12"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(199,191,174,0.16),transparent_40%),radial-gradient(circle_at_82%_78%,rgba(60,90,115,0.45),transparent_42%)]" />
          <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="inline-flex rounded-full border border-textAccent/20 bg-bgPrimary/35 px-4 py-1.5 text-xs uppercase tracking-[0.16em] text-textAccent">
                About Campus Guide
              </p>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-textPrimary sm:text-5xl">
                About Campus Guide
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-textAccent sm:text-lg">
                Discover how Campus Guide combines search, route intelligence, and immersive visuals to simplify campus movement from first step to final destination.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <PrimaryButton icon={<ArrowIcon />} onClick={goToMapSection}>
                  Explore Platform
                </PrimaryButton>
                <SecondaryButton onClick={() => document.getElementById('project-overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  VIEW OVERVIEW
                </SecondaryButton>
              </div>
            </div>

            <div className="rounded-2xl border border-textAccent/10 bg-bgPrimary/25 p-3 backdrop-blur-lg">
              <img
                src="/images/about-platform.png"
                alt="Campus Guide preview"
                className="h-auto w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </motion.section>

        <motion.section
          id="project-overview"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-3xl border border-textAccent/15 bg-bgSecondary/60 p-6 shadow-soft backdrop-blur-lg md:p-10"
        >
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.14em] text-textAccent">Project Overview</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-textPrimary">What Campus Guide Solves</h2>
              <p className="mt-4 leading-relaxed text-textAccent">
                Campus Guide is built to connect digital discovery and physical campus navigation in one flow. It helps users find destinations quickly, understand route context, and move with confidence through complex spaces.
              </p>
              <p className="mt-3 leading-relaxed text-textAccent/85">
                The platform reduces uncertainty, saves time, and makes orientation easier for students, faculty, and first-time visitors alike.
              </p>
            </div>

            <div className="rounded-2xl border border-textAccent/10 bg-bgPrimary/25 p-3 backdrop-blur-md">
              <img
                src="/images/about-platform.png"
                alt="Campus navigation context"
                className="h-auto min-h-[180px] w-full rounded-xl object-cover sm:min-h-[220px]"
              />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-3xl border border-textAccent/15 bg-bgSecondary/60 p-6 shadow-soft backdrop-blur-lg md:p-10"
        >
          <p className="text-sm uppercase tracking-[0.14em] text-textAccent">How It Works</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-textPrimary">From Search to Navigation in Four Steps</h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <motion.article
                key={step.title}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#3C5A73]/30 p-5 backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-surface/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="relative text-xs uppercase tracking-[0.12em] text-textAccent/90">Step {index + 1}</p>
                <h3 className="relative mt-2 font-display text-lg text-textPrimary">{step.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-textAccent">{step.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-3xl border border-white/10 bg-[#102A43]/60 p-6 shadow-xl backdrop-blur-lg md:p-10"
        >
          <p className="text-sm uppercase tracking-widest text-textAccent">Platform Capabilities</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-textPrimary">Key Features</h2>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {keyFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#3C5A73]/30 p-6 text-center backdrop-blur-md transition-all hover:scale-[1.03] sm:min-h-[220px]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-surface/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <h3 className="relative font-display text-xl text-textPrimary transition-all duration-300 group-hover:-translate-y-3 group-hover:opacity-0">
                  {feature.title}
                </h3>

                <p className="absolute translate-y-4 px-6 text-sm leading-relaxed text-textAccent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-3xl border border-textAccent/15 bg-bgSecondary/60 p-6 shadow-soft backdrop-blur-lg md:p-10"
        >
          <p className="text-sm uppercase tracking-[0.14em] text-textAccent">Use Cases</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-textPrimary">Who Campus Guide Helps</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {useCases.map((item) => (
              <motion.article
                key={item.title}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="rounded-2xl border border-white/10 bg-[#3C5A73]/30 p-6 backdrop-blur-md"
              >
                <h3 className="font-display text-xl text-textPrimary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-textAccent">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-3xl border border-textAccent/15 bg-bgSecondary/60 p-6 shadow-soft backdrop-blur-lg md:p-10"
        >
          <p className="text-sm uppercase tracking-[0.14em] text-textAccent">Vision & Mission</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-bgPrimary/25 p-6 backdrop-blur-md">
              <h3 className="font-display text-2xl text-textPrimary">Vision</h3>
              <p className="mt-3 leading-relaxed text-textAccent">
                Build a campus where every learner can move with certainty, discover resources faster, and focus on meaningful academic work.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-bgPrimary/25 p-6 backdrop-blur-md">
              <h3 className="font-display text-2xl text-textPrimary">Mission</h3>
              <p className="mt-3 leading-relaxed text-textAccent">
                Deliver a seamless platform that unifies discovery, route guidance, and interactive mapping into one reliable student-first experience.
              </p>
            </article>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2rem] border border-textAccent/15 bg-bgSecondary/55 p-8 text-center shadow-soft backdrop-blur-lg md:p-12"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(199,191,174,0.18),transparent_45%)]" />
          <p className="text-sm uppercase tracking-[0.14em] text-textAccent">Ready to Navigate</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-textPrimary md:text-4xl">
            Start Exploring Campus Guide
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-textAccent">
            Jump into the interactive experience and locate destinations faster with guided campus context.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <PrimaryButton icon={<ArrowIcon />} onClick={goToMapSection}>
              Go to 3D Map
            </PrimaryButton>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
