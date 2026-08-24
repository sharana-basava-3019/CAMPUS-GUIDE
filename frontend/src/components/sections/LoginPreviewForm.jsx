import { motion } from 'framer-motion'
import { useState } from 'react'
import { PrimaryButton } from '../ui/Buttons'

const formTabs = ['Login', 'Register']

const Field = ({ id, label, type = 'text' }) => (
  <div className="relative">
    <input
      id={id}
      type={type}
      placeholder=" "
      className="peer h-11 w-full rounded-xl border border-surface/15 bg-white px-3 pt-4 text-sm text-textPrimary outline-none transition focus:border-accent/55 focus:shadow-soft"
    />
    <label
      htmlFor={id}
      className="pointer-events-none absolute left-3 top-3 text-xs text-textAccent transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs"
    >
      {label}
    </label>
  </div>
)

export const LoginPreviewForm = () => {
  const [activeTab, setActiveTab] = useState('Login')

  return (
    <div className="rounded-2xl border border-white/10 bg-bgSecondary/45 p-6 shadow-soft backdrop-blur-md sm:p-8">
      <div className="relative mb-5 flex rounded-full border border-surface/15 bg-bgSecondary p-1">
        <motion.div
          layout
          className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-accent"
          style={{ left: activeTab === 'Login' ? 4 : '50%' }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
        {formTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`z-10 w-1/2 rounded-full px-4 py-2 text-sm transition-colors ${
              activeTab === tab ? 'text-surface' : 'text-textAccent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form className="space-y-3.5">
        <Field id="email" label="Academic Email" type="email" />
        <Field id="password" label="Password" type="password" />
        {activeTab === 'Register' ? <Field id="program" label="Program" /> : null}
        <PrimaryButton className="w-full">{activeTab === 'Login' ? 'Sign In' : 'Create Account'}</PrimaryButton>
      </form>
    </div>
  )
}
