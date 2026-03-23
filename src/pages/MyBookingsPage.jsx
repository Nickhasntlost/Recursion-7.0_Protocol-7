import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const bookings = [
  {
    id: 'ASM-92840-X',
    badge: 'Premier Access',
    status: 'Confirmed',
    statusStyle: 'bg-secondary-container/30 text-secondary',
    dotColor: 'bg-secondary',
    title: 'The Kinetic Symphony: Digital Realism',
    date: 'Saturday, 24 October 2024 • 19:00',
    location: 'Grand Atelier, District 9',
    category: 'Digital Art',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpgktUx3JS0wpGXZhdkasukLppB6Of_hr66Sju2I2eOinFM_TrlsMgpPZDegDaDsXCURbwt4t2GChavuhwwa818686rnNWyJ1z4DNdc28dPFFpAJ7rfnq6IZlr7V7SIG7Ir_JkDfK9wubRXvyi0pHnY9fcZiRVmvI-cr6Z5Zw7bi3UrPbFaCoTrcrsWM4yRuaETgy5poT63pRafhcakXjdFbYVtVahJ57rlSkJEevXjfThQxz6-Lv0F9UHXn71RDkJiPag5Z2Rc28',
  },
  {
    id: 'ASM-11029-Y',
    badge: '',
    status: 'Processing',
    statusStyle: 'bg-surface-container-high text-on-surface-variant',
    dotColor: 'bg-on-surface-variant',
    title: 'Vinyl Echoes: Private Listening',
    date: 'Monday, 02 November 2024 • 20:30',
    location: 'The Velvet Lounge',
    category: 'Music',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK9GTq5Z_F4NTVAvhAjkGzzAQLvjU04WiWVrTGwKrxmJZQFH3UyLSieFYs4o5AXDu5Ff8p21Cjwx5R7kJ4O1EDlLYAaGsEkUYflVXYMrVYCLjNE0TGZZ3vT7OgaQvwDXhmECnXMAyVFKhwg8GNix4N9oRh_nN3FcsoSs2AaiUY4unyBGaUcIpT30Al3MkpEyWqruO_uCf1mG9CE9IXCCjMCaCWuWAGpPju8R5ts9AlbyjL2gpcPSL568IOdiP4dPx2DOsGFjmrb7Q',
  },
  {
    id: 'ASM-77213-Z',
    badge: '',
    status: 'Confirmed',
    statusStyle: 'bg-secondary-container/30 text-secondary',
    dotColor: 'bg-secondary',
    title: 'Culinary Alchemists: Mixology Masterclass',
    date: 'Friday, 15 November 2024 • 18:00',
    location: 'Neo-Gastronomy Lab',
    category: 'Gastronomy',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk1YpKYFEYblJNTk5fvD-yLaydN53QpiypIx8_VZy5VNFFlpg3vOCYMNhAaHKs1rkR2BDeUXQx834qmdzHZIy_IYrjHtJr2t0e6Zy8As1CM8LyxLMeUYWt89stYDUgU9YFIgxaAaOpQSJILqkfcknqkzk5LxelQP3tyo69lVH3G17VOYq__lmLkwjRVqsuRfEh_GoFCuRT4rbB4R_DLaDST0OpZUw2wx3PNOFmNxT69BOovUbU7-82SSDIPJor3ab50n1D7wg7XlA',
  },
]

const cardHover = {
  rest: { y: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' },
  hover: { y: -4, boxShadow: '0 32px 64px -12px rgba(26,28,28,0.06)', transition: { duration: 0.3 } }
}

export default function MyBookingsPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-8 pt-16 pb-24">
      <motion.header
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-[family-name:var(--font-family-headline)] text-5xl font-extrabold tracking-tighter text-primary mb-8">My Bookings</h1>
        <div className="flex flex-wrap gap-2 items-center bg-surface-container-low p-1.5 rounded-full w-fit">
          {['Upcoming', 'Past', 'Waitlisted', 'Cancelled'].map((tab, i) => (
            <button key={tab} className={`px-8 py-2.5 rounded-full text-sm font-medium font-[family-name:var(--font-family-headline)] transition-all ₹{i === 0 ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              {tab}
            </button>
          ))}
        </div>
      </motion.header>

      <div className="grid grid-cols-1 gap-8">
        {bookings.map((b, i) => (
          <motion.div
            key={b.id}
            className="group relative flex flex-col md:flex-row bg-surface-container-lowest rounded-xl overflow-hidden"
            variants={cardHover}
            initial="rest"
            whileHover="hover"
          >
            <div className="w-full md:w-1/3 h-64 md:h-auto relative overflow-hidden">
              <img alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={b.img} />
              {b.badge && (
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">{b.badge}</span>
                </div>
              )}
            </div>
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">ID: {b.id}</span>
                  <div className={`flex items-center gap-2 ₹{b.statusStyle} px-3 py-1 rounded-full`}>
                    <span className={`w-1.5 h-1.5 rounded-full ₹{b.dotColor}`} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{b.status}</span>
                  </div>
                </div>
                <h2 className="font-[family-name:var(--font-family-headline)] text-3xl font-bold tracking-tight text-primary mb-6">{b.title}</h2>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-xl">calendar_today</span>
                    <span className="text-sm font-medium">{b.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-xl">location_on</span>
                    <span className="text-sm font-medium">{b.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-surface-container">
                <div className="flex items-center gap-4">
                  <Link to="/confirmation">
                    <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-[family-name:var(--font-family-headline)] font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all">
                      View Ticket
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </Link>
                  <button className="text-on-surface-variant font-[family-name:var(--font-family-headline)] font-bold text-sm hover:text-error transition-colors px-4 py-3">
                    Cancel
                  </button>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs text-on-surface-variant font-medium">Category: {b.category}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
