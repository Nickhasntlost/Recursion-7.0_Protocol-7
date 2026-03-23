import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const sidebarItems = [
  { icon: 'dashboard', label: 'Overview', path: '/dashboard', exact: true },
  { icon: 'event', label: 'Events', path: '/dashboard/events' },
  { icon: 'automation', label: 'Automation', path: '/dashboard/automation' },
  { icon: 'analytics', label: 'Analytics', path: '/dashboard/analytics' },
  { icon: 'people', label: 'Attendees', path: '/dashboard/attendees' },
  { icon: 'receipt_long', label: 'Bookings', path: '/dashboard/bookings' },
  { icon: 'campaign', label: 'Marketing', path: '/dashboard/marketing' },
  { icon: 'settings', label: 'Settings', path: '/dashboard/settings' },
]

export default function DashboardLayout() {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  // Auto-collapse sidebar when on automation page, expand when leaving
  useEffect(() => {
    if (location.pathname === '/dashboard/automation') {
      setSidebarCollapsed(true)
    } else {
      setSidebarCollapsed(false)
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0, width: sidebarCollapsed ? '80px' : '280px' }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 h-screen bg-surface-container-lowest border-r border-outline-variant z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-outline-variant/30">
          {!sidebarCollapsed ? (
            <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tighter uppercase font-[family-name:var(--font-family-headline)]">
              Utsova <span className="material-symbols-outlined text-[24px] text-on-surface-variant">dashboard</span>
            </Link>
          ) : (
            <Link to="/" className="text-xl font-black">
              U
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const active = isActive(item.path, item.exact)
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all ${
                    active
                      ? 'bg-secondary-container text-on-secondary-fixed'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="text-sm font-bold tracking-wide">{item.label}</span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="absolute bottom-8 left-4 right-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">
              {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
            {!sidebarCollapsed && <span className="text-sm font-bold">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}
      >
        {/* Top Bar */}
        <header className="h-16 bg-surface-container-lowest/70 backdrop-blur-xl border-b border-outline-variant/30 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black font-[family-name:var(--font-family-headline)]">
              Organizer Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link to="/">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span className="text-sm font-bold">Back to Site</span>
              </button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>

      <button
        type="button"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={theme === 'dark'}
        onClick={toggleTheme}
        className="fixed right-4 md:right-6 bottom-4 md:bottom-6 z-90 h-12 w-12 md:h-14 md:w-14 border border-outline-variant/20 bg-surface-container-lowest text-on-surface rounded-full flex items-center justify-center shadow-[0_18px_40px_rgba(26,28,28,0.10)] transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-[0_24px_48px_rgba(26,28,28,0.14)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <span className="material-symbols-outlined text-[26px] md:text-[30px]">
          {theme === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      </button>
    </div>
  )
}
