import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SecondaryButton } from '../ui/Buttons'

export const AboutPlatformSection = () => {
  return (
    <section className="relative z-10 mt-0 w-full px-4 py-6 sm:px-6 md:px-10 md:py-8">
      <div className="w-full max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex min-h-[58vh] w-full flex-col items-center gap-6 rounded-2xl border border-accentCyan/15 bg-surface/70 px-5 py-6 shadow-soft backdrop-blur-lg md:flex-row md:gap-8 md:px-10 md:py-8"
        >
          <div className="flex-1">
            <h2 className="mb-4 font-display text-2xl font-semibold text-textPrimary md:text-3xl">About Our Platform</h2>
            <span className="mb-4 block h-1 w-20 rounded-full bg-gradient-to-r from-accent to-accentCyan" />
            <p className="leading-relaxed text-textAccent">
              CAMPUS GUIDE is a search-based academic resource system that combines intelligent discovery with a 3D-inspired campus view.
              Students can locate materials through location-aware context across Library, Lab, and Classroom spaces.
            </p>
            <div className="mt-8">
              <Link to="/about">
                <SecondaryButton>KNOW MORE</SecondaryButton>
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <img
              src="/images/about-platform.png"
              alt="Platform preview"
              className="h-auto w-full rounded-xl object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
