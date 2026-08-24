import { motion } from 'framer-motion'
import { Navbar } from './components/sections/Navbar'
import { HeroSection } from './components/sections/HeroSection'
import { AboutPlatformSection } from './components/sections/AboutPlatformSection'
import { DemoTabsSection } from './components/sections/DemoTabsSection'
import { FeaturesSection } from './components/sections/FeaturesSection'
import { TestimonialsSection } from './components/sections/TestimonialsSection'
import { Footer } from './components/sections/Footer'

export default function App() {
  return (
    <div className="relative flex min-h-screen w-full max-w-full flex-col overflow-x-hidden">
      <video autoPlay loop muted playsInline preload="none" className="fixed inset-0 z-0 h-screen w-screen min-h-full min-w-full object-cover">
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 z-[1] bg-black/50" />

      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <Navbar />
        <main className="flex-1 space-y-12 pb-10 transition-all duration-300 md:space-y-14 md:pb-12">
          <HeroSection />
          <AboutPlatformSection />
          <DemoTabsSection />
          <FeaturesSection />
          <TestimonialsSection />
        </main>
        <Footer />
        <motion.div
          aria-hidden
          className="pointer-events-none fixed -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
          animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}
