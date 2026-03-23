import { motion } from 'framer-motion'

export default function DeleteSuccessNotification({ isVisible, eventTitle }) {
  return (
    <motion.div
      className="fixed bottom-8 right-8 max-w-md z-50"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="bg-surface-container-lowest rounded-3xl border-2 border-secondary-container p-6 shadow-2xl">
        {/* Icon + Message */}
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            className="p-3 rounded-full bg-secondary-container shrink-0"
            initial={{ scale: 0 }}
            animate={isVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
          >
            <span className="material-symbols-outlined text-2xl text-on-secondary-fixed">
              check
            </span>
          </motion.div>
          <div className="flex-1">
            <h3 className="font-black text-lg mb-1">Event Deleted Successfully!</h3>
            <p className="text-sm text-on-surface-variant">
              "{eventTitle}" has been removed from your account.
            </p>
          </div>
        </div>

        {/* Notification Status */}
        <div className="bg-surface-container-low rounded-2xl p-4 space-y-2 mb-4">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Attendee Notifications Sent
          </p>
          <div className="space-y-2">
            <motion.div
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ delay: 0.2 }}
            >
              <span className="material-symbols-outlined text-base text-secondary">check_circle</span>
              <span className="text-on-surface">Email notifications sent</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ delay: 0.3 }}
            >
              <span className="material-symbols-outlined text-base text-secondary">check_circle</span>
              <span className="text-on-surface">In-app notifications sent</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ delay: 0.4 }}
            >
              <span className="material-symbols-outlined text-base text-secondary">check_circle</span>
              <span className="text-on-surface">All registered attendees notified</span>
            </motion.div>
          </div>
        </div>

        {/* Status */}
        <p className="text-xs text-on-surface-variant">
          Redirecting you back to events in a few seconds...
        </p>

        {/* Progress Bar */}
        <motion.div
          className="h-1 bg-secondary-container rounded-full mt-4"
          initial={{ scaleX: 1 }}
          animate={isVisible ? { scaleX: 0 } : { scaleX: 1 }}
          transition={{ duration: 3, ease: 'linear' }}
          style={{ originX: 0 }}
        />
      </div>
    </motion.div>
  )
}
