import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const campaigns = [
  { name: 'Summer Music Push', channel: 'Instagram + Reel Ads', budget: 'INR 120K', roi: '3.4x', status: 'Active' },
  { name: 'TechCon Early Bird', channel: 'Email + Retargeting', budget: 'INR 90K', roi: '4.1x', status: 'Active' },
  { name: 'Food Carnival Launch', channel: 'Influencer Collab', budget: 'INR 65K', roi: '2.8x', status: 'Optimizing' },
]

const automationSteps = [
  { label: 'Welcome Email Sequence', progress: 100 },
  { label: 'Abandoned Checkout Reminder', progress: 74 },
  { label: 'Post Event Feedback Loop', progress: 58 },
  { label: 'Referral Incentive Campaign', progress: 36 },
]

export default function Marketing() {
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
          <h2 className="text-2xl font-black mb-2">Loading Marketing</h2>
          <p className="text-on-surface-variant">Building campaign snapshots and automation health...</p>
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
          Marketing
        </h1>
        <p className="text-on-surface-variant text-lg">
          Plan campaigns, track ROI, and keep automation funnels healthy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Campaign Spend', value: 'INR 275K', icon: 'paid' },
          { label: 'Leads Generated', value: '5,480', icon: 'ads_click' },
          { label: 'Avg ROI', value: '3.4x', icon: 'trending_up' },
          { label: 'CTR', value: '6.9%', icon: 'bolt' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6">
            <span className="material-symbols-outlined text-secondary">{stat.icon}</span>
            <p className="text-3xl font-black mt-4 mb-1">{stat.value}</p>
            <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6">
          <h2 className="text-2xl font-black mb-1">Campaign Performance</h2>
          <p className="text-sm text-on-surface-variant mb-6">Live view of active campaign efficiency and return.</p>

          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.name} className="p-5 bg-surface-container-low rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h3 className="font-black text-lg">{campaign.name}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    campaign.status === 'Active'
                      ? 'bg-secondary-container text-on-secondary-fixed'
                      : 'bg-surface-container-high text-on-surface'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">{campaign.channel}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p className="text-on-surface-variant">Budget</p>
                  <p className="font-bold text-right">{campaign.budget}</p>
                  <p className="text-on-surface-variant">Return</p>
                  <p className="font-bold text-right">{campaign.roi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6">
          <h2 className="text-2xl font-black mb-5">Automation Health</h2>
          <div className="space-y-4">
            {automationSteps.map((step) => (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm">{step.label}</p>
                  <p className="text-sm text-on-surface-variant">{step.progress}%</p>
                </div>
                <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${step.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-secondary-container/20">
            <p className="font-bold mb-1">Next Action</p>
            <p className="text-sm text-on-surface-variant">Boost reminder campaign for abandoned checkouts before weekend traffic spike.</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
