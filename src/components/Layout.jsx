import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function Layout() {
  const location = useLocation()
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = window.localStorage.getItem('eventra-theme')
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light')
    window.localStorage.setItem('eventra-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen selection:bg-secondary-container selection:text-on-secondary-container">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="pt-20"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />

      <button
        type="button"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={theme === 'dark'}
        onClick={toggleTheme}
        className="fixed right-4 md:right-6 bottom-4 md:bottom-6 z-[90] h-12 w-12 md:h-14 md:w-14 border border-outline-variant/20 bg-surface-container-lowest text-on-surface rounded-full flex items-center justify-center shadow-[0_18px_40px_rgba(26,28,28,0.10)] transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-[0_24px_48px_rgba(26,28,28,0.14)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <span className="material-symbols-outlined text-[26px] md:text-[30px]">
          {theme === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      </button>
    </div>
  )
}
