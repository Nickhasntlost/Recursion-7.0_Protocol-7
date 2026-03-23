import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Success Identity */}
      <motion.div
        className="flex flex-col items-center mb-12 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <span className="material-symbols-outlined text-on-secondary-container text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </motion.div>
        <h1 className="font-[family-name:var(--font-family-headline)] font-black text-6xl md:text-8xl tracking-tighter text-primary mb-4">You're In.</h1>
        <p className="text-on-surface-variant text-lg max-w-md font-medium">Your entry to the Assemble collection is confirmed. We've sent a copy to your email.</p>
      </motion.div>

      {/* Ticket Card */}
      <motion.div
        className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_32px_64px_-12px_rgba(26,28,28,0.06)] overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="h-48 w-full bg-surface-container-high relative">
          <img className="w-full h-full object-cover grayscale brightness-90" alt="Event space" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLLz71GmEkkq9mnak3d6R3zd23xvs_J1G9yEovatIc0_WQAO8yoTD-6-0uTCYYU-WWEFZ5f24l_uXUWr5Ksr1-ErovYY1vAtFRlaeV7ECNXHqo5zj1s52qzfWt2jmCeTzc7sA-FKJQ-XAfejlED96HxFVxy2LKTFlRMoyG9xdBKU3RWC41R3AtkVMYPntpnujBYgDLJvHlzB8t2aJX5JLOvMjbkb-Cs-MWxwA2R1iNJBdlo_ajyCiO76LXeGkxeZeQHvsRhStuBdY" />
          <div className="absolute top-6 left-6">
            <span className="bg-secondary-fixed text-on-secondary-fixed font-[family-name:var(--font-family-headline)] text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">Confirmed</span>
          </div>
        </div>
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-1">Booking ID</p>
              <p className="font-[family-name:var(--font-family-headline)] font-bold text-sm">ASM-9920-X2</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-1">Status</p>
              <p className="font-[family-name:var(--font-family-headline)] font-bold text-sm">Valid</p>
            </div>
          </div>
          <h2 className="font-[family-name:var(--font-family-headline)] font-extrabold text-3xl text-primary mb-6 leading-tight">The Modernist Manifesto: Live Editorial</h2>
          <div className="space-y-4 mb-8">
            {[
              { icon: 'calendar_today', label: 'Date & Time', value: 'Oct 24, 2024 • 7:00 PM' },
              { icon: 'location_on', label: 'Venue', value: 'The Curated Pavilion, London' },
              { icon: 'event_seat', label: 'Seats', value: 'Row F, Seat 12 & 14' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">{item.label}</p>
                  <p className="font-[family-name:var(--font-family-headline)] font-bold text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Perforated Divider */}
          <div className="relative flex items-center py-4 mb-4">
            <div className="flex-grow border-t-2 border-dashed border-surface-container-high" />
            <div className="absolute -left-12 w-8 h-8 bg-surface rounded-full" />
            <div className="absolute -right-12 w-8 h-8 bg-surface rounded-full" />
          </div>
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-surface-container-low rounded-lg flex items-center justify-center p-4 border border-outline-variant/10">
              <img className="w-full h-full mix-blend-multiply opacity-90" alt="QR Code" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApXHWLbhtYwxwCH4S89-VWeYPtWNoBx42Dy2gxsN8a7nNKv47YzgUyxdigmLVTd888-x5T4cvcaQ4nHGx09oD2QStOyjRaX2KjvDarZ6Z4mtLQBPWeCjRlCZQWGewo0rdysRF8lkdEPGMf2Fui1w0ZLuJkVV7319TJk4iPB0MpZgnC2xKOK9WvYYh301tD0Dp6k9G4bUWfKFuT2nGGr-6eyqoQc4tvOhXnQy5H-lkRQjf7niqj_F4j6GjwtVn_5ooMe-l9CgcIG4I" />
            </div>
            <p className="mt-4 text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">Scan at Entrance</p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="mt-12 flex flex-col md:flex-row items-center gap-4 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <button className="w-full bg-primary text-on-primary font-[family-name:var(--font-family-headline)] font-bold py-5 px-8 rounded-full flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95">
          Download Ticket
          <span className="material-symbols-outlined text-xl">download</span>
        </button>
        <div className="flex gap-4 w-full">
          <button className="flex-1 bg-surface-container-high text-primary font-[family-name:var(--font-family-headline)] font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors">
            Calendar
            <span className="material-symbols-outlined text-lg">calendar_add_on</span>
          </button>
          <Link to="/my-bookings" className="flex-1">
            <button className="w-full border border-outline-variant/30 text-on-surface-variant font-[family-name:var(--font-family-headline)] font-bold py-4 px-6 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors">
              My Bookings
            </button>
          </Link>
        </div>
      </motion.div>
      <Link to="/" className="mt-12 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Return to Explore
      </Link>
    </div>
  )
}
