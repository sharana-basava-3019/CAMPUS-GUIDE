import { motion, AnimatePresence } from 'framer-motion'

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4"
        >
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-bgSecondary/95 p-5 shadow-soft"
          >
            <p className="text-lg font-semibold text-textPrimary">{title}</p>
            <p className="mt-2 text-sm text-textAccent">{message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-textAccent">Cancel</button>
              <button type="button" onClick={onConfirm} className="rounded-lg bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-300">Confirm</button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
