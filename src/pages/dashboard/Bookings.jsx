import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const bookingStats = [
  { label: 'Total Bookings', value: '3,264', icon: 'confirmation_number' },
  { label: 'Pending Payments', value: '184', icon: 'hourglass_top' },
  { label: 'Refund Requests', value: '23', icon: 'currency_exchange' },
  { label: 'Conversion Rate', value: '16.8%', icon: 'trending_up' },
]

const recentBookings = [
  { id: 'BK-9021', customer: 'Priya Singh', event: 'TechCon 2026', amount: 'INR 4,999', status: 'Confirmed' },
  { id: 'BK-9018', customer: 'Vikram Rao', event: 'Music Wave', amount: 'INR 2,499', status: 'Pending' },
  { id: 'BK-9012', customer: 'Nisha Patel', event: 'Startup Mixer', amount: 'INR 1,499', status: 'Confirmed' },
  { id: 'BK-9005', customer: 'Arjun Nair', event: 'Design Summit', amount: 'INR 3,499', status: 'Refunded' },
]

export default function Bookings() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl px-10 py-12 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-secondary-container border-t-secondary animate-spin mx-auto mb-5" />
          <h2 className="text-2xl font-black mb-2">Loading Bookings</h2>
          <p className="text-on-surface-variant">Collecting reservation and payment activity...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-5xl font-black font-[family-name:var(--font-family-headline)] tracking-tight mb-2">
          Bookings
        </h1>
        <p className="text-on-surface-variant text-lg">
          Track reservation flow, payment health, and recent booking activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {bookingStats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6">
            <span className="material-symbols-outlined text-secondary">{stat.icon}</span>
            <p className="text-3xl font-black mt-4 mb-1">{stat.value}</p>
            <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6">
        <h2 className="text-2xl font-black mb-5">Recent Bookings</h2>
        <div className="space-y-3">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-surface-container-low rounded-2xl">
              <p className="font-bold">{booking.id}</p>
              <p>{booking.customer}</p>
              <p className="text-on-surface-variant">{booking.event}</p>
              <p className="font-bold">{booking.amount}</p>
              <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${
                booking.status === 'Confirmed'
                  ? 'bg-secondary-container text-on-secondary-fixed'
                  : booking.status === 'Pending'
                  ? 'bg-surface-container-high text-on-surface'
                  : 'bg-error-container text-on-error-container'
              }`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
