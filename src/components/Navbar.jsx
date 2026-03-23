import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const heroEventTabs = [
  { icon: 'restaurant', label: 'Dining', to: '/category/dining' },
  { icon: 'mic', label: 'Open Mic', to: '/category/open-mic' },
  { icon: 'movie', label: 'Cinema', to: '/category/cinema' },
  { icon: 'theater_comedy', label: 'Concerts', to: '/category/concerts' },
  { icon: 'sports_basketball', label: 'Sports Events', to: '/category/sports' },
  { icon: 'code', label: 'Competitions', to: '/category/hackathons' },
]

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [showHeroTabs, setShowHeroTabs] = useState(false)

  useEffect(() => {
    if (!isHome) {
      setShowHeroTabs(false)
      return
    }

    const handleHeroNavToggle = (event) => {
      setShowHeroTabs(Boolean(event.detail?.visible))
    }

    window.addEventListener('hero-subnav-toggle', handleHeroNavToggle)
    return () => {
      window.removeEventListener('hero-subnav-toggle', handleHeroNavToggle)
    }
  }, [isHome])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl"
    >
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-4 w-full">
          <Link to="/" className="text-2xl font-black tracking-tighter text-black uppercase font-[family-name:var(--font-family-headline)]">
            Utsova
          </Link>
          {isHome && !showHeroTabs && (
            <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full w-[400px] border border-transparent focus-within:bg-surface-container-lowest focus-within:border-secondary-container transition-all">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant outline-none"
                placeholder="Search experiences..."
                type="text"
              />
              <div className="h-4 w-[1px] bg-outline-variant mx-3" />
              <button className="flex items-center gap-1 text-xs font-bold text-primary whitespace-nowrap">
                <span className="material-symbols-outlined text-sm">near_me</span>
                Near Me
              </button>
            </div>
          )}

          {isHome && showHeroTabs && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="ml-4 flex-1"
            >
              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
                {heroEventTabs.map(item => (
                  <Link key={item.label} to={item.to}>
                    <motion.div
                      className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors"
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">{item.icon}</span>
                      <span className="text-xs font-black tracking-wide uppercase">{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {(!isHome || !showHeroTabs) && (
            <div className="flex items-center gap-6 ml-auto">
              <div className="hidden lg:flex items-center gap-6 font-[family-name:var(--font-family-headline)] font-bold tracking-tight text-sm">
                <Link to="/" className={`${isHome ? 'text-black border-b-2 border-black pb-1' : 'text-zinc-500 hover:text-black transition-colors'}`}>
                  Home
                </Link>
                <Link to="/my-bookings" className="text-zinc-500 hover:text-black transition-colors">
                  My Bookings
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                  <span className="material-symbols-outlined">calendar_today</span>
                </button>
                <button className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                  <span className="material-symbols-outlined">person</span>
                </button>
                <button className="hidden sm:block px-6 py-2.5 rounded-full text-sm font-bold bg-zinc-100 text-black hover:bg-zinc-200 transition-all">
                  Login
                </button>
                <button className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-on-primary hover:scale-[0.98] transition-all">
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
