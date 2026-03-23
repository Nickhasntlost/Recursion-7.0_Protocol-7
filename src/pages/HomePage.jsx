import { Link } from 'react-router-dom'
import { motion, useMotionValueEvent, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import api from '../services/api'


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
  const [eventsData, setEventsData] = useState([])
  const [dynamicHeroEvents, setDynamicHeroEvents] = useState([])
  const [dynamicTrending, setDynamicTrending] = useState([])
  const [globalEvents, setGlobalEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [currentSlide, setCurrentSlide] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.classList.contains('theme-dark')
  })

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events')
        const data = res.data
        if (data && data.length > 0) {
          setEventsData(data)
          
          const featured = data.filter(e => e.is_featured).slice(0, 3).map(e => ({
            tag: e.category.toUpperCase(),
            title: e.title,
            description: e.description,
            date: new Date(e.start_datetime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            location: 'Event Venue',
            link: `/event/${e.id}`,
            cover: e.cover_image
          }))
          if (featured.length > 0) setDynamicHeroEvents(featured)
          
          const trending = data.slice(0, 3).map(e => ({
            location: `India • ${new Date(e.start_datetime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
            title: e.title,
            status: 'Selling Fast',
            statusColor: 'bg-secondary-container/20 text-secondary',
            dotColor: 'bg-secondary',
            cover: e.cover_image,
            checklist: [
              { label: 'E-Tickets Only', done: true },
              { label: 'Limited Capacity', done: true },
            ],
            price: `₹${e.min_price}`,
            btnLabel: 'Book Tickets',
            btnStyle: 'bg-primary text-white',
            link: `/event/${e.id}`
          }))
          if (trending.length > 0) setDynamicTrending(trending)

          const globals = data.filter(e => !e.is_featured).slice(0, 2).map(e => ({
            date: new Date(e.start_datetime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            title: e.title,
            description: e.description,
            cover: e.cover_image,
            link: `/event/${e.id}`
          }))
          if (globals.length > 0) setGlobalEvents(globals)
        } else {
          setError('No events found in database.')
        }
      } catch (err) {
        console.error("Error fetching events:", err)
        setError('Failed to load events from the backend.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const syncThemeState = () => setIsDarkTheme(root.classList.contains('theme-dark'))
    syncThemeState()

    const observer = new MutationObserver(syncThemeState)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  // Semantic states defined above

  useEffect(() => {
    const currentTitle = dynamicHeroEvents[currentSlide]?.title || ''
    let timeout

    if (!isDeleting && displayedText === currentTitle) {
      timeout = setTimeout(() => setIsDeleting(true), 2500)
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false)
      setCurrentSlide((prev) => (prev + 1) % dynamicHeroEvents.length)
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

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col gap-4 items-center justify-center font-bold text-xl text-on-surface-variant">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        Connecting to the Live Backend...
      </div>
    )
  }

  if (error || dynamicHeroEvents.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col gap-4 items-center justify-center text-center px-4">
        <span className="material-symbols-outlined text-6xl text-error mb-4">cloud_off</span>
        <h2 className="font-bold text-2xl mb-2">Backend Connection Failed</h2>
        <p className="text-on-surface-variant max-w-md">
          {error || 'No live events found. Please ensure the FastAPI backend is running on port 8000 and the MongoDB database is seeded with data.'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="px-4 md:px-8 mb-20 relative overflow-hidden">
        <div className="relative w-full h-[870px] rounded-xl bg-surface-container-low flex items-center justify-center text-center overflow-hidden">
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
                {dynamicHeroEvents[currentSlide]?.tag}
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black leading-[0.9] mb-8 font-[family-name:var(--font-family-headline)] min-h-[1.2em] flex items-center justify-center">
                {displayedText}
                <span className="inline-block w-2 md:w-[6px] h-[0.8em] bg-primary ml-2 animate-pulse align-middle" />
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant font-medium max-w-2xl mx-auto mb-10 leading-relaxed text-center min-h-[60px]">
                {dynamicHeroEvents[currentSlide]?.description}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
                <div className="flex items-center gap-2 text-black">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  <span className="font-bold text-lg min-w-[120px]">{dynamicHeroEvents[currentSlide]?.date}</span>
                </div>
                <div className="flex items-center gap-2 text-black">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <span className="font-bold text-lg min-w-[200px] text-center">{dynamicHeroEvents[currentSlide]?.location}</span>
                </div>
              </div>
              <Link to={dynamicHeroEvents[currentSlide]?.link || '#'}>
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
            {dynamicHeroEvents.map((_, idx) => (
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
          {dynamicTrending.map((card, i) => (
            <motion.div
              key={card.title}
              className="bg-white border border-outline-variant p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group flex flex-col gap-6 cursor-pointer"
              variants={cardHover}
              initial="rest"
              whileHover="hover"
            >
              {/* Cover Image */}
              {card.cover && (
                <div className="w-full h-40 rounded-xl overflow-hidden mb-2 -mt-2">
                  <img src={card.cover} alt={card.title} className="w-full h-full object-cover" />
                </div>
              )}
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
                {card.checklist.map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-lg ${item.done ? 'text-primary' : 'text-outline-variant'}`}>
                      {item.done ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={`text-sm font-medium ${item.done ? '' : 'text-on-surface-variant'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-6 flex justify-between items-center">
                <span className="text-lg font-black">{card.price}</span>
                <Link to={card.link || '#'}>
                  <button className={`px-6 py-2 text-xs font-black rounded-full transition-all ${card.btnStyle}`}>
                    {card.btnLabel}
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
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
            {globalEvents.map((evt, idx) => (
              <motion.div
                key={idx}
                className={`${idx === 1 ? 'bg-primary text-white cursor-pointer' : 'bg-white border border-outline-variant cursor-pointer'} p-10 rounded-[3rem] flex flex-col md:flex-row gap-10`}
                whileHover={{ boxShadow: idx === 1 ? '0 25px 50px rgba(0,0,0,0.2)' : '0 25px 50px rgba(0,0,0,0.1)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full md:w-1/2 aspect-square rounded-[2rem] overflow-hidden">
                  <img alt={evt.title} className="w-full h-full object-cover" src={evt.cover || "https://images.pexels.com/photos/3319726/pexels-photo-3319726.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1000&dpr=2"} />
                </div>
                <div className="w-full md:w-1/2 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-fixed text-[10px] font-black uppercase rounded-full">{evt.date}</span>
                    {idx === 1 ? <span className="material-symbols-outlined">auto_awesome</span> : (
                      <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 overflow-hidden"><img className="w-full h-full object-cover" src={avatarUrls[0]} alt="" /></div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 overflow-hidden"><img className="w-full h-full object-cover" src={avatarUrls[1]} alt="" /></div>
                      </div>
                    )}
                  </div>
                  <h4 className={`text-3xl font-black mb-2 ${idx === 1 ? 'text-white' : ''}`}>{evt.title}</h4>
                  <p className={`${idx === 1 ? 'text-zinc-400' : 'text-on-surface-variant'} text-sm mb-8 line-clamp-3`}>{evt.description}</p>
                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${idx === 1 ? 'text-secondary-container' : 'text-primary'}`}>confirmation_number</span>
                      <span className="text-sm font-bold">Featured Access</span>
                    </div>
                  </div>
                  <Link to={evt.link}>
                    <button className={`mt-auto w-full py-4 font-black rounded-full hover:scale-95 transition-all ${idx === 1 ? 'bg-white text-black' : 'bg-primary text-white'}`}>
                      Book Tickets Now
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </>
  )
}
