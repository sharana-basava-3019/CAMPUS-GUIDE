import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from './components/sections/Navbar'
import { HeroSection } from './components/sections/HeroSection'

// Below-fold sections — lazy-loaded so they don't block the first paint.
// three.js (inside DemoTabsSection) is also deferred until the user scrolls down.
const AboutPlatformSection = lazy(() => import('./components/sections/AboutPlatformSection').then(m => ({ default: m.AboutPlatformSection })))
const DemoTabsSection      = lazy(() => import('./components/sections/DemoTabsSection').then(m => ({ default: m.DemoTabsSection })))
const FeaturesSection      = lazy(() => import('./components/sections/FeaturesSection').then(m => ({ default: m.FeaturesSection })))
const TestimonialsSection  = lazy(() => import('./components/sections/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })))
const Footer               = lazy(() => import('./components/sections/Footer').then(m => ({ default: m.Footer })))

// Lightweight below-fold placeholder — matches section height to prevent layout shift
function SectionSkeleton({ minH = '40vh' }) {
  return <div style={{ minHeight: minH }} />
}

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
          {/* Hero is eager — visible immediately on load */}
          <HeroSection />

          {/* Below-fold sections deferred until JS is idle */}
          <Suspense fallback={<SectionSkeleton minH="58vh" />}>
            <AboutPlatformSection />
          </Suspense>
          <Suspense fallback={<SectionSkeleton minH="520px" />}>
            <DemoTabsSection />
          </Suspense>
          <Suspense fallback={<SectionSkeleton minH="340px" />}>
            <FeaturesSection />
          </Suspense>
          <Suspense fallback={<SectionSkeleton minH="420px" />}>
            <TestimonialsSection />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>

        {/* Ambient glow — CSS animation instead of framer-motion to keep JS thread free */}
        <div
          aria-hidden
          className="pointer-events-none fixed -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
          style={{ animation: 'ambientPulse 10s ease-in-out infinite' }}
        />
        <style>{`
          @keyframes ambientPulse {
            0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
            50%       { opacity: 0.55; transform: translateX(-50%) scale(1.08); }
          }
        `}</style>
      </div>
    </div>
  )
}
