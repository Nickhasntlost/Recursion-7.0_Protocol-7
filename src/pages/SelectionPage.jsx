import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'

const seatLayout = [
  { row: 'A', seats: ['booked','booked','avail','avail','avail','avail','booked','booked'] },
  { row: 'B', seats: ['avail','selected','selected','avail','avail','avail','avail','avail'] },
  { row: 'C', seats: ['avail','avail','held','held','avail','avail','avail','avail'] },
  { row: 'D', seats: ['booked','avail','avail','avail','avail','avail','avail','booked'] },
]

const seatColors = {
  avail: 'bg-surface-container-highest hover:bg-secondary-container transition-colors cursor-pointer',
  selected: 'bg-primary ring-2 ring-primary ring-offset-2',
  booked: 'bg-outline-variant cursor-not-allowed',
  held: 'bg-secondary-container',
}

export default function SelectionPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-8 pt-8 pb-20">
      <motion.header
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <nav className="flex items-center text-sm font-medium text-on-surface-variant tracking-wide">
            <span>Events</span>
            <span className="material-symbols-outlined text-sm mx-2">chevron_right</span>
            <span>Selection</span>
          </nav>
          <div className="h-8 w-[1px] bg-outline-variant/30 hidden md:block" />
          <div className="bg-surface-container-lowest px-6 py-3 rounded-full flex items-center gap-3 shadow-sm border border-outline-variant/10">
            <div className="w-2 h-2 rounded-full bg-secondary-container" />
            <span className="font-[family-name:var(--font-family-headline)] font-bold text-lg tracking-tight">The Modernist Gala</span>
            <span className="text-on-surface-variant text-sm">• June 24, 2024</span>
          </div>
        </div>
        <div className="bg-error-container text-on-error-container px-5 py-3 rounded-full flex items-center gap-3 font-bold">
          <span className="material-symbols-outlined text-xl">timer</span>
          <span className="tracking-tighter">Seats held for 09:54</span>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Seat Map */}
        <motion.section
          className="lg:w-2/3"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-surface-container-low rounded-xl p-10 md:p-16 flex flex-col items-center">
            <div className="w-full max-w-2xl mb-20 text-center">
              <div className="h-1.5 w-full bg-outline-variant/40 rounded-full mb-4 overflow-hidden">
                <div className="h-full w-1/3 bg-primary/20 mx-auto rounded-full" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase">Grand Stage</span>
            </div>
            <div className="grid grid-cols-12 gap-3 md:gap-4 mb-16">
              {seatLayout.map(row => (
                <div key={row.row} className="contents">
                  <div className="col-span-1 flex items-center justify-end pr-4 text-xs font-bold text-on-surface-variant">{row.row}</div>
                  <div className="col-span-10 flex gap-2 md:gap-3 justify-center">
                    {row.seats.map((s, i) => (
                      <motion.button
                        key={`${row.row}-${i}`}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-md ${seatColors[s]}`}
                        whileHover={s === 'avail' ? { scale: 1.15 } : {}}
                        whileTap={s === 'avail' ? { scale: 0.95 } : {}}
                      />
                    ))}
                  </div>
                  <div className="col-span-1" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-8 py-6 px-10 bg-surface-container-lowest rounded-full border border-outline-variant/10 shadow-sm">
              {[{ color: 'bg-surface-container-highest', label: 'Available' }, { color: 'bg-primary', label: 'Selected' }, { color: 'bg-outline-variant', label: 'Booked' }, { color: 'bg-secondary-container', label: 'Held' }].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-sm ${l.color}`} />
                  <span className="text-xs font-semibold tracking-tight uppercase text-on-surface-variant">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Order Summary */}
        <motion.aside
          className="lg:w-1/3"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="sticky top-28 bg-surface-container-lowest p-8 rounded-xl shadow-[0_32px_64px_rgba(26,28,28,0.06)] flex flex-col gap-8">
            <div className="border-b border-surface-container-high pb-6">
              <h2 className="font-[family-name:var(--font-family-headline)] font-extrabold text-2xl tracking-tighter mb-1">Order Summary</h2>
              <p className="text-on-surface-variant text-sm tracking-wide">Premium Seating / Section A</p>
            </div>
            <div className="flex flex-col gap-4">
              {['Seat B-02', 'Seat B-03'].map(seat => (
                <div key={seat} className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-bold tracking-tight">{seat}</span>
                    <span className="text-xs text-on-surface-variant font-medium">Standard Admission</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-[family-name:var(--font-family-headline)] font-bold">$125.00</span>
                    <button className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-surface-container-low rounded-lg p-6 flex flex-col gap-3">
              <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Subtotal (2 tickets)</span><span className="font-medium">$250.00</span></div>
              <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Service Fees</span><span className="font-medium">$12.50</span></div>
              <div className="h-[1px] bg-outline-variant/20 my-2" />
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg tracking-tight">Total</span>
                <span className="font-[family-name:var(--font-family-headline)] font-black text-3xl tracking-tighter">$262.50</span>
              </div>
            </div>
            <Link to="/checkout">
              <motion.button
                className="w-full bg-primary text-on-primary py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue to Checkout
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.button>
            </Link>
            <p className="text-[10px] text-center uppercase tracking-[0.2em] text-on-surface-variant font-bold px-4 leading-relaxed">
              Prices include all applicable local taxes and venue facility charges.
            </p>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
