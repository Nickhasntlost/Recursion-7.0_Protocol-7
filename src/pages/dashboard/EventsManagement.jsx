import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const tabs = ['All Events', 'Published', 'Draft', 'Archived']

const mockEvents = [
  {
    id: 1,
    title: 'TechCon 2026',
    slug: 'techcon-2026',
    date: 'Dec 28-30, 2026',
    category: 'Conference',
    status: 'Published',
    bookings: 450,
    capacity: 500,
    revenue: '₹2,25,000',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Summer Music Festival',
    slug: 'summer-music-fest',
    date: 'Jan 15-16, 2027',
    category: 'Concert',
    status: 'Draft',
    bookings: 0,
    capacity: 1000,
    revenue: '₹0',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Art & Design Expo',
    slug: 'art-design-expo',
    date: 'Feb 20, 2027',
    category: 'Exhibition',
    status: 'Published',
    bookings: 120,
    capacity: 200,
    revenue: '₹48,000',
    image: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400&h=300&fit=crop'
  },
]

export default function EventsManagement() {
  const [activeTab, setActiveTab] = useState('All Events')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = mockEvents.filter(event => {
    const matchesTab = activeTab === 'All Events' || event.status === activeTab
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black font-[family-name:var(--font-family-headline)] tracking-tight mb-2">
            Events
          </h1>
          <p className="text-on-surface-variant text-lg">
            Manage all your events in one place
          </p>
        </div>

        <Link to="/dashboard/events/create">
          <motion.button
            className="flex items-center gap-3 px-8 py-4 bg-secondary-container text-on-secondary-fixed rounded-full font-bold shadow-lg shadow-secondary-container/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="material-symbols-outlined">add</span>
            Create Event
          </motion.button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-4 bg-surface-container-low px-6 py-3 rounded-full border border-outline-variant/20 focus-within:border-secondary-container/50 transition-all">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-on-surface-variant"
          />
        </div>

        <div className="flex gap-2 bg-surface-container-low p-2 rounded-full">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-secondary-container text-on-secondary-fixed'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {filteredEvents.map((event, idx) => (
          <motion.div
            key={event.id}
            className="group bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/20 hover:border-secondary-container/30 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(0,0,0,0.08)' }}
          >
            {/* Event Image */}
            <div className="aspect-video overflow-hidden relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className={`absolute top-4 right-4 px-4 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                event.status === 'Published'
                  ? 'bg-secondary-container/80 text-on-secondary-fixed'
                  : event.status === 'Draft'
                  ? 'bg-surface-container-high/80 text-on-surface'
                  : 'bg-error-container/80 text-on-error-container'
              }`}>
                {event.status}
              </span>
            </div>

            {/* Event Info */}
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary-container/20 text-secondary uppercase tracking-widest">
                    {event.category}
                  </span>
                  <span className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {event.date}
                  </span>
                </div>
                <h3 className="text-2xl font-black font-[family-name:var(--font-family-headline)] leading-tight mb-2">
                  {event.title}
                </h3>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-outline-variant/20">
                <div className="text-center">
                  <p className="text-2xl font-black">{event.bookings}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black">{event.capacity}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Capacity</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black">{event.revenue}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Revenue</p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit
                </button>
                <button className="flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">analytics</span>
                  Stats
                </button>
                <button className="flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-8xl text-on-surface-variant/20 mb-6 block">
            event_busy
          </span>
          <h3 className="text-2xl font-black mb-2">No events found</h3>
          <p className="text-on-surface-variant mb-8">
            {searchQuery ? 'Try a different search term' : 'Create your first event to get started'}
          </p>
          <Link to="/dashboard/events/create">
            <button className="px-8 py-4 bg-primary text-on-primary rounded-full font-bold">
              Create Event
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
