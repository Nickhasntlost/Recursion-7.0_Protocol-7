import { Link } from 'react-router-dom'
import { motion, useMotionValueEvent, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { eventService } from '../services/event'

const heroEvents = [
  {
    tag: 'Featured Event',
    title: 'Sunburn Festival 2026',
    description: "Experience Asia's biggest electronic music festival. Discover and book tickets for the most anticipated performances happening in Goa.",
    date: 'Dec 28-30',
    location: 'Vagator, Goa',
    link: '/event/sunburn-goa',
  },
  {
    tag: 'Pop Culture',
    title: 'Comic Con India',
    description: "Experience the ultimate pop culture celebration. Cosplay, gaming tournaments, and massive fan meetups.",
    date: 'Dec 11-13',
    location: 'NSIC Grounds, Delhi',
    link: '/event/comic-con',
  },
  {
    tag: 'Culinary Carnival',
    title: 'Zomaland India',
    description: "India's greatest food and music carnival. A grand weekend of exquisite culinary delights and top-tier entertainment.",
    date: 'Nov 20-22',
    location: 'Jio World Garden, Mumbai',
    link: '/event/zomaland',
  }
]

const floatingElements = [
  { icon: 'restaurant', label: 'Dining', link: '/category/dining', position: 'left-[3%] top-[18%]', rotate: '-12deg', delay: 0, bg: 'bg-white' },
  { icon: 'movie', label: 'Cinema', link: '/category/cinema', position: 'left-[4%] bottom-[18%]', rotate: '8deg', delay: 0.15, bg: 'bg-white' },
  { icon: 'mic', label: 'Open Mic', link: '/category/open-mic', position: 'left-[15%] top-[48%]', rotate: '-5deg', delay: 0.3, bg: 'bg-secondary-container', filled: true },
  { icon: 'theater_comedy', label: 'Concerts', link: '/category/concerts', position: 'right-[3%] top-[18%]', rotate: '15deg', delay: 0.1, bg: 'bg-white' },
  { icon: 'code', label: 'Hackathons', link: '/category/hackathons', position: 'right-[3%] bottom-[18%]', rotate: '-10deg', delay: 0.25, bg: 'bg-white' },
  { icon: 'sports_basketball', label: 'Sports', link: '/category/sports', position: 'right-[16%] top-[48%]', rotate: '5deg', delay: 0.2, bg: 'bg-white' },
]

const categories = [
  { icon: 'restaurant', label: 'Dining', slug: 'dining' },
  { icon: 'mic', label: 'Open Mic', slug: 'open-mic', active: true, filled: true },
  { icon: 'movie', label: 'Cinema', slug: 'cinema' },
  { icon: 'theater_comedy', label: 'Concerts', slug: 'concerts' },
  { icon: 'sports_basketball', label: 'Sports', slug: 'sports' },
  { icon: 'code', label: 'Hackathons', slug: 'hackathons' },
]

const trendingCards = [
  {
    location: 'Bandra, Mumbai • Nov 14',
    title: 'The Piano Man Jazz Club',
    status: 'Selling Fast',
    statusColor: 'bg-secondary-container/20 text-secondary',
    dotColor: 'bg-secondary',
    checklist: [
      { label: 'VIP Seating Available', done: true },
      { label: 'Includes welcome drink', done: true },
    ],
    price: '₹2500',
    btnLabel: 'Book Tickets',
    btnStyle: 'bg-primary text-white',
  },
  {
    location: 'NESCO Center • Nov 16',
    title: 'Sunburn Arena ft. Garrix',
    status: 'On Sale',
    statusColor: 'bg-surface-container-high text-on-surface-variant',
    dotColor: 'bg-outline',
    checklist: [
      { label: 'Early Bird Pricing', done: true },
      { label: 'Backstage Pass Add-on', done: false },
    ],
    price: '₹4500',
    btnLabel: 'View Event',
    btnStyle: 'border border-primary text-primary hover:bg-primary hover:text-white',
  },
  {
    location: 'NMACC Mumbai • Nov 18',
    title: 'Art Mumbai 2026',
    status: 'Sold Out',
    statusColor: 'bg-error-container text-on-error-container',
    dotColor: 'bg-error',
    checklist: [
      { label: 'Exclusive Art Tour', done: true },
      { label: 'Artist Meet & Greet', done: true },
    ],
    price: '₹1500',
    btnLabel: 'Join Waitlist',
    btnStyle: 'bg-surface-container-high text-on-surface-variant cursor-not-allowed',
  },
]

const avatarUrls = [
  'https://images.pexels.com/photos/2085739/pexels-photo-2085739.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
  'https://images.pexels.com/photos/13067379/pexels-photo-13067379.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
}

const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  hover: { y: -8, boxShadow: '0 25px 50px rgba(0,0,0,0.08)', transition: { duration: 0.3, ease: 'easeOut' } }
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.classList.contains('theme-dark')
  })

  useEffect(() => {
    const root = document.documentElement
    const syncThemeState = () => setIsDarkTheme(root.classList.contains('theme-dark'))
    syncThemeState()

    const observer = new MutationObserver(syncThemeState)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  // Backend integration
  const [events, setEvents] = useState([])
  const [trendingEvents, setTrendingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const currentTitle = heroEvents[currentSlide].title
    let timeout

    if (!isDeleting && displayedText === currentTitle) {
      timeout = setTimeout(() => setIsDeleting(true), 2500)
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false)
      setCurrentSlide((prev) => (prev + 1) % heroEvents.length)
    } else {
      timeout = setTimeout(() => {
        setDisplayedText(
          currentTitle.slice(0, displayedText.length + (isDeleting ? -1 : 1))
        )
      }, isDeleting ? 30 : 60)
    }

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting, currentSlide])

  const handleIndicatorClick = (idx) => {
    setCurrentSlide(idx)
    setDisplayedText('')
    setIsDeleting(false)
  }

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  const floatingY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const floatingOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    window.dispatchEvent(new CustomEvent('hero-subnav-toggle', { detail: { visible: latest > 0.88 } }))
  })

  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('hero-subnav-toggle', { detail: { visible: false } }))
    }
  }, [])

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch published events
        const allEvents = await eventService.getAllEvents({ status: 'published' })
        setEvents(allEvents)

        // Set trending events (first 3 for now)
        setTrendingEvents(allEvents.slice(0, 3))
      } catch (err) {
        console.error('Error fetching events:', err)
        setError(err)
        // Keep mock data as fallback - no need to show error to user
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="px-4 md:px-8 mb-20 relative overflow-hidden">
        <div className="relative w-full h-[870px] rounded-xl bg-surface-container-low flex items-center justify-center text-center">
          {/* Floating Elements */}
          {floatingElements.map((el, i) => (
            <motion.div
              key={el.label}
              className={`absolute ${el.position} hidden lg:block`}
              style={{ y: floatingY, opacity: floatingOpacity }}
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + el.delay, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link to={el.link}>
                <motion.div
                  className={`floating-element ${isDarkTheme ? 'bg-secondary-container text-on-secondary-fixed' : `${el.bg} text-black`} p-6 rounded-2xl flex flex-col items-center gap-3 cursor-pointer`}
                  style={{ rotate: el.rotate }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  animate={{ y: [0, -20, 0] }}
                  transition={{
                    y: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut' },
                    scale: { duration: 0.3 },
                  }}
                >
                  <span
                    className={`material-symbols-outlined text-3xl ${isDarkTheme ? 'text-on-secondary-fixed' : el.filled ? 'text-on-secondary-container' : 'text-primary'}`}
                    style={el.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {el.icon}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{el.label}</span>
                </motion.div>
              </Link>
            </motion.div>
          ))}

          {/* Central Content */}
          <div className="relative z-10 max-w-4xl px-8 flex flex-col items-center min-h-[420px] justify-center overflow-hidden">
            <div className="flex flex-col items-center transition-opacity duration-300">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-bold tracking-widest uppercase mb-8">
                {heroEvents[currentSlide].tag}
              </span>
              <h1 className="text-6xl md:text-[7.5rem] font-black tracking-tighter text-black leading-[0.9] mb-8 font-[family-name:var(--font-family-headline)] min-h-[1.2em] flex items-center justify-center">
                {displayedText}
                <span className="inline-block w-2 md:w-[6px] h-[0.8em] bg-primary ml-2 animate-pulse align-middle" />
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant font-medium max-w-2xl mx-auto mb-10 leading-relaxed text-center min-h-[60px]">
                {heroEvents[currentSlide].description}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
                <div className="flex items-center gap-2 text-black">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  <span className="font-bold text-lg min-w-[120px]">{heroEvents[currentSlide].date}</span>
                </div>
                <div className="flex items-center gap-2 text-black">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <span className="font-bold text-lg min-w-[200px] text-center">{heroEvents[currentSlide].location}</span>
                </div>
              </div>
              <Link to={heroEvents[currentSlide].link}>
                <motion.button
                  className="group flex items-center gap-3 px-12 py-6 bg-primary text-white rounded-full font-bold text-xl shadow-xl shadow-primary/20"
                  whileHover={{ scale: 0.97 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Tickets
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            {heroEvents.map((_, idx) => (
              <div
                key={idx}
                onClick={() => handleIndicatorClick(idx)}
                className={`w-16 h-1.5 rounded-full cursor-pointer transition-all ${
                  currentSlide === idx ? 'bg-primary' : 'bg-outline-variant opacity-30 hover:opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category Selector */}
      <motion.section
        className="max-w-[1440px] mx-auto px-8 mb-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <h2 className="text-3xl font-black mb-10 tracking-tight">Browse by Category</h2>
        <div className="flex flex-wrap gap-4">
          {categories.map(cat => (
            <Link key={cat.slug} to={`/category/${cat.slug}`}>
              <motion.button
                className={`flex items-center gap-3 px-8 py-5 rounded-full transition-all ${
                  cat.active
                    ? 'bg-secondary-container text-on-secondary-fixed shadow-lg shadow-secondary-container/20 scale-105'
                    : 'bg-surface-container-low hover:bg-surface-container-high group'
                }`}
                whileHover={{ scale: cat.active ? 1.05 : 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className={`material-symbols-outlined ${cat.active ? '' : 'text-primary'}`}
                  style={cat.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {cat.icon}
                </span>
                <span className="font-bold">{cat.label}</span>
              </motion.button>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Experience Timeline */}
      <motion.section
        className="max-w-[1440px] mx-auto px-8 mb-24 overflow-hidden"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-sm font-black tracking-widest uppercase text-on-surface-variant">Your Event Schedule</h2>
          <div className="flex gap-2">
            <button className="p-2 border border-outline-variant rounded-full hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-2 border border-outline-variant rounded-full hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          {/* Browser Header Mock */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant/50 bg-white">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="bg-surface-container-low px-4 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant/60 max-w-[240px] w-full">
              booking.Utsova.tv
            </div>
          </div>
          {/* Timeline Header */}
          <div className="timeline-grid border-b border-outline-variant bg-surface-container-low/30">
            <div className="p-6 border-r border-outline-variant flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">dashboard</span>
              <span className="font-bold text-sm uppercase tracking-wider">My Events</span>
            </div>
            {['M 12','T 13','W 14','T 15','F 16','S 17','S 18','M 19','T 20','W 21','T 22','F 23','S 24','S 25'].map((d, i) => (
              <div key={d} className={`flex flex-col items-center justify-center p-3 border-r border-outline-variant/50 ${i === 7 ? 'bg-primary/5' : ''}`}>
                <span className={`text-[10px] ${i === 7 ? 'font-black text-primary' : 'font-bold text-on-surface-variant opacity-60'}`}>{d}</span>
              </div>
            ))}
          </div>

          {/* Timeline Rows */}
          <div className="relative">
            {/* Vertical grid lines */}
            <div className="absolute inset-0 pointer-events-none flex" style={{ paddingLeft: '200px' }}>
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className={`flex-1 border-r border-outline-variant/30 ${i === 7 ? 'bg-primary/5' : ''}`} />
              ))}
            </div>

            {/* Row 1: Concerts */}
            <div className="timeline-grid border-b border-outline-variant/30">
              <div className="p-8 border-r border-outline-variant bg-surface-container-lowest relative z-10">
                <p className="font-black text-sm mb-1">Concerts</p>
                <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">8 Events Scheduled</p>
              </div>
              <div className="col-span-14 relative p-4 h-24">
                <Link to="/event/sunburn-goa" className="absolute left-[7%] right-[45%] top-1/2 -translate-y-1/2 bg-white border border-outline-variant rounded-full p-2 pr-6 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">theater_comedy</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate">Sunburn Festival 2026</p>
                    <p className="text-[9px] text-on-surface-variant truncate">Vagator • 19:00</p>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-zinc-200 overflow-hidden"><img alt="u1" src={avatarUrls[0]} className="w-full h-full object-cover" /></div>
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-zinc-200 overflow-hidden"><img alt="u2" src={avatarUrls[1]} className="w-full h-full object-cover" /></div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Row 2: Dining */}
            <div className="timeline-grid border-b border-outline-variant/30">
              <div className="p-8 border-r border-outline-variant bg-surface-container-lowest relative z-10">
                <p className="font-black text-sm mb-1">Dining</p>
                <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">12 Events Scheduled</p>
              </div>
              <div className="col-span-14 relative p-4 h-24">
                <div className="absolute left-[35%] right-[20%] top-1/2 -translate-y-1/2 bg-surface-container-low border border-outline-variant rounded-full p-2 pr-6 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">restaurant</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate">Chef's Tasting Menu</p>
                    <p className="text-[9px] text-on-surface-variant truncate">BKC, Mumbai • 20:30</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
                </div>
              </div>
            </div>

            {/* Row 3: Open Mic */}
            <div className="timeline-grid">
              <div className="p-8 border-r border-outline-variant bg-surface-container-lowest relative z-10">
                <p className="font-black text-sm mb-1">Open Mic</p>
                <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">4 Events Scheduled</p>
              </div>
              <div className="col-span-14 relative p-4 h-24">
                <div className="absolute left-[58%] right-[5%] top-1/2 -translate-y-1/2 border-2 border-dashed border-outline-variant rounded-full p-2 pr-6 flex items-center gap-3 hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center group-hover:border-primary">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary">mic</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate text-on-surface-variant group-hover:text-primary">Open Mic at Hauz Khas</p>
                    <p className="text-[9px] text-on-surface-variant truncate">Pending RSVP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Trending Near You */}
      <motion.section
        className="max-w-[1440px] mx-auto px-8 mb-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-4xl font-black tracking-tight">Trending Events</h2>
          <Link to="/category/dining" className="text-sm font-bold underline decoration-2 underline-offset-8 decoration-secondary-container hover:text-secondary-container transition-colors">
            See All Events
          </Link>
        </div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-outline-variant p-8 rounded-[2rem] animate-pulse">
                <div className="h-24 bg-surface-container-low rounded-lg mb-4"></div>
                <div className="h-6 bg-surface-container-low rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-surface-container-low rounded w-1/2"></div>
              </div>
            ))
          ) : (
            // Use real events if available, otherwise fallback to mock
            (trendingEvents.length > 0 ? trendingEvents : trendingCards).slice(0, 3).map((item, i) => {
              // Check if it's a real event from backend
              const isRealEvent = item.id && item.slug
              const card = isRealEvent ? {
                location: `${item.city || 'India'} • ${new Date(item.start_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                title: item.title,
                status: item.available_capacity > 50 ? 'On Sale' : item.available_capacity > 0 ? 'Selling Fast' : 'Sold Out',
                statusColor: item.available_capacity > 50 ? 'bg-surface-container-high text-on-surface-variant' : item.available_capacity > 0 ? 'bg-secondary-container/20 text-secondary' : 'bg-error-container text-on-error-container',
                dotColor: item.available_capacity > 50 ? 'bg-outline' : item.available_capacity > 0 ? 'bg-secondary' : 'bg-error',
                price: item.min_price ? `₹${item.min_price}` : 'TBD',
                btnLabel: item.available_capacity > 0 ? 'View Event' : 'Join Waitlist',
                btnStyle: item.available_capacity > 0 ? 'border border-primary text-primary hover:bg-primary hover:text-white' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed',
                description: item.description || '',
                eventLink: `/event/${item.slug}`
              } : item

              return (
                <motion.div
                  key={isRealEvent ? item.id : card.title}
                  className="bg-white border border-outline-variant p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group flex flex-col gap-6 cursor-pointer"
                  variants={cardHover}
                  initial="rest"
                  whileHover="hover"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">{card.location}</p>
                      <h3 className="text-2xl font-black leading-tight">{card.title}</h3>
                    </div>
                    <div className="flex -space-x-3">
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 overflow-hidden"><img className="w-full h-full object-cover" src={avatarUrls[0]} alt="" /></div>
                      {i === 2 && <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold">+4</div>}
                      {i !== 2 && <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 overflow-hidden"><img className="w-full h-full object-cover" src={avatarUrls[1]} alt="" /></div>}
                    </div>
                  </div>
                  <div className={`inline-flex self-start items-center gap-2 px-3 py-1 ${card.statusColor} font-bold text-xs rounded-full`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${card.dotColor}`} />
                    {card.status}
                  </div>
                  <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                      {i === 0 ? 'Event Perks' : i === 1 ? 'Highlights' : 'Event Extras'}
                    </p>
                    {isRealEvent ? (
                      // For real events, show description or default perks
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg text-primary">check_circle</span>
                        <span className="text-sm font-medium">Tickets Available</span>
                      </div>
                    ) : (
                      // Mock event checklist
                      card.checklist.map(item => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-lg ${item.done ? 'text-primary' : 'text-outline-variant'}`}>
                            {item.done ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span className={`text-sm font-medium ${item.done ? '' : 'text-on-surface-variant'}`}>{item.label}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-auto pt-6 flex justify-between items-center">
                    <span className="text-lg font-black">{card.price}</span>
                    <Link to={isRealEvent ? card.eventLink : (card.btnLabel === 'Join Waitlist' ? '/waitlist' : '/event/sunburn-goa')}>
                      <button className={`px-6 py-2 text-xs font-black rounded-full transition-all ${card.btnStyle}`}>
                        {card.btnLabel}
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )
            })
          )}
        </motion.div>
      </motion.section>

      {/* Upcoming Global Events */}
      <motion.section
        className="bg-surface py-32 px-8"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-16">
            <span className="text-primary font-black tracking-widest uppercase text-xs mb-4 block">Featured Global Events</span>
            <h2 className="text-5xl font-black tracking-tighter">Upcoming Global Events</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Large Card 1 */}
            <motion.div
              className="bg-white border border-outline-variant p-10 rounded-[3rem] flex flex-col md:flex-row gap-10 cursor-pointer"
              whileHover={{ boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full md:w-1/2 aspect-square rounded-[2rem] overflow-hidden">
                <img alt="Event preview" className="w-full h-full object-cover" src="https://images.pexels.com/photos/3319726/pexels-photo-3319726.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1000&dpr=2" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-fixed text-[10px] font-black uppercase rounded-full">Dec 27-29</span>
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 overflow-hidden"><img className="w-full h-full object-cover" src={avatarUrls[0]} alt="" /></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 overflow-hidden"><img className="w-full h-full object-cover" src={avatarUrls[1]} alt="" /></div>
                  </div>
                </div>
                <h4 className="text-3xl font-black mb-2">Techfest IIT Bombay</h4>
                <p className="text-on-surface-variant text-sm mb-8">Asia's largest science and technology festival. Experience cutting-edge exhibitions, robotics, and EDM nights.</p>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">confirmation_number</span>
                    <span className="text-sm font-bold">VIP Passes Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline-variant">restaurant</span>
                    <span className="text-sm font-medium text-on-surface-variant">Catering included with ticket</span>
                  </div>
                </div>
                <Link to="/event/techfest-iitb">
                  <button className="mt-auto w-full py-4 bg-primary text-white font-black rounded-full hover:scale-95 transition-all">
                    Book Tickets Now
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Large Card 2 - Dark */}
            <motion.div
              className="bg-primary text-white p-10 rounded-[3rem] flex flex-col md:flex-row gap-10 cursor-pointer"
              whileHover={{ boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full md:w-1/2 aspect-square rounded-[2rem] overflow-hidden">
                <img alt="Event preview" className="w-full h-full object-cover" src="https://images.pexels.com/photos/4072509/pexels-photo-4072509.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1000&dpr=2" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-fixed text-[10px] font-black uppercase rounded-full">Dec 12-14</span>
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <h4 className="text-3xl font-black mb-2 text-white">Echoes of Earth</h4>
                <p className="text-zinc-400 text-sm mb-8">India's greenest music festival set in the lush outskirts of Bengaluru. Book your spot to secure entry before tickets sell out.</p>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary-container">star</span>
                    <span className="text-sm font-bold">Featured Artist Access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-zinc-600">group</span>
                    <span className="text-sm font-medium text-zinc-500">Group Booking Discounts</span>
                  </div>
                </div>
                <Link to="/event/echoes-of-earth">
                  <button className="mt-auto w-full py-4 bg-white text-black font-black rounded-full hover:scale-95 transition-all">
                    Buy Tickets
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </>
  )
}
