import { Link, useLocation, useNavigate } from 'react-router-dom'

const LINK_MAP = {
  'About Us':   'route:/about',
  Services:     'scroll:test-demo',
  'Privacy Policy': 'route:/privacy',
  'Terms of Use':   'route:/terms',
}

const footerColumns = {
  'QUICK LINKS': ['About Us', 'Services'],
  COMPANY: ['Privacy Policy', 'Terms of Use'],
}

function FooterLink({ label }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dest = LINK_MAP[label]

  if (!dest) {
    return (
      <span className="text-sm text-textAccent/40 cursor-default select-none">
        {label}
      </span>
    )
  }

  if (dest.startsWith('route:')) {
    return (
      <Link
        to={dest.slice(6)}
        className="text-sm text-textAccent transition-colors duration-300 hover:text-accentCyan"
      >
        {label}
      </Link>
    )
  }

  const sectionId = dest.slice(7)
  const handleScroll = (e) => {
    e.preventDefault()
    const scrollTo = () => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    if (location.pathname !== '/') {
      navigate('/')
      window.setTimeout(scrollTo, 120)
      return
    }

    scrollTo()
  }

  return (
    <button
      type="button"
      onClick={handleScroll}
      className="text-sm text-textAccent transition-colors duration-300 hover:text-accentCyan"
    >
      {label}
    </button>
  )
}

export const Footer = () => {
  return (
    <footer className="mt-10 w-full overflow-x-clip px-3 pb-8 sm:mt-14 sm:px-6 md:px-10 lg:mt-16">
      <div className="w-full rounded-3xl border border-accentCyan/18 bg-bgSecondary/75 p-5 shadow-soft backdrop-blur-sm sm:p-7 md:p-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(footerColumns).map(([title, links]) => (
            <div key={title} className="min-w-0 break-words flex flex-col items-start gap-2.5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-textPrimary">{title}</p>
              <ul className="m-0 flex list-none flex-col items-start gap-2.5 p-0">
                {links.map((link) => (
                  <li key={link} className="min-w-0 break-words">
                    <FooterLink label={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="min-w-0 break-words flex flex-col items-start gap-2.5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-textPrimary">CONTACT</p>
            <ul className="m-0 flex list-none flex-col items-start gap-2.5 p-0">
              <li>
                <a
                  href="mailto:contact@campusguide.com"
                  className="break-all text-sm text-textAccent transition-colors duration-300 hover:text-accentCyan"
                >
                  contact@campusguide.com
                </a>
              </li>
              <li>
                <span className="text-sm text-textAccent">+91 9876543210</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-textAccent/15 pt-4 text-xs text-textAccent">
          © {new Date().getFullYear()} CAMPUS GUIDE. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
