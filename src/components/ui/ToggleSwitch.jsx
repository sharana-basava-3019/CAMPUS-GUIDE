import { motion } from 'framer-motion'

export const ToggleSwitch = ({ enabled, onChange, label }) => {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      <span className="text-sm text-textAccent">{label}</span>
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full border border-textAccent/30 transition-colors duration-300 ${
          enabled ? 'bg-surface shadow-glow' : 'bg-bgSecondary/80'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 550, damping: 35 }}
          className="h-5 w-5 rounded-full bg-textPrimary"
          style={{ x: enabled ? 24 : 2 }}
        />
      </button>
    </label>
  )
}
