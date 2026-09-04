import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

// ── Testimonial data ──────────────────────────────────────────────────────────
const BASE = [
  {
    name: 'Nira Bose',
    role: 'Computer Science, Year 3',
    avatar: 'NB',
    accent: '#3b82f6',
    quote: 'Finding lab resources is now instant with 3D navigation. I locate exact shelves in seconds.',
  },
  {
    name: 'Arman Gill',
    role: 'Engineering Undergrad',
    avatar: 'AG',
    accent: '#8b5cf6',
    quote: 'The spatial 3D map gives me clarity when jumping between library stacks and classroom materials.',
  },
  {
    name: 'Lena Ortiz',
    role: 'Research Assistant',
    avatar: 'LO',
    accent: '#14b8a6',
    quote: 'Clean, focused interface. I collect, preview, and export sources without breaking my flow.',
  },
  {
    name: 'Dev Patel',
    role: 'Physics Honours Student',
    avatar: 'DP',
    accent: '#f59e0b',
    quote: 'CAMPUS GUIDE cut my search time in half. Keyword to exact location in under a minute.',
  },
  {
    name: 'Sana Yoon',
    role: 'Professor, Life Sciences',
    avatar: 'SY',
    accent: '#ec4899',
    quote: 'I recommend CAMPUS GUIDE to all my students. It bridges digital search with physical campus space.',
  },
]

const N = BASE.length
const LOOP_DATA = [...BASE, ...BASE, ...BASE] // Clone for infinite feel
const TRACK_START_IDX = N // Index 5 (Start of middle set)

// ── Constants ──────────────────────────────────────────────────────────────
const GAP = 24
const AUTO_PLAY_DELAY = 5000

// ── Hook for responsive card width ───────────────────────────────────────────
function useCardWidth() {
  const [w, setW] = useState(320)
  useEffect(() => {
    const calc = () => {
      if (window.innerWidth < 640) setW(Math.min(320, window.innerWidth - 64))
      else if (window.innerWidth < 1024) setW(280)
      else setW(320)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  return w
}

// ── Single Card Component ──────────────────────────────────────────────────
function TestimonialCard({ t, isActive, width }) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1.05 : 0.9,
        opacity: isActive ? 1 : 0.6,
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        flex: '0 0 auto',
        width: `${width}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '220px',
        background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.10)',
        borderRadius: '24px',
        padding: '24px',
        willChange: 'transform, opacity',
        zIndex: isActive ? 10 : 1,
        boxShadow: isActive ? '0 12px 40px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      <Quote size={20} style={{ color: t.accent, opacity: 0.7, marginBottom: '12px', flexShrink: 0 }} strokeWidth={1.5} />
      <p style={{
        flex: 1,
        fontSize: '14px',
        lineHeight: '1.6',
        color: isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.7)',
        marginBottom: '16px',
      }}>
        "{t.quote}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: `${t.accent}33`, border: `1px solid ${t.accent}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700, color: '#fff',
        }}>
          {t.avatar}
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '2px' }}>{t.name}</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{t.role}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Section ─────────────────────────────────────────────────────────────
export const TestimonialsSection = () => {
  const cardWidth = useCardWidth()
  const [idx, setIdx] = useState(TRACK_START_IDX)
  const [containerWidth, setContainerWidth] = useState(0)
  
  const containerRef = useRef(null)
  const timerRef     = useRef()
  const trackX       = useMotionValue(0)
  const isJumping    = useRef(false)

  const step = cardWidth + GAP

  // Function to calculate target X for center-alignment
  const getTargetX = useCallback((targetIdx, cw) => {
    if (!cw) return 0
    return (cw / 2) - (cardWidth / 2) - (targetIdx * step)
  }, [cardWidth, step])

  // ResizeObserver for container
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => {
      const cw = entries[0].contentRect.width
      setContainerWidth(cw)
      // Update x immediately on resize to keep card centered
      trackX.set(getTargetX(idx, cw))
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [idx, getTargetX, trackX])

  // Core Slide Function
  const slideTo = useCallback((targetIdx) => {
    if (isJumping.current) return
    
    setIdx(targetIdx)
    animate(trackX, getTargetX(targetIdx, containerWidth), {
      type: 'spring',
      stiffness: 150,
      damping: 25,
      onComplete: () => {
        // Seamless Jump Logic
        if (targetIdx >= 2 * N) {
          isJumping.current = true
          const nextIdx = targetIdx - N
          setIdx(nextIdx)
          trackX.set(getTargetX(nextIdx, containerWidth))
          isJumping.current = false
        } else if (targetIdx < N) {
          isJumping.current = true
          const nextIdx = targetIdx + N
          setIdx(nextIdx)
          trackX.set(getTargetX(nextIdx, containerWidth))
          isJumping.current = false
        }
      }
    })
  }, [containerWidth, getTargetX, trackX])

  // Auto Play
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => slideTo(idx + 1), AUTO_PLAY_DELAY)
  }, [idx, slideTo])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  const go = (dir) => {
    slideTo(idx + dir)
    resetTimer()
  }

  function mod(n, m) { return ((n % m) + m) % m }
  const modIdx = mod(idx, N)

  return (
    <section id="testimonials" className="w-full px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <div className="w-full max-w-full">
        <div className="w-full rounded-[2.5rem] border border-accentCyan/20 bg-bgSecondary/75 p-6 shadow-soft backdrop-blur-xl sm:p-8 md:p-10">
          
          {/* Header */}
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between px-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-accentCyan">Voices of our students</p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-textPrimary sm:text-5xl">
                What they're saying
              </h2>
              <span className="mt-3 block h-1 w-20 rounded-full bg-gradient-to-r from-accent to-accentCyan" />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => go(-1)}
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-accentCyan/30 bg-bgPrimary/80 text-accentCyan transition-all duration-300 hover:border-accent/45 hover:bg-accent/15 hover:text-accent"
              >
                <ChevronLeft size={22} className="transition-transform group-active:-translate-x-1" />
              </button>
              <button
                onClick={() => go(1)}
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-accentCyan/30 bg-bgPrimary/80 text-accentCyan transition-all duration-300 hover:border-accent/45 hover:bg-accent/15 hover:text-accent"
              >
                <ChevronRight size={22} className="transition-transform group-active:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Carousel Viewport */}
          <div 
            ref={containerRef}
            className="relative flex h-[300px] w-full items-center overflow-hidden sm:h-[340px]"
          >
            <motion.div
              style={{
                display: 'flex',
                gap: `${GAP}px`,
                x: trackX,
                alignItems: 'center',
                willChange: 'transform',
              }}
            >
              {LOOP_DATA.map((t, i) => (
                <TestimonialCard 
                  key={`${t.name}-${i}`} 
                  t={t} 
                  isActive={i === idx} 
                  width={cardWidth}
                />
              ))}
            </motion.div>
            
            {/* Visual fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-bgSecondary to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-bgSecondary to-transparent" />
          </div>

          {/* Dots */}
          <div className="mt-12 flex items-center justify-center gap-2.5">
            {BASE.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  slideTo(N + i) 
                  resetTimer()
                }}
                className={`h-2 transition-all duration-300 ${
                  i === modIdx ? 'w-8 bg-accent' : 'w-2 bg-surface/20 hover:bg-surface/40'
                } rounded-full`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
