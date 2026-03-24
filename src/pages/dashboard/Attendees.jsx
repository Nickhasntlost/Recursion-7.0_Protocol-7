import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const attendeeStats = [
  { label: 'Total Attendees', value: '8,542', icon: 'groups' },
  { label: 'Checked In', value: '6,911', icon: 'how_to_reg' },
  { label: 'No Show Rate', value: '9.8%', icon: 'event_busy' },
  { label: 'Avg. Rating', value: '4.7/5', icon: 'star' },
]

const recentAttendees = [
  { name: 'Aarav Mehta', event: 'TechCon 2026', ticket: 'VIP', status: 'Checked In', joinedAt: '09:12 AM' },
  { name: 'Naina Kapoor', event: 'Food Carnival', ticket: 'Standard', status: 'Registered', joinedAt: '10:05 AM' },
  { name: 'Rohan Sharma', event: 'Startup Mixer', ticket: 'Early Bird', status: 'Checked In', joinedAt: '10:17 AM' },
  { name: 'Ishita Verma', event: 'Design Summit', ticket: 'Standard', status: 'Waitlisted', joinedAt: '10:28 AM' },
]

export default function Attendees() {
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
          <h2 className="text-2xl font-black mb-2">Loading Attendees</h2>
          <p className="text-on-surface-variant">Preparing check-in and engagement details...</p>
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
          Attendees
        </h1>
        <p className="text-on-surface-variant text-lg">
          Monitor registrations, check-ins, and attendee quality across events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {attendeeStats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-secondary">{stat.icon}</span>
            </div>
            <p className="text-3xl font-black mb-1">{stat.value}</p>
            <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6">
          <h2 className="text-2xl font-black mb-1">Recent Attendee Activity</h2>
          <p className="text-sm text-on-surface-variant mb-6">Newest sign-ups and check-ins from active events.</p>

          <div className="space-y-3">
            {recentAttendees.map((attendee) => (
              <div key={`${attendee.name}-${attendee.event}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-surface-container-low rounded-2xl">
                <div className="md:col-span-2">
                  <p className="font-bold">{attendee.name}</p>
                  <p className="text-sm text-on-surface-variant">{attendee.event}</p>
                </div>
                <p className="text-sm font-bold">{attendee.ticket}</p>
                <p className="text-sm text-on-surface-variant">{attendee.joinedAt}</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${
                  attendee.status === 'Checked In'
                    ? 'bg-secondary-container text-on-secondary-fixed'
                    : attendee.status === 'Registered'
                    ? 'bg-surface-container-high text-on-surface'
                    : 'bg-error-container text-on-error-container'
                }`}>
                  {attendee.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6">
          <h2 className="text-2xl font-black mb-5">Audience Segments</h2>
          <div className="space-y-4">
            {[
              { name: 'Students', share: 34 },
              { name: 'Professionals', share: 42 },
              { name: 'Creators', share: 14 },
              { name: 'Others', share: 10 },
            ].map((segment) => (
              <div key={segment.name}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm">{segment.name}</p>
                  <p className="text-sm text-on-surface-variant">{segment.share}%</p>
                </div>
                <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${segment.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
