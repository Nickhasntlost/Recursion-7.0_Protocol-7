import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const analyticsStats = [
  { label: 'Gross Revenue', value: 'INR 4.8M', trend: '+16%', icon: 'payments' },
  { label: 'Tickets Sold', value: '3,264', trend: '+11%', icon: 'confirmation_number' },
  { label: 'Avg. Fill Rate', value: '82%', trend: '+7%', icon: 'groups' },
  { label: 'Repeat Buyers', value: '39%', trend: '+5%', icon: 'repeat' },
]

const channelBreakdown = [
  { channel: 'Instagram Ads', sessions: 6240, conversions: '8.7%', revenue: 'INR 1.6M' },
  { channel: 'Email Campaigns', sessions: 2920, conversions: '12.1%', revenue: 'INR 1.1M' },
  { channel: 'Organic Search', sessions: 4180, conversions: '6.4%', revenue: 'INR 940K' },
  { channel: 'Partner Referrals', sessions: 980, conversions: '18.2%', revenue: 'INR 760K' },
]

const funnel = [
  { stage: 'Event Views', value: 19420, completion: 100 },
  { stage: 'Ticket Selection', value: 8320, completion: 43 },
  { stage: 'Checkout Started', value: 4780, completion: 25 },
  { stage: 'Payment Complete', value: 3264, completion: 17 },
]

export default function Analytics() {
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
          <h2 className="text-2xl font-black mb-2">Loading Analytics</h2>
          <p className="text-on-surface-variant">Fetching insights and campaign performance...</p>
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
          Analytics
        </h1>
        <p className="text-on-surface-variant text-lg">
          Understand revenue, funnel conversion, and campaign quality in one view.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {analyticsStats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20">
            <div className="flex items-center justify-between mb-5">
              <span className="material-symbols-outlined text-secondary">{stat.icon}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed">
                {stat.trend}
              </span>
            </div>
            <p className="text-3xl font-black mb-1">{stat.value}</p>
            <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6">
          <h2 className="text-2xl font-black mb-1">Acquisition Channels</h2>
          <p className="text-sm text-on-surface-variant mb-6">Performance of top traffic sources in the last 30 days.</p>

          <div className="space-y-4">
            {channelBreakdown.map((item) => (
              <div key={item.channel} className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-surface-container-low text-sm">
                <p className="font-bold col-span-2">{item.channel}</p>
                <p className="text-on-surface-variant">{item.sessions.toLocaleString()} visits</p>
                <p className="font-bold text-right">{item.conversions}</p>
                <p className="col-span-3 text-on-surface-variant">Revenue</p>
                <p className="font-bold text-right">{item.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6">
          <h2 className="text-2xl font-black mb-1">Booking Funnel</h2>
          <p className="text-sm text-on-surface-variant mb-6">Drop-off visibility from discovery to payment completion.</p>

          <div className="space-y-5">
            {funnel.map((row) => (
              <div key={row.stage}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold">{row.stage}</p>
                  <p className="text-sm text-on-surface-variant">{row.value.toLocaleString()}</p>
                </div>
                <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${row.completion}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
