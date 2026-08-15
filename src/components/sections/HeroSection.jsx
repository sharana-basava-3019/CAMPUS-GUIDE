import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PrimaryButton, SecondaryButton } from '../ui/Buttons'

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export const HeroSection = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.76])
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -90])
  const borderRadius = useTransform(scrollYProgress, [0, 0.3], [0, 30])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.86])

  const handleExplore = () => {
    const scrollToDemo = () => {
      document.getElementById('test-demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    if (location.pathname !== '/') {
      navigate('/')
      window.setTimeout(scrollToDemo, 120)
      return
    }

    scrollToDemo()
  }

  const handleAbout = () => {
    navigate('/about')
  }

  return (
    <motion.section
      id="hero"
      ref={heroRef}
      style={{ scale, y, borderRadius, opacity }}
      className="sticky top-0 z-10 flex h-screen w-full origin-top items-center overflow-hidden px-4 pt-8 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden border border-accentCyan/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,58,138,0.32))] backdrop-blur-xs">
        <motion.div
          className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-accentCyan/20 blur-3xl"
          animate={{ x: [0, 28, 0], y: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-24 bottom-4 h-72 w-72 rounded-full bg-accent/25 blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 14, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.16),transparent_45%),radial-gradient(circle_at_72%_75%,rgba(245,158,11,0.16),transparent_42%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <p className="rounded-full border border-accent/35 bg-bgPrimary/55 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-accent">
          Academic Discovery Platform
        </p>
        <h1 className="mt-7 font-display text-4xl font-semibold leading-tight text-textPrimary sm:text-5xl lg:text-6xl">
          Discover campus resources with intelligent search and immersive map context.
        </h1>
        <span className="mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-accent to-accentCyan" />
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-textAccent sm:text-lg">
          CAMPUS GUIDE helps students locate materials across library stacks, labs, and classrooms with one unified workflow.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <PrimaryButton icon={<ArrowIcon />} onClick={handleExplore}>
            Explore
          </PrimaryButton>
          <SecondaryButton onClick={handleAbout}>ABOUT US</SecondaryButton>
        </div>
      </motion.div>
    </motion.section>
  )
}
