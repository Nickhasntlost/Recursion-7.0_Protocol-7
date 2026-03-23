import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
}

const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  hover: { y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', transition: { duration: 0.3, ease: 'easeOut' } }
}

const avatarUrls = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBui7wRyNhmPpprBqnjS4uY1YxLKZaLISSPzDl-QR8s2j5AJjSCat7wumW3vH9dFA42SuqgPUhVXJLvfCGSiU8hJ4Jhy0exv_anFmPRNUc4Zx5PLKPMIzfKWMkHH9sZlJZ1rAtW0A03Fa1K34a-NeGa7EnuY9GPQHugXh0NFNAuxoLvG0DQL9Q2guA4ib-J7zfEMHLEe4XqaiXx7ZNw8cvmtrzKVoTSeB3_MXP3YN9AzKSktYnBmVYO2bnsk5VA5_lWkTDlgey5-i4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCW7RpMtxO7Adqrpc-7JgEckpTQoX3U99DkdZxWcs0mzOC3w8mXnir-wpUjWadr9PfRuDWXwP5eip9VUgt5gaY0wMcvlWy_cj4jzoAByDc1koTmW24OjGE7bTEjdmtLX1YjW1VMxntFeEiMU6G7P2n6T73KtE9OEyNswjimnV78kLywHmRgX8mND10dk5CuAKtwe7mGfmjzG1H1Pg96Y7u7bQdhBKydUfvc0e3ne8OfH3sBYiQ0ckXRuJnDgo4egj6XsFpQ0kgtG1I',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAoSXqwLej5Kg-0b4_eWwJKnKRxjfb4RSYLvrkJHzAQKPaf05JriIZQMB3WslSTNPeRuWjuSqyP0lKd3gy3HD3zf3uG0vrruiA--TBFz6XI_VUF2tA7bzpKi8OYquqAZuUlBXkJIOva8y68GS_3hfOOq0dj5--231CrpyLog4yKjN5vPvkeRDV2M2qSbwn8kbppZV9APYJBygL-2rjs0Q1HL1IJgpfhEkKCPR_u_l_w1xSpL4SbyUOvG7s8FKxRKSJNCox6Z6r4q0E',
]

const cards = [
  {
    badge: 'Michelin Star',
    available: true,
    availableLabel: 'Available',
    title: "A Priori: The Chef's Secret Table Experience",
    location: 'Upper West Side, Manhattan',
    date: 'Sat, Nov 24',
    time: '19:30 — 22:00',
    price: '$245',
    people: 12,
    bookable: true,
  },
  {
    badge: 'Pop-Up Series',
    available: false,
    availableLabel: 'Waitlist Only',
    title: 'Midnight in Kyoto: Omakase & Jazz',
    location: 'Brooklyn Heights',
    date: 'Sun, Nov 25',
    time: '21:00 — 00:00',
    price: '$180',
    people: 4,
    bookable: false,
  },
  {
    badge: 'Seasonal Gala',
    available: true,
    availableLabel: 'Limited',
    title: 'The Winter Harvest Banquet at Solaris',
    location: 'Tribeca Rooftop',
    date: 'Thu, Nov 29',
    time: '18:00 — 22:30',
    price: '$310',
    people: 42,
    bookable: true,
  },
]

export default function CategoryListingPage() {
  const { slug } = useParams()
  const title = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Dining'

  return (
    <div className="min-h-screen flex max-w-screen-2xl mx-auto px-8 gap-12">
      {/* Left Sidebar */}
      <aside className="hidden md:block w-[240px] flex-shrink-0 pt-8 pb-12 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
        <div className="space-y-10">
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Filter</h3>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">near_me</span>
              <select className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-full text-sm font-bold appearance-none focus:ring-2 focus:ring-secondary-container transition-all cursor-pointer">
                <option>New York, NY</option>
                <option>London, UK</option>
                <option>Paris, FR</option>
              </select>
            </div>
          </section>
          <section>
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-50">Timeline</h4>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold transition-transform active:scale-95">Today</button>
              <button className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold hover:bg-surface-container-highest transition-colors">Weekend</button>
              <button className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold hover:bg-surface-container-highest transition-colors">Next Week</button>
            </div>
          </section>
          <section>
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-50">Price Range</h4>
            <div className="flex items-center gap-2">
              <input className="w-full px-4 py-2 bg-surface-container-low border-none rounded-full text-xs font-bold focus:ring-2 focus:ring-secondary-container" placeholder="Min" type="text" />
              <span className="text-neutral-300">—</span>
              <input className="w-full px-4 py-2 bg-surface-container-low border-none rounded-full text-xs font-bold focus:ring-2 focus:ring-secondary-container" placeholder="Max" type="text" />
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between p-1 bg-surface-container-low rounded-full">
              <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-full bg-secondary-container text-on-secondary-fixed">Available Only</button>
              <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-full text-neutral-400">All Events</button>
            </div>
          </section>
          <button className="w-full bg-primary text-white py-4 rounded-full font-black text-sm tracking-widest uppercase hover:scale-[0.98] transition-transform shadow-lg shadow-black/5">
            Apply
          </button>
        </div>
      </aside>

      {/* Main Listing Area */}
      <div className="flex-1 pt-8 pb-20">
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="opacity-30">/</span>
          <span className="text-primary">{title}</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <h1 className="text-6xl font-black tracking-tighter">{title}</h1>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Sort By</span>
            <button className="flex items-center gap-2 font-black text-sm group">
              Recommended
              <span className="material-symbols-outlined text-sm group-hover:translate-y-0.5 transition-transform">expand_more</span>
            </button>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {cards.map((card, i) => (
            <motion.article
              key={card.title}
              className="bg-white rounded-xl p-8 shadow-sm transition-all duration-500 border border-transparent hover:border-surface-container-highest group flex flex-col h-full"
              variants={cardHover}
              initial="rest"
              whileHover="hover"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{card.badge}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src={avatarUrls[0]} alt="" />
                      <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src={avatarUrls[i % 3]} alt="" />
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-[10px] font-bold">+{card.people}</div>
                    </div>
                  </div>
                </div>
                <div className={`${card.available ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant'} px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${card.available ? 'bg-on-secondary-fixed animate-pulse' : 'bg-on-surface-variant/30'}`} />
                  {card.availableLabel}
                </div>
              </div>
              <h3 className="text-2xl font-black leading-tight mb-6 flex-grow">{card.title}</h3>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  <span className="text-sm font-medium">{card.location}</span>
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                  <span className="text-sm font-medium">{card.date}</span>
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                  <span className="text-sm font-medium">{card.time}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-surface-container">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block">{card.bookable ? 'From' : 'Price'}</span>
                  <span className="text-xl font-black">{card.price}</span>
                </div>
                <Link to={card.bookable ? '/event/great-revival' : '/waitlist'}>
                  <button className={`${card.bookable ? 'bg-black text-white' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'} px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform`}>
                    {card.bookable ? 'Book Now' : 'Join Waitlist'}
                    {card.bookable && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                  </button>
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Pagination */}
        <div className="mt-20 flex items-center justify-center gap-4">
          <button className="w-12 h-12 rounded-full border border-surface-container-high flex items-center justify-center hover:bg-white hover:shadow-md transition-all text-neutral-400 hover:text-black">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex items-center gap-2">
            <button className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm bg-black text-white">1</button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm hover:bg-surface-container-low transition-colors">2</button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm hover:bg-surface-container-low transition-colors">3</button>
            <span className="px-2 opacity-30 tracking-widest font-black">...</span>
            <button className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm hover:bg-surface-container-low transition-colors">12</button>
          </div>
          <button className="w-12 h-12 rounded-full border border-surface-container-high flex items-center justify-center hover:bg-white hover:shadow-md transition-all text-neutral-400 hover:text-black">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
