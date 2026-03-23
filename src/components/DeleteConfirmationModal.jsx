import { motion, AnimatePresence } from 'framer-motion'

export default function DeleteConfirmationModal({ isOpen, eventTitle, onConfirm, onCancel, isLoading }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-full bg-error-container">
                  <span className="material-symbols-outlined text-2xl text-error">
                    warning
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)]">
                    Delete Event?
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6 mb-8">
                <div>
                  <p className="text-on-surface-variant mb-3">
                    You're about to permanently delete:
                  </p>
                  <p className="text-2xl font-black bg-surface-container-high p-4 rounded-2xl">
                    {eventTitle}
                  </p>
                </div>

                {/* Notification Info */}
                <div className="bg-secondary-container/20 rounded-2xl p-4 border border-secondary-container/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-lg text-secondary shrink-0 mt-0.5">
                      notifications_active
                    </span>
                    <div>
                      <p className="font-bold text-sm mb-2 text-on-surface">Attendees Will Be Notified</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        All {0} registered attendees will receive an automatic cancellation notification via:
                      </p>
                      <ul className="text-xs text-on-surface-variant mt-2 space-y-1 ml-4">
                        <li>✓ Email notification</li>
                        <li>✓ In-app notification</li>
                        <li>✓ SMS notification (if opted in)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Consequence */}
                <div className="bg-error-container/10 rounded-2xl p-4 border border-error-container/30">
                  <p className="text-xs text-error font-bold uppercase tracking-widest mb-2">
                    This action cannot be undone
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    The event and all associated bookings will be permanently deleted from your account.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold transition-all disabled:opacity-50"
                >
                  Keep Event
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-full bg-error text-error-container font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-error-container border-t-transparent animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Delete Event
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
