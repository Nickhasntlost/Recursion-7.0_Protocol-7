import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

const Navbar = ({ isLoggedIn = false, userType = 'client' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results (to be implemented)
      console.log('Searching for:', searchQuery)
    }
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl">
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-12">
          <Link
            to="/"
            className="text-2xl font-black tracking-tighter text-black uppercase font-headline"
          >
            assemble
          </Link>

          {/* Search Bar with Location */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full w-[400px] border border-transparent focus-within:bg-surface-container-lowest focus-within:border-secondary-container transition-all">
            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant"
              placeholder="Search experiences..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="h-4 w-[1px] bg-outline-variant mx-3"></div>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-bold text-primary whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">near_me</span>
              Near Me
            </button>
          </form>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6 font-headline font-bold tracking-tight text-sm">
            <Link
              to="/"
              className={`₹{isActive('/') ? 'text-black border-b-2 border-black pb-1' : 'text-zinc-500 hover:text-black'} transition-colors`}
            >
              Explore
            </Link>
            {isLoggedIn && (
              <Link
                to="/my-bookings"
                className={`₹{isActive('/my-bookings') ? 'text-black border-b-2 border-black pb-1' : 'text-zinc-500 hover:text-black'} transition-colors`}
              >
                My Bookings
              </Link>
            )}
            {isLoggedIn && userType === 'organizer' && (
              <Link
                to="/organizer/dashboard"
                className={`₹{isActive('/organizer/dashboard') ? 'text-black border-b-2 border-black pb-1' : 'text-zinc-500 hover:text-black'} transition-colors`}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-all">
              <span className="material-symbols-outlined">calendar_today</span>
            </button>
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-all">
              <span className="material-symbols-outlined">person</span>
            </button>

            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:block px-6 py-2.5 rounded-full text-sm font-bold bg-zinc-100 text-black hover:bg-zinc-200 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-on-primary hover:scale-[0.98] transition-all"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  // Handle logout
                  console.log('Logging out...')
                }}
                className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-on-primary hover:scale-[0.98] transition-all"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
