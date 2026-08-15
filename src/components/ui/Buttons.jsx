import { motion } from 'framer-motion'

const sharedClasses =
  'inline-flex items-center justify-center rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bgPrimary disabled:cursor-not-allowed disabled:opacity-60'

export const PrimaryButton = ({ children, className = '', size = 'md', icon, ...props }) => {
  const sizeClass = size === 'sm' ? 'px-4 py-2' : 'px-6 py-3'

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`${sharedClasses} ${sizeClass} bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-slate-950 shadow-glow hover:from-[#fbbf24] hover:to-[#f59e0b] hover:shadow-[0_0_0_1px_rgba(245,158,11,0.3),0_14px_30px_rgba(2,6,23,0.48)] ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon ? (
          <motion.span
            aria-hidden
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="inline-flex"
          >
            {icon}
          </motion.span>
        ) : null}
      </span>
    </motion.button>
  )
}

export const SecondaryButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileHover="hover"
    initial="rest"
    className={`${sharedClasses} relative rounded-full border border-accentCyan/45 bg-accentCyan/5 px-5 py-2 text-accentCyan hover:bg-accentCyan/10 hover:shadow-cyanGlow ${className}`}
    {...props}
  >
    <motion.span
      variants={{ rest: { y: 0 }, hover: { y: -1.5 } }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      {children}
    </motion.span>
    <motion.span
      aria-hidden
      variants={{ rest: { scaleX: 0, opacity: 0.4 }, hover: { scaleX: 1, opacity: 1 } }}
      transition={{ duration: 0.25 }}
      className="absolute bottom-1 left-4 right-4 h-px origin-left bg-accentCyan"
    />
  </motion.button>
)
