import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Settings() {
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
          <h2 className="text-2xl font-black mb-2">Loading Settings</h2>
          <p className="text-on-surface-variant">Preparing account and platform preferences...</p>
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
          Settings
        </h1>
        <p className="text-on-surface-variant text-lg">
          Control organizer profile, notifications, and dashboard behavior.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6 space-y-5">
          <h2 className="text-2xl font-black">Organizer Profile</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
              <span className="font-bold">Display Name</span>
              <span className="text-on-surface-variant">Utsova Events</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
              <span className="font-bold">Support Email</span>
              <span className="text-on-surface-variant">support@utsova.com</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
              <span className="font-bold">Timezone</span>
              <span className="text-on-surface-variant">Asia/Kolkata</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6 space-y-5">
          <h2 className="text-2xl font-black">Notification Preferences</h2>
          <div className="space-y-3">
            {[
              'Booking confirmation alerts',
              'Payment settlement summaries',
              'Waitlist conversion nudges',
              'Campaign performance digest',
            ].map((setting) => (
              <div key={setting} className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <span className="font-bold text-sm">{setting}</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed">Enabled</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
