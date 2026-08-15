import { motion, AnimatePresence } from 'framer-motion'

export function EditModal({ open, title, fields, values, onChange, onClose, onSubmit, submitLabel = 'Save' }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4"
        >
          <motion.form
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            onSubmit={onSubmit}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-bgSecondary/95 p-5 shadow-soft"
          >
            <p className="text-lg font-semibold text-textPrimary">{title}</p>
            <div className="mt-4 space-y-3">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-textAccent">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={values[field.name] || ''}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-bgPrimary/30 px-3 py-2 text-sm text-textPrimary"
                    >
                      {(field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'file' ? (
                    <input
                      type="file"
                      accept={field.accept}
                      onChange={(e) => onChange(field.name, e.target.files?.[0] || null)}
                      className="w-full rounded-lg border border-white/10 bg-bgPrimary/30 px-3 py-2 text-sm text-textPrimary file:mr-3 file:rounded-md file:border-0 file:bg-accentCyan/20 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-accentCyan"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={values[field.name] || ''}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-bgPrimary/30 px-3 py-2 text-sm text-textPrimary"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-textAccent">Cancel</button>
              <button type="submit" className="rounded-lg bg-surface/80 px-3 py-2 text-sm font-semibold text-textPrimary">{submitLabel}</button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
