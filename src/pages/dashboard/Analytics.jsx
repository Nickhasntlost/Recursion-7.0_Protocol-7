import { motion } from 'framer-motion'

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-black font-[family-name:var(--font-family-headline)] tracking-tight mb-2">
          Analytics
        </h1>
        <p className="text-on-surface-variant text-lg">
          Track your event performance and insights
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-surface-container-lowest rounded-3xl p-20 border border-outline-variant/20 text-center">
        <span className="material-symbols-outlined text-9xl text-on-surface-variant/20 mb-6 block">
          analytics
        </span>
        <h3 className="text-3xl font-black mb-4">Analytics Dashboard</h3>
        <p className="text-on-surface-variant max-w-md mx-auto">
          Advanced analytics and reporting features coming soon. Track revenue, attendance, and engagement metrics.
        </p>
      </div>
    </div>
  )
}
