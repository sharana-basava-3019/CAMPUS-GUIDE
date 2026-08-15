/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bgPrimary: '#0f172a',
        bgSecondary: '#111827',
        surface: '#1e293b',
        textPrimary: '#e5e7eb',
        textAccent: '#94a3b8',
        accent: '#f59e0b',
        accentCyan: '#22d3ee',
        success: '#10b981',
      },
      boxShadow: {
        soft: '0 14px 36px rgba(2, 6, 23, 0.42)',
        glow: '0 0 0 1px rgba(245, 158, 11, 0.25), 0 12px 28px rgba(2, 6, 23, 0.48)',
        cyanGlow: '0 0 0 1px rgba(34, 211, 238, 0.22), 0 12px 26px rgba(2, 6, 23, 0.46)',
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
