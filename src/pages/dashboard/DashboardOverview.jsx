import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const stats = [
  { label: 'Total Events', value: '24', change: '+12%', icon: 'event', color: 'primary' },
  { label: 'Total Bookings', value: '1,429', change: '+23%', icon: 'confirmation_number', color: 'secondary' },
  { label: 'Revenue', value: '₹2.4M', change: '+18%', icon: 'payments', color: 'primary' },
  { label: 'Attendees', value: '8,542', change: '+31%', icon: 'people', color: 'secondary' },
]

const recentEvents = [
  { title: 'TechCon 2026', date: 'Dec 28-30', status: 'Published', bookings: 450, capacity: 500, revenue: '₹225,000' },
  { title: 'Music Festival', date: 'Jan 15-16', status: 'Draft', bookings: 0, capacity: 1000, revenue: '₹0' },
  { title: 'Art Exhibition', date: 'Feb 20', status: 'Published', bookings: 120, capacity: 200, revenue: '₹48,000' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
}

export default function DashboardOverview() {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="mb-12">
        <h1 className="text-5xl font-black font-[family-name:var(--font-family-headline)] tracking-tight mb-2">
          {greeting} 👋
        </h1>
        <p className="text-on-surface-variant text-lg">
          Here's what's happening with your events today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 hover:border-secondary-container/30 transition-all group"
            whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-full bg-secondary-container/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl text-secondary">
                  {stat.icon}
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed">
                {stat.change}
              </span>
            </div>
            <h3 className="text-4xl font-black font-[family-name:var(--font-family-headline)] mb-2">
              {stat.value}
            </h3>
            <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="group flex items-center gap-4 p-6 rounded-3xl bg-secondary-container text-on-secondary-fixed hover:scale-[1.02] transition-all shadow-lg shadow-secondary-container/20">
          <span className="material-symbols-outlined text-3xl">add_circle</span>
          <div className="text-left">
            <p className="font-black text-lg">Create Event</p>
            <p className="text-sm opacity-80">Start a new event</p>
          </div>
          <span className="material-symbols-outlined ml-auto group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </button>

        <button className="group flex items-center gap-4 p-6 rounded-3xl bg-surface-container-low hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-3xl text-secondary">qr_code_scanner</span>
          <div className="text-left">
            <p className="font-black text-lg">Scan Tickets</p>
            <p className="text-sm text-on-surface-variant">Check-in attendees</p>
          </div>
        </button>

        <button className="group flex items-center gap-4 p-6 rounded-3xl bg-surface-container-low hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-3xl text-secondary">download</span>
          <div className="text-left">
            <p className="font-black text-lg">Export Report</p>
            <p className="text-sm text-on-surface-variant">Download analytics</p>
          </div>
        </button>
      </motion.div>

      {/* Recent Events Table */}
      <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)]">
            Recent Events
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all text-sm font-bold">
            View All
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        <div className="space-y-4">
          {recentEvents.map((event, idx) => (
            <motion.div
              key={idx}
              className="flex items-center gap-6 p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer group"
              whileHover={{ x: 4 }}
            >
              <div className="flex-1">
                <h3 className="font-black text-lg mb-1">{event.title}</h3>
                <p className="text-sm text-on-surface-variant">{event.date}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black">{event.bookings}/{event.capacity}</p>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Bookings</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-black">{event.revenue}</p>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Revenue</p>
                </div>

                <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                  event.status === 'Published'
                    ? 'bg-secondary-container text-on-secondary-fixed'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {event.status}
                </span>

                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Activity Feed */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20">
          <h3 className="text-xl font-black font-[family-name:var(--font-family-headline)] mb-6">
            Revenue Overview
          </h3>
          <div className="h-64 flex items-center justify-center bg-surface-container-low rounded-2xl">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
                show_chart
              </span>
              <p className="text-sm text-on-surface-variant">Chart visualization</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20">
          <h3 className="text-xl font-black font-[family-name:var(--font-family-headline)] mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { action: 'New booking', detail: 'TechCon 2026 - 2 tickets', time: '5 min ago', icon: 'confirmation_number' },
              { action: 'Event published', detail: 'Music Festival', time: '1 hour ago', icon: 'publish' },
              { action: 'Payment received', detail: '₹12,500', time: '2 hours ago', icon: 'payments' },
              { action: 'New attendee', detail: 'John Doe registered', time: '3 hours ago', icon: 'person_add' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-all">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary text-[18px]">
                    {activity.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{activity.action}</p>
                  <p className="text-sm text-on-surface-variant">{activity.detail}</p>
                </div>
                <span className="text-xs text-on-surface-variant whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
