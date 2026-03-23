import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Mock event data
const mockEventsList = [
  {
    id: 1,
    title: 'TechCon 2026',
    category: 'conference',
    start_datetime: '2026-12-28T09:00',
    end_datetime: '2026-12-30T18:00',
    description: 'Annual technology conference bringing together innovators and leaders',
    status: 'Published',
    bookings: 450,
    capacity: 500,
    revenue: 225000,
    tickets: [
      { type: 'Regular', price: 500, quantity: 300, sold: 200 },
      { type: 'VIP', price: 1000, quantity: 100, sold: 85 },
      { type: 'Student', price: 250, quantity: 100, sold: 165 }
    ]
  },
  {
    id: 2,
    title: 'Summer Music Festival',
    category: 'concert',
    start_datetime: '2027-01-15T18:00',
    end_datetime: '2027-01-16T23:00',
    description: 'Three-day music festival featuring international and local artists',
    status: 'Draft',
    bookings: 0,
    capacity: 1000,
    revenue: 0,
    tickets: [
      { type: 'Early Bird', price: 800, quantity: 500, sold: 0 },
      { type: 'Regular', price: 1200, quantity: 500, sold: 0 }
    ]
  },
  {
    id: 3,
    title: 'Art & Design Expo',
    category: 'exhibition',
    start_datetime: '2027-02-20T10:00',
    end_datetime: '2027-02-20T18:00',
    description: 'Contemporary art exhibition showcasing emerging artists',
    status: 'Published',
    bookings: 120,
    capacity: 200,
    revenue: 48000,
    tickets: [
      { type: 'General Entry', price: 400, quantity: 200, sold: 120 }
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
}

export default function StatsEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [eventData, setEventData] = useState(null)

  useEffect(() => {
    const event = mockEventsList.find(e => e.id === parseInt(eventId))
    if (event) {
      setEventData(event)
    }
  }, [eventId])

  if (!eventData) {
    return (
      <div className="text-center py-20">
        <div className="inline-block">
          <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center animate-spin">
            <span className="material-symbols-outlined text-2xl text-secondary">hourglass_empty</span>
          </div>
          <p className="mt-4 text-on-surface-variant">Loading event...</p>
        </div>
      </div>
    )
  }

  const totalTicketsSold = eventData.tickets.reduce((sum, t) => sum + t.sold, 0)
  const totalTicketsAvailable = eventData.tickets.reduce((sum, t) => sum + t.quantity, 0)
  const conversionRate = eventData.capacity > 0 ? ((eventData.bookings / eventData.capacity) * 100).toFixed(1) : 0
  const avgTicketPrice = eventData.bookings > 0 ? (eventData.revenue / eventData.bookings).toFixed(0) : 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-5xl font-black font-[family-name:var(--font-family-headline)] tracking-tight mb-2">
              Event Analytics
            </h1>
            <p className="text-on-surface-variant text-lg">
              {eventData.title}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-4 py-2 rounded-full text-xs font-bold ${
            eventData.status === 'Published'
              ? 'bg-secondary-container text-on-secondary-fixed'
              : 'bg-surface-container-high text-on-surface'
          }`}>
            {eventData.status}
          </span>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20"
          whileHover={{ y: -4 }}
        >
          <p className="text-on-surface-variant text-sm font-bold mb-3 uppercase tracking-widest">Total Bookings</p>
          <h3 className="text-5xl font-black mb-2">{eventData.bookings}</h3>
          <div className="w-full bg-surface-container-low rounded-full h-2">
            <div
              className="bg-secondary-container rounded-full h-2"
              style={{ width: `${conversionRate}%` }}
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-2 font-bold">{conversionRate}% Capacity</p>
        </motion.div>

        <motion.div
          className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20"
          whileHover={{ y: -4 }}
        >
          <p className="text-on-surface-variant text-sm font-bold mb-3 uppercase tracking-widest">Total Revenue</p>
          <h3 className="text-5xl font-black text-secondary mb-2">₹{eventData.revenue.toLocaleString()}</h3>
          <p className="text-xs text-on-surface-variant font-bold">From {eventData.bookings} attendees</p>
        </motion.div>

        <motion.div
          className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20"
          whileHover={{ y: -4 }}
        >
          <p className="text-on-surface-variant text-sm font-bold mb-3 uppercase tracking-widest">Avg Ticket Price</p>
          <h3 className="text-5xl font-black mb-2">₹{avgTicketPrice}</h3>
          <p className="text-xs text-on-surface-variant font-bold">Per attendee</p>
        </motion.div>

        <motion.div
          className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20"
          whileHover={{ y: -4 }}
        >
          <p className="text-on-surface-variant text-sm font-bold mb-3 uppercase tracking-widest">Available Slots</p>
          <h3 className="text-5xl font-black text-secondary mb-2">{eventData.capacity - eventData.bookings}</h3>
          <p className="text-xs text-on-surface-variant font-bold">Out of {eventData.capacity}</p>
        </motion.div>
      </motion.div>

      {/* Ticket Distribution & Revenue Breakdown */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket Distribution */}
        <motion.div
          className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20"
          whileHover={{ y: -4 }}
        >
          <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)] mb-8">
            Ticket Distribution
          </h2>

          <div className="space-y-6">
            {eventData.tickets.map((ticket, idx) => {
              const sellPercentage = (ticket.sold / ticket.quantity) * 100
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-lg">{ticket.type}</p>
                    <div className="text-right">
                      <p className="font-black text-secondary">{ticket.sold}</p>
                      <p className="text-xs text-on-surface-variant">of {ticket.quantity}</p>
                    </div>
                  </div>
                  <div className="relative w-full bg-surface-container-low rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-secondary-container to-secondary rounded-full h-3"
                      initial={{ width: 0 }}
                      animate={{ width: `${sellPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-secondary mt-2 font-bold">{sellPercentage.toFixed(1)}% Sold</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Revenue Breakdown */}
        <motion.div
          className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20"
          whileHover={{ y: -4 }}
        >
          <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)] mb-8">
            Revenue Breakdown
          </h2>

          <div className="space-y-4">
            {eventData.tickets.map((ticket, idx) => {
              const ticketRevenue = ticket.sold * ticket.price
              const percentOfTotal = eventData.revenue > 0 ? ((ticketRevenue / eventData.revenue) * 100).toFixed(1) : 0
              return (
                <motion.div
                  key={idx}
                  className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold">{ticket.type}</p>
                    <p className="text-secondary text-sm font-bold">₹{ticketRevenue.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <p>{ticket.sold} tickets @ ₹{ticket.price}</p>
                    <p>{percentOfTotal}% of total</p>
                  </div>
                </motion.div>
              )
            })}

            <div className="border-t border-outline-variant/20 pt-4 mt-6">
              <div className="p-4 rounded-2xl bg-secondary-container/10">
                <div className="flex items-center justify-between">
                  <p className="font-black text-lg">Total Revenue</p>
                  <p className="text-2xl font-black text-secondary">₹{eventData.revenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Detailed Stats Table */}
      <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20">
        <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)] mb-8">
          Detailed Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Event Capacity', value: eventData.capacity, icon: 'group' },
            { label: 'Current Bookings', value: eventData.bookings, icon: 'person_add' },
            { label: 'Remaining Capacity', value: eventData.capacity - eventData.bookings, icon: 'person_outline' },
            { label: 'Total Tickets Available', value: totalTicketsAvailable, icon: 'confirmation_number' },
            { label: 'Total Tickets Sold', value: totalTicketsSold, icon: 'check_circle' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, icon: 'trending_up' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary-container/20">
                  <span className="material-symbols-outlined text-secondary text-2xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pro Tip */}
      <motion.div
        className="bg-secondary-container/10 rounded-3xl p-8 border border-secondary-container/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-2xl text-secondary shrink-0">
            lightbulb
          </span>
          <div>
            <h3 className="font-black text-lg mb-2 text-on-surface">Analytics Insight</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {conversionRate >= 80
                ? 'Your event is almost at full capacity! Consider increasing ticket prices or creating a waitlist.'
                : conversionRate >= 50
                ? 'Good momentum! Keep promoting to reach full capacity.'
                : conversionRate > 0
                ? 'Still early! Increase your marketing efforts to boost bookings.'
                : 'Event not yet launched. Publish and promote to start getting bookings!'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <button
          onClick={() => navigate('/dashboard/events')}
          className="flex items-center gap-2 px-8 py-4 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Events
        </button>

        <button
          onClick={() => navigate(`/dashboard/events/${eventData.id}/edit`)}
          className="flex items-center gap-2 px-8 py-4 rounded-full bg-secondary-container text-on-secondary-fixed hover:scale-[0.98] transition-all font-bold shadow-lg shadow-secondary-container/20"
        >
          <span className="material-symbols-outlined">edit</span>
          Edit Event
        </button>
      </motion.div>
    </motion.div>
  )
}
