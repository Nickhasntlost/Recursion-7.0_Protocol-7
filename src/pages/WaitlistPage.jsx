import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function WaitlistPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-12 pb-24 space-y-8">
      {/* Header */}
      <motion.header
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-[family-name:var(--font-family-headline)] text-4xl md:text-5xl font-extrabold tracking-tight text-primary">Utsova</h1>
        <p className="text-on-surface-variant font-medium">Digital Arts Summit 2024</p>
      </motion.header>

      {/* Main Status Card */}
      <motion.section
        className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-sm border border-outline-variant/10 text-center space-y-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="inline-flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-secondary text-sm">calendar_today</span>
          <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant">OCT 24—26 • NYC</span>
        </div>

        <div className="space-y-1">
          <motion.div
            className="font-[family-name:var(--font-family-headline)] text-8xl md:text-9xl font-black tracking-tighter text-primary"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 15 }}
          >
            #7
          </motion.div>
          <div className="inline-block px-4 py-1 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold tracking-wide">
            WAITLIST POSITION
          </div>
        </div>

        <p className="text-on-surface-variant max-w-sm mx-auto leading-relaxed">
          You're moving fast. We estimate your spot will be ready within the next 48 hours.
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center items-center gap-2 md:gap-3 py-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            />
          ))}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-6 h-6 bg-secondary-container rounded-full animate-ping opacity-75" />
            <motion.div
              className="relative w-4 h-4 md:w-5 md:h-5 bg-secondary-container border-2 border-secondary rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9 }}
            />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`f-${i}`}
              className="w-3 h-3 md:w-4 md:h-4 border-2 border-outline-variant rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0 + i * 0.08 }}
            />
          ))}
        </div>
      </motion.section>

      {/* Auto-Allocation Alert */}
      <motion.section
        className="bg-secondary-container rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 justify-between border-l-8 border-secondary"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="flex items-start gap-4">
          <div className="bg-on-secondary-container/10 p-2 rounded-lg">
            <span className="material-symbols-outlined text-on-secondary-container">auto_awesome</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-on-secondary-container">Spot reserved for you!</h3>
            <div className="flex items-center gap-2 text-sm text-on-secondary-container/80 font-medium">
              <span className="material-symbols-outlined text-xs">timer</span>
              <span>09:42 minutes left to claim</span>
            </div>
          </div>
        </div>
        <Link to="/checkout">
          <motion.button
            className="w-full md:w-auto bg-primary text-on-primary px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2"
            whileHover={{ scale: 0.97 }}
            whileTap={{ scale: 0.95 }}
          >
            Confirm Now
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </motion.button>
        </Link>
      </motion.section>

      {/* Notification Preferences */}
      <motion.section
        className="bg-surface-container-low rounded-xl p-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Alert Preferences</h3>
          <span className="text-xs text-on-surface-variant font-medium">Notify me via</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { icon: 'mail', label: 'Email', active: true },
            { icon: 'chat_bubble', label: 'SMS', active: false },
            { icon: 'phone_iphone', label: 'WhatsApp', active: false },
          ].map(n => (
            <button
              key={n.label}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${
                n.active
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-bright'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Exit */}
      <div className="flex justify-center pt-4">
        <button className="text-error font-semibold flex items-center gap-2 px-6 py-2 rounded-full hover:bg-error-container/50 transition-colors">
          <span className="material-symbols-outlined text-sm">logout</span>
          Leave Waitlist
        </button>
      </div>
    </div>
  )
}
