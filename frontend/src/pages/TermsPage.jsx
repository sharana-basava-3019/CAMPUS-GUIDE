import { useEffect } from 'react'
import { Navbar } from '../components/sections/Navbar'
import { Footer } from '../components/sections/Footer'

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-textAccent/15 bg-bgSecondary/45 p-6 shadow-soft backdrop-blur-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-textPrimary">Terms of Use</p>
          <p className="mt-4 text-sm leading-relaxed text-textAccent sm:text-base">
            This is a placeholder terms of use page for Campus Guide. Complete terms will be published soon.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
